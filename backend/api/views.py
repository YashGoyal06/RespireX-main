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
        
        # --- SECURE ACCESS CODE CHECK ---
        requested_role = data.get('role', 'patient')
        
        if requested_role == 'doctor':
            # 1. Get code sent from frontend
            provided_code = data.get('access_code')
            # 2. Get secure code from Backend .env
            secure_code = os.getenv('DOCTOR_ACCESS_CODE')
            
            # 3. Verify
            if provided_code and provided_code == secure_code:
                profile.role = 'doctor'
            else:
                # Deny request if code matches incorrectly
                return response.Response(
                    {"error": "Invalid Access Code. Administrator privileges denied."}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            profile.role = requested_role
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
                "underReview": 0
            },
            "records": TestResultSerializer(queryset, many=True).data
        })