from django.urls import path
from .views import (
    UserProfileView, 
    PredictionView, 
    PatientHistoryView, 
    DoctorDashboardView, 
    DownloadReportView,
    PublicStatsView,
    EmailReportView # <--- Restored
)

urlpatterns = [
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('predict/', PredictionView.as_view(), name='predict'),
    path('history/', PatientHistoryView.as_view(), name='history'),
    path('doctor/dashboard/', DoctorDashboardView.as_view(), name='doctor-dashboard'),
    path('report/<int:pk>/', DownloadReportView.as_view(), name='download-report'),
    path('stats/', PublicStatsView.as_view(), name='public-stats'),
    path('email-report/<int:pk>/', EmailReportView.as_view(), name='email-report'), # <--- Restored
]