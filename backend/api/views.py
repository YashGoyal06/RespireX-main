from rest_framework import views, response, status
from .models import UserProfile, TestResult
from .serializers import UserProfileSerializer, TestResultSerializer
from .ml_engine import predict_xray
from .storage import upload_to_supabase
import json
from rest_framework.permissions import IsAuthenticated

class UserProfileView(views.APIView):
    def post(self, request):
        user = request.user
        data = request.data
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        profile.role = data.get('role', 'patient')
        profile.state = data.get('state', '')
        profile.city = data.get('city', '')
        profile.age = data.get('age')
        profile.gender = data.get('gender', '')
        profile.license_number = data.get('licenseNumber', None)
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

        # 1. Upload to Supabase
        image_url = upload_to_supabase(image_file)
        
        # 2. ML Prediction
        image_file.seek(0)
        result, confidence, risk_level = predict_xray(image_file)
        
        # 3. Save to DB
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
    def get(self, request):
        try:
            profile = request.user.profile
            results = TestResult.objects.filter(patient=profile).order_by('-date_tested')
            return response.Response(TestResultSerializer(results, many=True).data)
        except:
            return response.Response([])

class DoctorDashboardView(views.APIView):
    def get(self, request):
        if not hasattr(request.user, 'profile') or request.user.profile.role != 'doctor':
            return response.Response({"error": "Unauthorized"}, status=403)
            
        state_filter = request.query_params.get('state', 'all')
        queryset = TestResult.objects.all().select_related('patient').order_by('-date_tested')
        
        if state_filter != 'all':
            queryset = queryset.filter(patient__state__iexact=state_filter)
            
        return response.Response({
            "stats": {
                "total": queryset.count(),
                "positive": queryset.filter(result='Positive').count(),
                "negative": queryset.filter(result='Negative').count()
            },
            "records": TestResultSerializer(queryset, many=True).data
        })