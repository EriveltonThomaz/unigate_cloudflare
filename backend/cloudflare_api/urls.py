from django.urls import path
from .views import ValidateCloudflareEmailView

urlpatterns = [
    path('validate-email/', ValidateCloudflareEmailView.as_view(), name='validate-cloudflare-email'),
] 