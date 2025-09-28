from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from pcp_webapp.views import (
    MessageListCreateView, mark_message_read,
    LoginView, DashboardView, AddUserView, AddProjectView, 
    GetMembersView, AddTaskView, CalendarView, GetUserTasksView, 
    UpdateTaskView, DocumentUploadView, GetProjectTasksView, GetTaskDocumentsView,
    DeleteTaskView, GetProjectDataView, DownloadDocumentView, AddUserView, DeleteProjectUserView
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
    path('api/getusertasks/', GetUserTasksView.as_view(), name='getusertasks'),
    path('api/getprojecttasks/', GetProjectTasksView.as_view(), name='getprojecttasks'),
    path('api/gettaskdocuments/', GetTaskDocumentsView.as_view(), name='gettaskdocuments'),
    path('api/updatetask/', UpdateTaskView.as_view(), name='updatetask'),
    path('api/messages/', MessageListCreateView.as_view(), name='messages'),
    path('api/messages/<int:message_id>/read/', mark_message_read, name='mark_message_read'),
    path('api/document-upload/', DocumentUploadView.as_view(), name='document_upload'),
    path('api/getprojectdata/', GetProjectDataView.as_view(), name='getprojectdata'),
    path('api/document-download/', DownloadDocumentView.as_view(), name='document_download'),
    path('api/deletetask/<int:task_id>/', DeleteTaskView.as_view(), name='deletetask'),
    path('api/addmember/', AddUserView.as_view(), name='addmember'),
    path('api/deletemember/', DeleteProjectUserView.as_view(), name='deletemember'),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)