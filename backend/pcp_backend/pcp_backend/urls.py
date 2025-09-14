from django.contrib import admin
from django.urls import path, include
from pcp_webapp.views import (
    LoginView, DashboardView, AddUserView, ProjectListCreateView, 
    TaskListCreateView, MessageListCreateView, mark_message_read,
    user_profile, project_analytics
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/dashboard/', DashboardView.as_view(), name='dashboard'),
    path('api/adduser/', AddUserView.as_view(), name='adduser'),
    path('api/projects/', ProjectListCreateView.as_view(), name='projects'),
    path('api/tasks/', TaskListCreateView.as_view(), name='tasks'),
    path('api/messages/', MessageListCreateView.as_view(), name='messages'),
    path('api/messages/<int:message_id>/read/', mark_message_read, name='mark_message_read'),
    path('api/profile/', user_profile, name='user_profile'),
    path('api/projects/<int:project_id>/analytics/', project_analytics, name='project_analytics'),
]