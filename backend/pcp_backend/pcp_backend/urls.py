from django.urls import path
from pcp_webapp import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('api/login/', views.LoginView.as_view(), name='login'),
    path('', views.landing_page, name='landing_page'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', views.register_user, name='register'),
    path('protected/', views.ProtectedView.as_view(), name='protected'),
     path('api/addtask/', AddTaskView.as_view(), name='addtask'),
     
    
    # Document Management API endpoints
    path('api/documents/', views.DocumentListView.as_view(), name='document_list'),
    path('api/documents/<int:document_id>/', views.DocumentDetailView.as_view(), name='document_detail'),
]