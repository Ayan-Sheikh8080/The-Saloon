from django.contrib import admin
from django.urls import path, include
from salons.views import DashboardView

urlpatterns = [
    path('api/dashboard/', DashboardView.as_view(), name='dashboard'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/customers/', include('customers.urls')),
    path('api/staff/', include('staff.urls')),
    path('api/services/', include('services.urls')),
    path('api/appointments/', include('appointments.urls')),
    path('api/sales/', include('sales.urls')),
]