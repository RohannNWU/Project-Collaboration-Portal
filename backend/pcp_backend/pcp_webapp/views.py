from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import UntypedToken, AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken
from datetime import datetime, timedelta
<<<<<<< HEAD
from .models import User, Project, UserProject, Project, Task, User_Task
import bcrypt
=======
from .models import User, Project, UserProject, Task, User_Task, Document
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.http import HttpResponse
from rest_framework.permissions import IsAuthenticated
from .serializers import (
    UserSerializer, ProjectSerializer, TaskSerializer, MessageSerializer,
    DocumentSerializer, ActivityLogSerializer, DashboardStatsSerializer, NotificationSummarySerializer
)
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status, generics, permissions
import bcrypt
import logging
>>>>>>> main

logger = logging.getLogger(__name__)

def get_user_from_token(request):
    """Helper function to extract user from JWT token"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(' ')[1]
    try:
        payload = UntypedToken(token).payload
        user_email = payload.get('user_email')
        return User.objects.get(email=user_email)
    except (InvalidToken, User.DoesNotExist) as e:
        logger.warning(f"Token validation failed: {e}")
        return None
class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        try:
            user = User.objects.get(email=email)
            
            try:
                if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
                    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
            except ValueError as e:
                return Response({'error': f'Invalid password hash in database: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            current_time = datetime.utcnow()
            access = AccessToken()
            access.set_exp(from_time=current_time, lifetime=timedelta(hours=1))
            access.payload['user_email'] = user.email
            access.payload['fname'] = user.first_name
            access.payload['lname'] = user.last_name
            username = user.first_name + ' ' + user.last_name
            return Response({
                'access': str(access),
                'username': username,
                'email': user.email
            })
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({'error': f'Login error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DashboardView(APIView):
    def get(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        token = auth_header.split(' ')[1]
        try:
            # Validate token
            UntypedToken(token)
            payload = UntypedToken(token).payload
            user_email = payload.get('user_email')
            
            # Fetch user
            user = User.objects.get(email=user_email)
            
            # Fetch user projects using ORM
            user_projects = UserProject.objects.filter(email=user).select_related('project_id')
            projects = [
                {
                    'project_name': user_project.project_id.project_name,
                    'progress': 0,
                    'dueDate': user_project.project_id.due_date.strftime('%d/%m/%Y'),
                    'role': user_project.role
                }
                for user_project in user_projects
            ]
                
            return Response({
                'email': user.email,
                'username': user.first_name + ' ' + user.last_name,
                'projects': projects
            })
            
        except InvalidToken:
            return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({'error': f'Database error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AddUserView(APIView):
    def post(self, request):
        try:
            user_email = request.data.get('email')
            fname = request.data.get('fname')
            lname = request.data.get('lname')
            password = request.data.get('password')

            # Validate inputs
            if not all([user_email, fname, lname, password]):
                return Response({'error': 'All fields (email address, first name, last name, password) are required'}, status=status.HTTP_400_BAD_REQUEST)

            # Hash password and convert to string for storage
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            # Check if user already exists
            if User.objects.filter(email=user_email).exists():
                return Response({'error': 'User with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create new user using ORM
            user = User.objects.create(
                email=user_email,
                first_name=fname,
                last_name=lname,
                password=hashed_password
            )
            return Response({'message': 'User added successfully', 'id': user.email}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f'Failed to add user: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AddProjectView(APIView):
    def post(self, request):
        try:
            project_name = request.data.get('project_name')
            project_description = request.data.get('project_description')
            project_due_date = request.data.get('project_due_date')
            project_members = request.data.get('project_members', [])

            # Create new project using ORM
            project = Project.objects.create(
                due_date=project_due_date,
                project_name=project_name,
                project_description=project_description,
                created_on=datetime.today().date()
            )

            # Add project members using ORM
            for index, member_email in enumerate(project_members):
                role = 'supervisor' if index == 0 else 'student'
                user = User.objects.get(email=member_email)
                UserProject.objects.create(
                    email=user,
                    project_id=project,
                    role=role
                )
            return Response({'message': 'Project added successfully'}, status=status.HTTP_201_CREATED)
        except User.DoesNotExist:
            return Response({'error': 'One or more users not found'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Failed to add project: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

<<<<<<< HEAD

=======
class GetMembersView(APIView):
    def post(self, request):
            try:
                # Extract projectId from the request body
                project_id = request.data.get('projectId')
                if not project_id:
                    return Response(
                        {'error': 'projectId is required'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                members = UserProject.objects.filter(project_id=project_id).values('email')
                first_names = User.objects.filter(email__in=members).values('email', 'first_name')
                members_list = [{'email': member['email'], 'first_name': member['first_name']} for member in first_names]
                return Response({'members': members_list}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response(
                    {'error': f'Failed to fetch members: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

class AddTaskView(APIView):
    def post(self, request):
        try:
            task_name = request.data.get('task_name')
            task_description = request.data.get('task_description')
            task_due_date = request.data.get('task_due_date')
            task_status = request.data.get('task_status')
            task_priority = request.data.get('task_priority')
            project_id = Project.objects.get(project_name=request.data.get('project_name'))
            task_members = request.data.get('task_members', [])

            # Create new task using ORM
            task = Task.objects.create(
                task_name=task_name,
                task_description=task_description,
                task_due_date=task_due_date,
                task_status=task_status,
                task_priority=task_priority,
                project_id=project_id
            )

            for member_email in task_members:
                user = User.objects.get(email=member_email)
                User_Task.objects.create(
                    email=user,
                    task_id=task,
                )
            
            return Response({'message': 'Task added successfully'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f'Failed to add task: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
>>>>>>> main
class CalendarView(APIView):
    def get(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        token = auth_header.split(' ')[1]
        try:
            # Validate token
            payload = UntypedToken(token).payload
            user_email = payload.get('user_email')
            
            # Fetch user
            user = User.objects.get(email=user_email)
            
            # Fetch user projects
            user_projects = UserProject.objects.filter(email=user).select_related('project_id')
            project_events = [
                {
                    'title': f"Project: {user_project.project_id.project_name}",
                    'start': user_project.project_id.due_date.strftime('%Y-%m-%d')
                }
                for user_project in user_projects
            ]
            
            # Fetch user tasks
            user_tasks = User_Task.objects.filter(email=user).select_related('task_id')
            task_events = [
                {
                    'title': f"Task: {user_task.task_id.task_name}",
                    'start': user_task.task_id.task_due_date.strftime('%Y-%m-%d')
                }
                for user_task in user_tasks
            ]
            
            # Combine project and task events
            events = project_events + task_events
            
            # Get current server time
            current_time = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
            
            return Response({
                'events': events,
                'current_time': current_time
            })
            
        except InvalidToken:
            return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
<<<<<<< HEAD
            return Response({'error': f'Database error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
=======
            return Response({'error': f'Database error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetTasksView(APIView):
    def get(self, request):
        try:
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
            
            token = auth_header.split(' ')[1]
            # Validate token and extract payload
            try:
                UntypedToken(token)
                payload = UntypedToken(token).payload
                user_email = payload.get('user_email') or payload.get('email')
                if not user_email:
                    return Response({'error': 'Invalid token: user_email not found'}, status=status.HTTP_401_UNAUTHORIZED)
            except (InvalidToken) as e:
                return Response({'error': f'Invalid or expired token: {str(e)}'}, status=status.HTTP_401_UNAUTHORIZED)

            # Fetch the user based on the email from the token
            try:
                user = User.objects.get(email=user_email)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

            # Fetch tasks assigned to the user
            user_tasks = User_Task.objects.filter(email=user).select_related('task_id')
            tasks_list = [
                {
                    'task_id': user_task.task_id.task_id,
                    'task_name': user_task.task_id.task_name,
                    'task_description': user_task.task_id.task_description,
                    'task_due_date': user_task.task_id.task_due_date.strftime('%d/%m/%Y'),
                    'task_status': user_task.task_id.task_status,
                    'task_priority': user_task.task_id.task_priority,
                    'project_id': user_task.task_id.project_id.project_id,
                    'project_name': user_task.task_id.project_id.project_name
                }
                for user_task in user_tasks
            ]
            return Response({'tasks': tasks_list}, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error: {str(e)}")  # Log error for debugging
            return Response({'error': f'Failed to fetch tasks: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class UpdateTaskView(APIView):
    def post(self, request):
        try:
            task_id = request.data.get('task_id')
            task_due_date = request.data.get('task_due_date')
            task_status = request.data.get('task_status')
            task_priority = request.data.get('task_priority')
            task = Task.objects.get(task_id=task_id)
            task.task_due_date = task_due_date
            task.task_status = task_status
            task.task_priority = task_priority
            task.save()
            return Response({'message': 'Task status updated successfully'}, status=status.HTTP_200_OK)
        except Task.DoesNotExist:
            return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'Failed to update task: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class DocumentListView(APIView):
    """API endpoint to list all documents for a user or create a new document"""
    
    def get(self, request):
        # Use manual JWT authentication
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            documents = Document.objects.filter(uploaded_by=user)
            document_list = []
            
            for doc in documents:
                document_list.append({
                    'id': doc.id,  # Document ID (PK)
                    'doc_id': doc.id,  # DOC_ID (PK) - keeping for backward compatibility
                    'task_id': None,  # No task relationship in current model
                    'title': doc.name,  # Using name field as title
                    'name': doc.name,  # Name field
                    'description': doc.description or '',  # Description field
                    'datetime_uploaded': doc.uploaded_at.isoformat(),  # uploaded_at field
                    'upload_date': doc.uploaded_at.isoformat(),  # Upload date alias
                    'doc_type': doc.file_type,  # file_type field
                    'file_type': doc.file_type,  # File type field
                    'date_last_modified': doc.uploaded_at.isoformat(),  # No last_modified field, using uploaded_at
                    'last_modified_by': doc.uploaded_by.email,  # Using uploaded_by user email
                    'file_path': doc.file_path,
                    'file_size': doc.file_size,
                    'size': doc.file_size,  # Size alias for frontend compatibility
                    'uploaded_by': doc.uploaded_by.email  # Using email from custom User model
                })
            
            return Response({'documents': document_list}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        # Use manual JWT authentication
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            # Handle file upload
            uploaded_file = request.FILES.get('file')
            title = request.data.get('title', '')
            description = request.data.get('description', '')
            project_id = request.data.get('project_id', None)
            
            if not uploaded_file:
                return Response({'error': 'File is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Use filename as title if not provided
            if not title:
                title = uploaded_file.name
            
            # Handle project_id - frontend sends "null" as string when no project
            if project_id == 'null' or project_id == '' or project_id is None:
                project_id = None
            
            # Get project if project_id is provided, otherwise create a default project
            project = None
            if project_id:
                try:
                    project = Project.objects.get(pk=project_id)
                except Project.DoesNotExist:
                    return Response({'error': f'Project with ID {project_id} not found'}, status=status.HTTP_404_NOT_FOUND)
            else:
                # If no project_id provided, try to get or create a default project for the user
                try:
                    # First, try to find any project for the user
                    user_projects = UserProject.objects.filter(email=user)
                    if user_projects.exists():
                        project = user_projects.first().project_id
                    else:
                        # Create a default project for the user
                        from datetime import date
                        default_project = Project.objects.create(
                            project_name=f"Default Project - {user.email}",
                            project_description="Default project for document uploads",
                            due_date=date(2025, 12, 31),
                            created_on=date.today()
                        )
                        # Associate user with the project
                        UserProject.objects.create(
                            email=user,
                            project_id=default_project,
                            role="owner"
                        )
                        project = default_project
                except Exception as e:
                    logger.error(f"Error creating default project: {str(e)}")
                    return Response({'error': f'Error creating default project: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Save file to storage
            file_name = uploaded_file.name
            file_path = default_storage.save(f'documents/{user.email}/{file_name}', ContentFile(uploaded_file.read()))
            
            # Create document record using the correct model structure
            document = Document.objects.create(
                name=title,  # name field
                description=description,  # description field
                file_path=file_path,
                file_size=uploaded_file.size,
                file_type=uploaded_file.content_type,  # file_type field
                project=project,  # project FK
                uploaded_by=user  # uploaded_by FK to custom User model
            )
            
            return Response({
                'message': 'Document uploaded successfully',
                'document': {
                    'id': document.id,  # Document ID (PK)
                    'doc_id': document.id,
                    'task_id': None,  # No task relationship in current model
                    'title': document.name,  # Using name field as title
                    'name': document.name,  # Name field
                    'description': document.description or '',  # Description field
                    'datetime_uploaded': document.uploaded_at.isoformat(),
                    'upload_date': document.uploaded_at.isoformat(),  # Upload date alias
                    'doc_type': document.file_type,
                    'file_type': document.file_type,  # File type field
                    'date_last_modified': document.uploaded_at.isoformat(),  # No last_modified field
                    'last_modified_by': document.uploaded_by.email,  # Using uploaded_by user email
                    'file_size': document.file_size,
                    'size': document.file_size,  # Size alias for frontend compatibility
                    'uploaded_by': document.uploaded_by.email  # Using email from custom User model
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            import traceback
            error_details = {
                'error': str(e),
                'error_type': type(e).__name__,
                'traceback': traceback.format_exc()
            }
            logger.error(f"Document upload error: {error_details}")
            print(f"DOCUMENT UPLOAD ERROR: {error_details}")  # Debug print
            return Response({'error': str(e), 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class DocumentDetailView(APIView):
    """API endpoint to retrieve, update, or delete a specific document"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, document_id):
        try:
            document = Document.objects.get(id=document_id)
            return Response({
                'doc_id': document.id,  # DOC_ID (PK)
                'id': document.id,  # Also include 'id' for frontend compatibility
                'task_id': document.task.id if document.task else None,  # TASK_ID (FK)
                'title': document.title,  # Title
                'name': document.title,  # Also include 'name' for frontend compatibility
                'description': document.description,  # Description
                'datetime_uploaded': document.datetime_uploaded.isoformat(),  # DateTime_Uploaded
                'upload_date': document.datetime_uploaded.isoformat(),  # Also include 'upload_date' for frontend compatibility
                'doc_type': document.doc_type,  # Doc_Type (MIME type)
                'file_type': document.doc_type,  # Also include 'file_type' for frontend compatibility
                'date_last_modified': document.date_last_modified.isoformat(),  # Date_Last_Modified
                'last_modified_by': document.last_modified_by.username,  # Last_Modified_By(User)
                'file_path': document.file_path,
                'file_size': document.file_size,
                'size': document.file_size,  # Also include 'size' for frontend compatibility
                'uploaded_by': document.uploaded_by.username
            }, status=status.HTTP_200_OK)
        except Document.DoesNotExist:
            return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, document_id):
        try:
            document = Document.objects.get(id=document_id)
            
            # Update document metadata
            document.title = request.data.get('title', document.title)
            document.description = request.data.get('description', document.description)
            document.last_modified_by = request.user  # Update last modified by
            
            # Update task association if provided
            task_id = request.data.get('task_id')
            if task_id is not None:
                if task_id == '':
                    document.task = None
                else:
                    try:
                        task = Task.objects.get(id=task_id)
                        document.task = task
                    except Task.DoesNotExist:
                        return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)
            
            document.save()
            
            return Response({
                'message': 'Document updated successfully',
                'document': {
                    'doc_id': document.id,
                    'id': document.id,
                    'task_id': document.task.id if document.task else None,
                    'title': document.title,
                    'name': document.title,
                    'description': document.description,
                    'datetime_uploaded': document.datetime_uploaded.isoformat(),
                    'upload_date': document.datetime_uploaded.isoformat(),
                    'doc_type': document.doc_type,
                    'file_type': document.doc_type,
                    'date_last_modified': document.date_last_modified.isoformat(),
                    'last_modified_by': document.last_modified_by.username,
                    'file_size': document.file_size,
                    'size': document.file_size,
                    'uploaded_by': document.uploaded_by.username
                }
            }, status=status.HTTP_200_OK)
        except Document.DoesNotExist:
            return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, document_id):
        try:
            document = Document.objects.get(id=document_id)
            
            # Delete file from storage
            if document.file_path and default_storage.exists(document.file_path):
                default_storage.delete(document.file_path)
            
            # Delete document record
            document.delete()
            
            return Response({'message': 'Document deleted successfully'}, status=status.HTTP_200_OK)
        except Document.DoesNotExist:
            return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DocumentDownloadView(APIView):
    """API endpoint to download a document"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, document_id):
        try:
            document = Document.objects.get(id=document_id)
            
            if not document.file_path or not default_storage.exists(document.file_path):
                return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Open and return the file
            file_content = default_storage.open(document.file_path)
            response = HttpResponse(file_content.read(), content_type=document.doc_type)
            response['Content-Disposition'] = f'attachment; filename="{document.title}"'
            return response
            
        except Document.DoesNotExist:
            return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MessageListCreateView(APIView):
    def get_user_from_token(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        token = auth_header.split(' ')[1]
        try:
            payload = UntypedToken(token).payload
            user_email = payload.get('user_email')
            return User.objects.get(email=user_email)
        except:
            return None

    def get(self, request):
        user = self.get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        messages = Message.objects.filter(recipient=user).order_by('-created_at')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = self.get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            recipient = User.objects.get(email=request.data.get('recipient_email'))
            
            message = Message.objects.create(
                sender=user,
                recipient=recipient,
                project_id=request.data.get('project_id'),
                message_type=request.data.get('message_type', 'direct'),
                subject=request.data.get('subject'),
                content=request.data.get('content')
            )
            
            serializer = MessageSerializer(message)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
def mark_message_read(request, message_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    token = auth_header.split(' ')[1]
    try:
        payload = UntypedToken(token).payload
        user_email = payload.get('user_email')
        user = User.objects.get(email=user_email)
        
        message = Message.objects.get(id=message_id, recipient=user)
        message.is_read = True
        message.save()
        
        return Response({'message': 'Message marked as read'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def user_profile(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    token = auth_header.split(' ')[1]
    try:
        payload = UntypedToken(token).payload
        user_email = payload.get('user_email')
        user = User.objects.get(email=user_email)
        
        serializer = UserSerializer(user)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def project_analytics(request, project_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    token = auth_header.split(' ')[1]
    try:
        payload = UntypedToken(token).payload
        user_email = payload.get('user_email')
        user = User.objects.get(email=user_email)
        
        project = Project.objects.get(id=project_id)
        
        # Check access
        if not (project.owner == user or project.members.filter(email=user.email).exists()):
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get analytics data
        total_tasks = project.tasks.count()
        completed_tasks = project.tasks.filter(status='completed').count()
        overdue_tasks = project.tasks.filter(
            due_date__lt=timezone.now(),
            status__in=['todo', 'in_progress']
        ).count()
        
        task_status_breakdown = project.tasks.values('status').annotate(count=Count('status'))
        
        return Response({
            'project': ProjectSerializer(project).data,
            'analytics': {
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
                'overdue_tasks': overdue_tasks,
                'completion_rate': (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0,
                'task_status_breakdown': list(task_status_breakdown)
            }
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
#Notification views
class NotificationListView(APIView):
    def get_user_from_token(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        token = auth_header.split(' ')[1]
        try:
            payload = UntypedToken(token).payload
            user_email = payload.get('user_email')
            return User.objects.get(email=user_email)
        except:
            return None

    def get(self, request):
        user = self.get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            # Step 1 & 2: Get project IDs for the logged-in user from UserProject
            project_id = UserProject.objects.filter(email=user).values_list('project_id', flat=True)
            
            # Step 3: Get notifications for those projects using project_id FK
            notifications = Notification.objects.filter(
                Q(project_id__in=project_id)
            ).order_by('-time_sent')
            
            # Step 4 & 5: Serialize notifications and format as requested
            serializer = NotificationSummarySerializer(notifications, many=True)
            
            # Format response as an array of key-value pairs with title+time_sent as key
            formatted_notifications = [
                {
                    f"{notif['title']} ({notif['time_ago']})": {
                        "message": notif['message'],
                        "notification_type": notif['notification_type'],
                        "time_sent": notif['time_sent'],
                        "grades": notif['grades'] if notif['grades'] else None,
                        "due_date": notif['due_date'] if notif['due_date'] else None,
                        "project_name": Project.objects.get(project_id=notif['project']).project_name if notif['project'] else None,
                        "task_name": notif['task'].task_name if notif['task'] else None,
                    }
                } for notif in serializer.data
            ]
            
            return Response(formatted_notifications, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Failed to fetch notifications: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        user = self.get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            # Step 6: Extract required data from frontend
            project_id = request.data.get('project_id')
            title = request.data.get('title')
            message = request.data.get('message')
            notification_type = request.data.get('notification_type', 'system')  # Default to system if not provided
            
            if not all([project_id, title, message]):
                return Response({'error': 'project_id, title, and message are required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Verify user has access to the project
            if not UserProject.objects.filter(email=user, project_id=project_id).exists():
                return Response({'error': 'Access denied to this project'}, status=status.HTTP_403_FORBIDDEN)
            
            # Get project instance
            project = Project.objects.get(project_id=project_id)
            
            # Create notification
            notification = Notification.objects.create(
                project_id=project,
                title=title,
                message=message,
                notification_type=notification_type,
                project=project,  # Set redundant project FK
                time_sent=timezone.now(),
                grades=request.data.get('grades'),  # Optional fields
                due_date=request.data.get('due_date'),
                task_id=request.data.get('task_id'),  # Optional task reference
                requested_by=user if notification_type == 'edit_requested' else None
            )
            
            # Log activity (consistent with existing views)
            from .models import ActivityLog
            ActivityLog.objects.create(
                user=user,
                project=project,
                action_type='notification_created',
                description=f'Created notification: {title}'
            )
            
            # Serialize the created notification
            serializer = NotificationSummarySerializer(notification)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'Failed to create notification: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
    serializer_class = NotificationSummarySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter notifications by type"""
        notification_type = self.request.query_params.get('type')
        queryset = Notification.objects.filter(recipient=self.request.user)
        
        if notification_type and notification_type in dict(Notification.NOTIFICATION_TYPES):
            queryset = queryset.filter(notification_type=notification_type)
        
        return queryset
>>>>>>> main
