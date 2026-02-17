from rest_framework import views, response, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
import json
import os
from rest_framework.response import Response

# Added Appointment
from .models import UserProfile, TestResult, Appointment
# Added AppointmentSerializer
from .serializers import UserProfileSerializer, TestResultSerializer, AppointmentSerializer
from .ml_engine import predict_xray
from .storage import upload_to_supabase
from .pdf_generator import generate_medical_pdf 
# Added send_appointment_status_email
from .email_utils import send_html_email, get_medical_email_template, send_appointment_status_email

class UserProfileView(views.APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        data = request.data
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        current_role = str(profile.role).strip().lower() if profile.role else ""
        requested_role = data.get('role', 'patient').strip().lower()
        
        if current_role == 'doctor':
            pass 
        else:
            if requested_role == 'doctor':
                provided_code = data.get('access_code')
                secure_code = "e63ecb7857b348c5a79645c92578f5260defd2bde982bf823b8f66f5133fea52"
                
                if provided_code and str(provided_code).strip() == secure_code:
                    profile.role = 'doctor'
                else:
                    return response.Response(
                        {"error": "Invalid Access Code. Administrator privileges denied."}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
            else:
                profile.role = 'patient'

        profile.state = data.get('state', '')
        profile.city = data.get('city', '')
        profile.age = data.get('age')
        profile.gender = data.get('gender', '')
        profile.license_number = data.get('licenseNumber', None)
        profile.full_name = data.get('full_name', '')
        profile.phone = data.get('phone', '')
        profile.address = data.get('address', '')
        
        profile.save()
        return response.Response(UserProfileSerializer(profile).data)

    def get(self, request):
        try:
            profile = request.user.profile
            return response.Response(UserProfileSerializer(profile).data)
        except UserProfile.DoesNotExist:
            return response.Response({"error": "Profile not found"}, status=404)

class PredictionView(views.APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            user_profile = request.user.profile
        except UserProfile.DoesNotExist:
            return response.Response({"error": "Complete profile first"}, status=400)

        image_file = request.FILES.get('file')
        symptoms = request.data.get('symptoms', '{}')
        
        if not image_file:
            return response.Response({"error": "No image provided"}, status=400)

        try:
            image_url = upload_to_supabase(image_file)
        except Exception as e:
            return response.Response({"error": f"Image upload failed: {str(e)}"}, status=500)
        
        image_file.seek(0)
        result, confidence, risk_level = predict_xray(image_file)
        
        test_record = TestResult.objects.create(
            patient=user_profile,
            xray_image_url=image_url,
            result=result,
            confidence_score=confidence,
            risk_level=risk_level,
            symptoms_data=json.loads(symptoms) if isinstance(symptoms, str) else symptoms
        )
        
        return response.Response(TestResultSerializer(test_record).data)

class EmailReportView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            if hasattr(request.user, 'profile') and request.user.profile.role == 'doctor':
                test_result = get_object_or_404(TestResult, pk=pk)
            else:
                test_result = get_object_or_404(TestResult, pk=pk, patient__user=request.user)
            
            pdf_buffer = generate_medical_pdf(test_result)
            
            patient_name = test_result.patient.full_name or request.user.username
            date_str = test_result.date_tested.strftime('%B %d, %Y')
            
            html_body = get_medical_email_template(
                patient_name=patient_name,
                test_date=date_str,
                risk_level=test_result.risk_level,
                confidence=round(test_result.confidence_score, 1)
            )

            send_html_email(
                subject=f"RespireX Screening Report - {date_str}",
                recipient_list=[request.user.email],
                html_content=html_body,
                pdf_buffer=pdf_buffer,
                filename=f"RespireX_Report_{test_result.id}.pdf"
            )

            return response.Response({"message": "Email sent successfully"})

        except Exception as e:
            print(f"Email Error: {e}")
            return response.Response({"error": "Failed to send email"}, status=500)

class PatientHistoryView(views.APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            profile = request.user.profile
            results = TestResult.objects.filter(patient=profile).order_by('-date_tested')
            return response.Response(TestResultSerializer(results, many=True).data)
        except UserProfile.DoesNotExist:
            return response.Response({"error": "Profile not found"}, status=404)
        except Exception as e:
            return response.Response({"error": str(e)}, status=500)

class DoctorDashboardView(views.APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            profile = request.user.profile
            if profile.role != 'doctor':
                return response.Response({"error": "Unauthorized"}, status=403)
        except UserProfile.DoesNotExist:
            return response.Response({"error": "Profile not found"}, status=404)
            
        state_filter = request.query_params.get('state', 'all')
        queryset = TestResult.objects.all().select_related('patient').order_by('-date_tested')
        
        if state_filter != 'all':
            queryset = queryset.filter(patient__state__iexact=state_filter)
            
        return response.Response({
            "doctor_name": profile.full_name,
            "stats": {
                "total": queryset.count(),
                "positive": queryset.filter(result='Positive').count(),
                "negative": queryset.filter(result='Negative').count(),
                "underReview": 0 
            },
            "records": TestResultSerializer(queryset, many=True).data
        })

class DownloadReportView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            if hasattr(request.user, 'profile') and request.user.profile.role == 'doctor':
                test_result = get_object_or_404(TestResult, pk=pk)
            else:
                test_result = get_object_or_404(TestResult, pk=pk, patient__user=request.user)
                
            pdf_buffer = generate_medical_pdf(test_result)
            
            filename = f"RespireX_Report_{test_result.id}.pdf"
            response = HttpResponse(pdf_buffer, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            
            return response
            
        except Exception as e:
            return Response({"error": "Failed to generate report"}, status=500)

class PublicStatsView(views.APIView):
    permission_classes = [AllowAny] 

    def get(self, request):
        total_count = TestResult.objects.count()
        return response.Response({"total_tests": total_count})

# --- APPOINTMENT SYSTEM VIEWS ---

class DoctorListView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        doctors = UserProfile.objects.filter(role='doctor')
        return response.Response(UserProfileSerializer(doctors, many=True).data)

class AppointmentView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.profile
            if profile.role == 'doctor':
                appointments = Appointment.objects.filter(doctor=profile).order_by('date_time')
            else:
                appointments = Appointment.objects.filter(patient=profile).order_by('date_time')
            
            return response.Response(AppointmentSerializer(appointments, many=True).data)
        except UserProfile.DoesNotExist:
            return response.Response({"error": "Profile not found"}, status=404)

    def post(self, request):
        try:
            patient_profile = request.user.profile
            doctor_id = request.data.get('doctor_id')
            date_time = request.data.get('date_time')
            reason = request.data.get('reason', '')

            if not doctor_id or not date_time:
                return response.Response({"error": "Doctor and Date are required"}, status=400)

            try:
                doctor_profile = UserProfile.objects.get(id=doctor_id, role='doctor')
            except UserProfile.DoesNotExist:
                return response.Response({"error": "Selected doctor not found"}, status=404)

            appointment = Appointment.objects.create(
                patient=patient_profile,
                doctor=doctor_profile,
                date_time=date_time,
                reason=reason,
                status='pending'
            )
            return response.Response(AppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return response.Response({"error": str(e)}, status=400)

class AppointmentStatusView(views.APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            appointment = Appointment.objects.get(pk=pk)
            # Permission check
            if request.user.profile != appointment.doctor and request.user.profile != appointment.patient:
                return response.Response({"error": "Unauthorized"}, status=403)

            new_status = request.data.get('status')
            doctor_note = request.data.get('doctor_note', '')

            # If user selects "Request Reschedule" (or 'cancelled'), we treat it as cancelled 
            # but allow a custom email with the note.
            if new_status in dict(Appointment.STATUS_CHOICES):
                appointment.status = new_status
                appointment.save()

                # --- TRIGGER EMAIL NOTIFICATION ---
                if appointment.patient.user.email:
                    # Determine formatted date
                    formatted_date = appointment.date_time.strftime('%B %d, %Y at %I:%M %p')
                    
                    send_appointment_status_email(
                        recipient_email=appointment.patient.user.email,
                        patient_name=appointment.patient.full_name or "Patient",
                        doctor_name=appointment.doctor.full_name or "Doctor",
                        appointment_date=formatted_date,
                        status=new_status,
                        doctor_note=doctor_note
                    )
                # ----------------------------------

                return response.Response(AppointmentSerializer(appointment).data)
            return response.Response({"error": "Invalid status"}, status=400)
            
        except Appointment.DoesNotExist:
            return response.Response({"error": "Appointment not found"}, status=404)