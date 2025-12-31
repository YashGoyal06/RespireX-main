from django.urls import path
from .views import UserProfileView, PredictionView, PatientHistoryView, DoctorDashboardView

urlpatterns = [
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('predict/', PredictionView.as_view(), name='predict'),
    path('history/', PatientHistoryView.as_view(), name='history'),  # This matches frontend
    path('doctor/dashboard/', DoctorDashboardView.as_view(), name='doctor-dashboard'),
]