from rest_framework import serializers
from .models import UserProfile, TestResult
from django.contrib.auth.models import User

class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'email', 'role', 'state', 'city', 'age', 'gender', 'license_number']

class TestResultSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.user.email', read_only=True)
    state = serializers.CharField(source='patient.state', read_only=True)
    city = serializers.CharField(source='patient.city', read_only=True)
    age = serializers.IntegerField(source='patient.age', read_only=True)

    class Meta:
        model = TestResult
        fields = '__all__'