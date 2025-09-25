from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from pcp_webapp.views import (
    MessageListCreateView, mark_message_read,
    LoginView, DashboardView, AddUserView, AddProjectView, 
    GetMembersView, AddTaskView, CalendarView, GetTasksView, 
    UpdateTaskView, DocumentListView, DocumentDetailView, DocumentDownloadView
)
from pcp_webapp.upload_views import (
    upload_document, list_uploaded_documents, view_document,
    get_user_tasks_with_documents, upload_task_document, delete_document,
    update_metadata
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
    # New file upload endpoints that bypass database issues
    path('api/upload/', upload_document, name='upload_document'),
    path('api/uploads/', list_uploaded_documents, name='list_uploads'),
    path('api/view/<path:file_path>/', view_document, name='view_document'),
    path('api/tasks/documents/', get_user_tasks_with_documents, name='get_user_tasks_with_documents'),
    path('api/tasks/upload/', upload_task_document, name='upload_task_document'),
    path('api/messages/', MessageListCreateView.as_view(), name='messages'),
    path('api/messages/<int:message_id>/read/', mark_message_read, name='mark_message_read'),
    path('api/delete-document/', delete_document, name='delete_document'),
    path('api/update-metadata/', update_metadata, name='update_metadata'),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)