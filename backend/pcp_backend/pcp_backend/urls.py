from django.contrib import admin

from django.urls import path
from pcp_webapp.views import (
    MessageListCreateView, mark_message_read, NotificationListView,
    RecentNotificationsView, UnreadNotificationsView, NotificationByTypeView,
    LoginView, DashboardView, AddUserView, AddProjectView, 
    GetMembersView, AddTaskView, CalendarView, GetTasksView, 
    UpdateTaskView, DocumentListView, DocumentDetailView, DocumentDownloadView
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/dashboard/', DashboardView.as_view(), name='dashboard'),
    path('api/adduser/', AddUserView.as_view(), name='adduser'),
    path('api/newproject/', AddProjectView.as_view(), name='newproject'),
    path('api/getmembers/', GetMembersView.as_view(), name='getmembers'),
    path('api/addtask/', AddTaskView.as_view(), name='addtask'),
    path('api/calendar/', CalendarView.as_view(), name='calendar'),
    path('api/gettasks/', GetTasksView.as_view(), name='gettasks'),
    path('api/updatetask/', UpdateTaskView.as_view(), name='updatetask'),
    path('api/documents/', DocumentListView.as_view(), name='document_list'),
    path('api/documents/<int:document_id>/', DocumentDetailView.as_view(), name='document_detail'),
    path('api/documents/<int:document_id>/download/', DocumentDownloadView.as_view(), name='document_download'),
    path('api/messages/', MessageListCreateView.as_view(), name='messages'),
    path('api/messages/<int:message_id>/read/', mark_message_read, name='mark_message_read'),
    path('api/notifications/', NotificationListView.as_view(), name='notifications-list'),
    path('api/notifications/recent/', RecentNotificationsView.as_view(), name='recent-notifications'),
    path('api/notifications/unread/', UnreadNotificationsView.as_view(), name='unread-notifications'),
    path('api/notifications/by-type/', NotificationByTypeView.as_view(), name='notifications-by-type'),

]