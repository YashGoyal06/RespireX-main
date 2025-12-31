from django.urls import path
from .views import UserProfileView, PredictionView, PatientHistoryView, DoctorDashboardView

urlpatterns = [
    path('profile/', UserProfileView.as_view()),
    path('predict/', PredictionView.as_view()),
    path('history/', PatientHistoryView.as_view()),
    path('doctor/dashboard/', DoctorDashboardView.as_view()),
]