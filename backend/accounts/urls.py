from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'cloudflare-keys', views.CloudflareAPIKeyViewSet)
router.register(r'permissions', views.UserDomainPermissionViewSet)

urlpatterns = [
    # DRF Router
    path('', include(router.urls)),

    # Autenticação (não faz parte do router)
    path('token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', views.MeView.as_view(), name='me'),

    # Views personalizadas
    path('cloudflare-keys/sync-domains/', views.sync_domains_from_cloudflare, name='sync_domains'),
    path('my-domains/', views.my_domains, name='my_domains'),
    path('stats/', views.StatsView.as_view(), name='stats'),
]