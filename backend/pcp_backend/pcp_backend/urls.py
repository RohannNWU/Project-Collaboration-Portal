from django.contrib import admin
from django.urls import path
from pcp_webapp.views import LoginView, DashboardView, AddUserView, AddProjectView, CalendarView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/dashboard/', DashboardView.as_view(), name='dashboard'),
    path('api/adduser/', AddUserView.as_view(), name='adduser'),
    path('api/newproject/', AddProjectView.as_view(), name='newproject'),
    path('api/calendar/', CalendarView.as_view(), name='calendar'),
]