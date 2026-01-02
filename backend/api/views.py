from rest_framework import views, response, status
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
import json
import os
from rest_framework.response import Response

from .models import UserProfile, TestResult
from .serializers import UserProfileSerializer, TestResultSerializer
from .ml_engine import predict_xray
from .storage import upload_to_supabase
from .pdf_generator import generate_medical_pdf  # Ensure you created this file as discussed

class UserProfileView(views.APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        data = request.data
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        # --- ROBUST ROLE PROTECTION & LOGIC ---
        current_role = str(profile.role).strip().lower() if profile.role else ""
        requested_role = data.get('role', 'patient').strip().lower()
        
        if current_role == 'doctor':
            pass 
        else:
            if requested_role == 'doctor':
                provided_code = data.get('access_code')
                secure_code = os.getenv('DOCTOR_ACCESS_CODE')
                
                if provided_code and provided_code == secure_code:
                    profile.role = 'doctor'
                else:
                    return response.Response(
                        {"error": "Invalid Access Code. Administrator privileges denied."}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
            else:
                profile.role = 'patient'
        # --------------------------------

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
            # Check permissions: Doctors can see all, Patients only their own
            if hasattr(request.user, 'profile') and request.user.profile.role == 'doctor':
                test_result = get_object_or_404(TestResult, pk=pk)
            else:
                test_result = get_object_or_404(TestResult, pk=pk, patient__user=request.user)
                
            pdf_buffer = generate_medical_pdf(test_result)
            
            # Return the PDF as a binary blob
            filename = f"RespireX_Report_{test_result.id}.pdf"
            response = HttpResponse(pdf_buffer, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            
            return response
            
        except Exception as e:
                print(f"Error generating PDF: {e}") # Ensure the error is logged
                return Response({"error": "Failed to generate report"}, status=500)