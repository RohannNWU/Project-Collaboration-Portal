from django.contrib import admin
from django.urls import path, include
from pcp_webapp.views import (
    LoginView, DashboardView, AddUserView, ProjectListCreateView, 
    TaskListCreateView, TaskDetailView, MessageListCreateView, mark_message_read,
    user_profile, project_analytics, ProjectDetailView, bulk_mark_messages_read,
    user_workload, project_members, task_statistics
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/dashboard/', DashboardView.as_view(), name='dashboard'),
    path('api/adduser/', AddUserView.as_view(), name='adduser'),
    path('api/projects/', ProjectListCreateView.as_view(), name='projects'),
    path('api/projects/<int:project_id>/', ProjectDetailView.as_view(), name='project_detail'),
    path('api/projects/<int:project_id>/members/', project_members, name='project_members'),
    path('api/tasks/', TaskListCreateView.as_view(), name='tasks'),
    path('api/tasks/<int:task_id>/', TaskDetailView.as_view(), name='task_detail'),
    path('api/tasks/statistics/', task_statistics, name='task_statistics'),
    path('api/messages/', MessageListCreateView.as_view(), name='messages'),
    path('api/messages/<int:message_id>/read/', mark_message_read, name='mark_message_read'),
    path('api/messages/bulk-read/', bulk_mark_messages_read, name='bulk_mark_messages_read'),
    path('api/profile/', user_profile, name='user_profile'),
    path('api/workload/', user_workload, name='user_workload'),
    path('api/projects/<int:project_id>/analytics/', project_analytics, name='project_analytics'),
]