from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from pcp_webapp.views import (
    LoginView, DashboardView, AddUserView, AddProjectView, 
    GetMembersView, AddTaskView, CalendarView, GetUserTasksView, 
    UpdateTaskView, DocumentUploadView, GetProjectTasksView, GetTaskDocumentsView,
    DeleteTaskView, GetProjectDataView, DownloadDocumentView, AddProjectUserView, 
    DeleteProjectUserView, DeleteDocumentView, ReviewTask, GetTaskMembersView,
    GetProjectChatView, SendChatMessageView, GetCompletedTasksView, GetContributionsView,
    UpdateProjectDetailsView, UpdateProjectFeedbackView,UpdateProfileView, GetProjectLinksView,
    CreateNotificationView, DeleteNotificationView, CompleteTaskView, GetFinalizedTasksView,
    GetTaskDetailsView, RemoveTaskMemberView, AddTaskMemberView, UploadDocumentView, GetProjectMeetingsView,
    CreateNotificationView, ResetPasswordView, DeleteProjectView, ChangeRoleView, AddMeetingView,
    AddProjectLinkView, DeleteProjectLinkView, GetUserDetailsView, VerifySecurityAnswerView, GetUserMeetingsView,GetUserNotificationsView
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
    path('api/uploaddocument/', UploadDocumentView.as_view(), name='upload-document'),
    path('api/getprojecttasks/', GetProjectTasksView.as_view(), name='get-project-tasks'),
    path('api/gettaskdocuments/', GetTaskDocumentsView.as_view(), name='gettaskdocuments'),
    path('api/updatetaskdetails/', UpdateTaskView.as_view(), name='updatetask'),
    path('api/document-upload/', DocumentUploadView.as_view(), name='document_upload'),
    path('api/getprojectdata/', GetProjectDataView.as_view(), name='getprojectdata'),
    path('api/document-download/', DownloadDocumentView.as_view(), name='document_download'),
    path('api/deletetask/<int:task_id>/', DeleteTaskView.as_view(), name='deletetask'),
    path('api/updatetask/<int:task_id>/', ReviewTask.as_view(), name='review_task'),
    path('api/addprojectmember/', AddProjectUserView.as_view(), name='addmember'),
    path('api/deleteprojectmember/', DeleteProjectUserView.as_view(), name='deletemember'),
    path('api/deletedocument/<int:document_id>/', DeleteDocumentView.as_view(), name='deletedocument'),
    path('api/getcompletedtasks/', GetCompletedTasksView.as_view(), name='getcompletedtasks'),
    path('api/getfinalizedtasks/<int:requested_project_id>/', GetFinalizedTasksView.as_view(), name='getfinalizedtasks'),
    path('api/getprojectchat/', GetProjectChatView.as_view(), name='getprojectchat'),
    path('api/sendchatmessage/', SendChatMessageView.as_view(), name='sendchatmessage'),
    path('api/updateprojectdetails/', UpdateProjectDetailsView.as_view(), name='updateprojectdetails'),
    path('api/updateprojectfeedback/', UpdateProjectFeedbackView.as_view(), name='updateprojectfeedback'),
    path('api/updateprofile/', UpdateProfileView.as_view(), name='updateprofile'),
    path('api/createnotification/', CreateNotificationView.as_view(), name='createnotification'),
    path('api/deletenotification/<int:notif_id>/', DeleteNotificationView.as_view(), name='deletenotification'),
    path('api/completetask/', CompleteTaskView.as_view(), name='completetask'),
    path('api/gettaskmembers/', GetTaskMembersView.as_view(), name='gettaskmembers'),
    path('api/gettaskdetails/', GetTaskDetailsView.as_view(), name="gettaskdetails"),
    path('api/removetaskmember/', RemoveTaskMemberView.as_view(), name="removetaskmember"),
    path('api/addtaskmember/', AddTaskMemberView.as_view(), name="addtaskmember"),
    path('api/resetpassword/', ResetPasswordView.as_view(), name='resetpassword'),
    path('api/deleteproject/<int:project_id>/', DeleteProjectView.as_view(), name="deleteproject"),
    path('api/changerole/', ChangeRoleView.as_view(), name="changerole"),
    path('api/addprojectlink/', AddProjectLinkView.as_view(), name='addprojectlink'),
    path('api/deleteprojectlink/', DeleteProjectLinkView.as_view(), name='deleteprojectlink'),
    path('api/getuserdetails/', GetUserDetailsView.as_view(), name='getuserdetails'),
    path('api/verifysecurityanswer/', VerifySecurityAnswerView.as_view(), name='verifysecurityanswer'),
    path('api/getcontributions/', GetContributionsView.as_view(), name="getcontributions"),
    path('api/getusermeetings/', GetUserMeetingsView.as_view(), name='getusermeetings'),
    path('api/getprojectlinks/', GetProjectLinksView.as_view(), name="getprojectlinks"),
    path('api/getusernotifications/', GetUserNotificationsView.as_view(), name='getusernotifications'),
    path('api/addmeeting/', AddMeetingView.as_view(), name='addmeeting'),
    path('api/getprojectmeetings/', GetProjectMeetingsView.as_view(), name='getprojectmeetings'),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)