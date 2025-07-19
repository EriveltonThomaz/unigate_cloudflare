
# backend/admin_api/urls.py
from django.urls import path
from .views import DashboardStatsView, RecentTenantsView, UserListCreateView, UserRetrieveUpdateDestroyView, DomainListCreateView, DomainRetrieveUpdateDestroyView, CloudflareKeyListCreateView, CloudflareKeyRetrieveUpdateDestroyView, UserProfileView, TenantListCreateView, TenantCreateAPIView, TenantRetrieveUpdateDestroyView, TenantManagerView, TenantDomainListView, DomainSubdomainListView, DomainSubdomainCreateView, RecentSubdomainsView, DNSRecordView, DNSRecordDetailView, TenantSyncDomainsView, DNSRecordCloudflareView, DomainAnalyticsView, ARecordListView, DNSRecordCustomListView, UserDomainPermissionListCreateView, UserDomainPermissionDetailView
from .views_user_manager import UserIsManagerView

urlpatterns = [
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('recent-tenants/', RecentTenantsView.as_view(), name='recent-tenants'),
    path('recent-subdomains/', RecentSubdomainsView.as_view(), name='recent-subdomains'),
    path('users/', UserListCreateView.as_view(), name='user-list-create'),
    path('users/<str:pk>/', UserRetrieveUpdateDestroyView.as_view(), name='user-detail'),
    path('domains/', DomainListCreateView.as_view(), name='domain-list-create'),
    path('domains/<str:pk>/', DomainRetrieveUpdateDestroyView.as_view(), name='domain-detail'),
    path('dns-records/', DNSRecordView.as_view(), name='dns-record-list-create'),
    path('dns-records/<str:pk>/', DNSRecordDetailView.as_view(), name='dns-record-detail'),
    path('domains/<int:domain_id>/dns-records/', DNSRecordView.as_view(), name='domain-dns-records'),
    path('domains/<int:domain_id>/dns-records/cloudflare/', DNSRecordCloudflareView.as_view(), name='cloudflare-dns-records-list-create'),
    path('domains/<int:domain_id>/dns-records/cloudflare/<str:record_id>/', DNSRecordCloudflareView.as_view(), name='cloudflare-dns-records-detail'),
    path('cloudflare-keys/', CloudflareKeyListCreateView.as_view(), name='cloudflare-key-list-create'),
    path('cloudflare-keys/<str:pk>/', CloudflareKeyRetrieveUpdateDestroyView.as_view(), name='cloudflare-key-detail'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('tenants/', TenantListCreateView.as_view(), name='tenant-list-create'),
    path('tenants/create/', TenantCreateAPIView.as_view(), name='tenant-create'),
    path('tenants/<str:pk>/', TenantRetrieveUpdateDestroyView.as_view(), name='tenant-detail'),
    path('tenants/<int:tenant_pk>/managers/', TenantManagerView.as_view(), name='tenant-managers-list'),
    path('tenants/<int:tenant_pk>/managers/<int:user_pk>/', TenantManagerView.as_view(), name='tenant-managers-detail'),
    path('tenants/<int:tenant_pk>/domains/', TenantDomainListView.as_view(), name='tenant-domain-list'),
    path('domains/<int:domain_pk>/subdomains/', DomainSubdomainListView.as_view(), name='domain-subdomain-list'),
    path('domains/<int:domain_pk>/subdomains/create/', DomainSubdomainCreateView.as_view(), name='domain-subdomain-create'),
    path('tenants/<int:tenant_pk>/sync-domains/', TenantSyncDomainsView.as_view(), name='tenant-sync-domains'),
    path('domains/<int:domain_id>/analytics/', DomainAnalyticsView.as_view(), name='domain-analytics'),
    path('domains/<int:domain_id>/a-records/', ARecordListView.as_view(), name='domain-a-records'),
    path('domains/<int:domain_id>/dnsrecords/custom/', DNSRecordCustomListView.as_view(), name='domain-dnsrecords-custom'),
    path('user-domain-permissions/', UserDomainPermissionListCreateView.as_view(), name='user-domain-permission-list-create'),
    path('user-domain-permissions/<int:pk>/', UserDomainPermissionDetailView.as_view(), name='user-domain-permission-detail'),
    path('users/<str:user_id>/is-manager/', UserIsManagerView.as_view(), name='user-is-manager'),
]
