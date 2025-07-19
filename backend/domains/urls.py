from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DomainViewSet, DNSRecordViewSet

router = DefaultRouter()
router.register(r'domains', DomainViewSet)
router.register(r'dnsrecords', DNSRecordViewSet)

urlpatterns = [
    path('', include(router.urls)),
]