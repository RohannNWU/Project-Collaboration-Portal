from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from pcp_webapp.views import (
    MessageListCreateView, mark_message_read,
    LoginView, DashboardView, AddUserView, AddProjectView, ProjectChatView, ChatMessageListView, ChatMessageCreateView,
    GetMembersView, AddTaskView, CalendarView, GetTasksView, 
    UpdateTaskView, DocumentUploadView  # Added the new view
)
# Ignored/commented out imports for other document views
# from pcp_webapp.upload_views import (
#     upload_document, list_uploaded_documents, view_document,
#     get_user_tasks_with_documents, upload_task_document, delete_document,
#     update_metadata
# )

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/dashboard/', DashboardView.as_view(), name='dashboard'),
    path('api/adduser/', AddUserView.as_view(), name='adduser'),
    path('api/newproject/', AddProjectView.as_view(), name='newproject'),
    # routes for the chat
    path('api/projects/<int:project_id>/chats/', ProjectChatView.as_view(), name='project-chats'),
    path('api/chats/<int:chat_id>/messages/', ChatMessageListView.as_view(), name='chat-message-create'),
    path('api/chats/<int:chat_id>/messages/new/', ChatMessageCreateView.as_view(), name='chat-message-create'),

    path('api/getmembers/', GetMembersView.as_view(), name='getmembers'),
    path('api/addtask/', AddTaskView.as_view(), name='addtask'),
    path('api/calendar/', CalendarView.as_view(), name='calendar'),
    path('api/gettasks/', GetTasksView.as_view(), name='gettasks'),
    path('api/updatetask/', UpdateTaskView.as_view(), name='updatetask'),
    path('api/messages/', MessageListCreateView.as_view(), name='messages'),
    path('api/messages/<int:message_id>/read/', mark_message_read, name='mark_message_read'),
    
    # New path for the single document upload view
    path('api/document-upload/', DocumentUploadView.as_view(), name='document_upload'),
    
    # Ignored/commented out other document paths as per instructions
    # path('api/documents/', DocumentListView.as_view(), name='document_list'),
    # path('api/documents/<int:document_id>/', DocumentDetailView.as_view(), name='document_detail'),
    # path('api/documents/<int:document_id>/download/', DocumentDownloadView.as_view(), name='document_download'),
    # path('api/upload/', upload_document, name='upload_document'),
    # path('api/uploads/', list_uploaded_documents, name='list_uploads'),
    # path('api/view/<path:file_path>/', view_document, name='view_document'),
    # path('api/tasks/documents/', get_user_tasks_with_documents, name='get_user_tasks_with_documents'),
    # path('api/tasks/upload/', upload_task_document, name='upload_task_document'),
    # path('api/delete-document/', delete_document, name='delete_document'),
    # path('api/update-metadata/', update_metadata, name='update_metadata'),
]
# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
