from rest_framework import views, response, status
from .models import UserProfile, TestResult
from .serializers import UserProfileSerializer, TestResultSerializer
from .ml_engine import predict_xray
from .storage import upload_to_supabase
import json
import os # Import OS to read .env
from rest_framework.permissions import IsAuthenticated

class UserProfileView(views.APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        data = request.data
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        # --- ROBUST ROLE PROTECTION & LOGIC ---
        # Normalize existing role (handle None or whitespace)
        current_role = str(profile.role).strip().lower() if profile.role else ""
        
        # Get requested role from frontend
        requested_role = data.get('role', 'patient').strip().lower()
        
        # CHECK: If user is ALREADY a doctor, we LOCK their role.
        # This prevents accidental downgrades to 'patient' if the frontend 
        # sends a default 'patient' role during profile updates.
        if current_role == 'doctor':
            pass # Do nothing. Keep them as doctor.
            
        else:
            # Only allow role change if they are NOT currently a doctor
            if requested_role == 'doctor':
                # Verify Access Code to BECOME a doctor
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
                # Default to patient
                profile.role = 'patient'
        # --------------------------------

        profile.state = data.get('state', '')
        profile.city = data.get('city', '')
        profile.age = data.get('age')
        profile.gender = data.get('gender', '')
        profile.license_number = data.get('licenseNumber', None)
        
        # --- SAVE NEW FIELDS ---
        profile.full_name = data.get('full_name', '')
        profile.phone = data.get('phone', '')
        profile.address = data.get('address', '')
        # -----------------------
        
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

        # Upload to Supabase
        try:
            image_url = upload_to_supabase(image_file)
        except Exception as e:
            return response.Response({"error": f"Image upload failed: {str(e)}"}, status=500)
        
        # ML Prediction
        image_file.seek(0)
        result, confidence, risk_level = predict_xray(image_file)
        
        # Save to DB
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
                # Removed 'underReview' from here to keep data clean, though frontend ignores it now
                "underReview": 0 
            },
            "records": TestResultSerializer(queryset, many=True).data
        })