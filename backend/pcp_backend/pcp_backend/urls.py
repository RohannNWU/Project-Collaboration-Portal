from django.contrib import admin
from django.urls import path
from django.conf import settings #Shaun's code
#from django.conf.urls.static import static #Shaun's code
from pcp_webapp.views import LoginView, DashboardView, AddUserView, AddProjectView, ProjectChatView, ChatMessageListView, ChatMessageCreateView, GetMembersView, AddTaskView, CalendarView

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
    path('api/calendar/', CalendarView.as_view(), name='calendar')
] #+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) #Shaun's code

