import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import UntypedToken, AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken
from datetime import datetime, timedelta
from .models import User, Project, UserProject, Task, User_Task, Document,ChatMessage, ProjectChat, ProjectLinks, Meeting
from django.core.files.storage import default_storage
from django.core.files.uploadedfile import UploadedFile
from django.core.files.base import ContentFile
from django.http import HttpResponse
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from .serializers import (
    UserSerializer, ProjectSerializer, MessageSerializer,
    DocumentSerializer, NotificationSummarySerializer
)
from rest_framework.decorators import api_view
from rest_framework import status, permissions
import bcrypt
import logging
import mimetypes
from django.utils import timezone


logger = logging.getLogger(__name__)

# Helper function to extract user from JWT token
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
    
#View that handles user login
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

#View that returns dashboard data
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
            user = User.objects.get(email=user_email)
            user_projects = UserProject.objects.filter(email=user).select_related('project_id')
            project_ids = [up.project_id.project_id for up in user_projects]  # Extract the actual project_id (integer)
            tasks = Task.objects.filter(project_id__in=project_ids).values('project_id', 'task_status')

            progress_by_project = {}
            for project_id in project_ids:
                project_tasks = [t for t in tasks if t['project_id'] == project_id]
                total_tasks = len(project_tasks)
                if total_tasks > 0:
                    completed_tasks = sum(1 for t in project_tasks if t['task_status'] == 'Finalized')
                    progress_by_project[project_id] = int((completed_tasks / total_tasks) * 100)
                else:
                    progress_by_project[project_id] = 0

            projects = [
                {
                    'project_id': user_project.project_id.project_id,
                    'project_name': user_project.project_id.project_name,
                    'project_description': user_project.project_id.project_description,
                    'feedback': user_project.project_id.feedback,
                    'grade': user_project.project_id.grade,
                    'progress': progress_by_project.get(user_project.project_id.project_id, 0),
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

#View that adds users to database
class AddUserView(APIView):
    def post(self, request):
        try:
            user_email = request.data.get('email')
            fname = request.data.get('fname')
            lname = request.data.get('lname')
            password = request.data.get('password')
            security_question = request.data.get('security_question')
            security_answer = request.data.get('security_answer')

            # Validate inputs
            if not all([user_email, fname, lname, password, security_question, security_answer]):
                return Response({'error': 'All fields (email address, first name, last name, password, security question and answer) are required'}, status=status.HTTP_400_BAD_REQUEST)

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
                password=hashed_password,
                security_question=security_question,
                security_answer=security_answer
            )
            return Response({'message': 'User added successfully', 'id': user.email}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f'Failed to add user: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#View that adds projects
class AddProjectView(APIView):
    def post(self, request):
        try:
            project_name = request.data.get('project_name')
            project_description = request.data.get('project_description')
            project_due_date = request.data.get('project_due_date')
            project_members = request.data.get('project_members', [])

            # Validate
            if not all([project_name, project_description, project_due_date]):
                return Response({'error': 'Project name, description, and due date are required'}, status=status.HTTP_400_BAD_REQUEST)

            # Create new project using ORM
            project = Project.objects.create(
                due_date=project_due_date,
                project_name=project_name,
                project_description=project_description,
                created_on=datetime.today().date()
            )

            group_leader_email = None
            # Add project members using ORM with updated role logic
            for index, member_email in enumerate(project_members):
                if not member_email:
                    continue
                role = 'Supervisor' if index == 0 else 'Group Leader' if index == 1 else 'Student'
                if index == 1:
                    group_leader_email = member_email
                user = User.objects.get(email=member_email)
                UserProject.objects.create(
                    email=user,
                    project_id=project,
                    role=role
                )

            # Auto-create "Final Submission" task if there's a Group Leader
            if group_leader_email:
                task = Task.objects.create(
                    task_name='Final Submission',
                    task_description='Upload the final project documents here for supervisor review.',
                    task_due_date=project.due_date,
                    task_status='Pending',
                    task_priority='High',
                    project_id=project
                )
                group_leader = User.objects.get(email=group_leader_email)
                User_Task.objects.create(
                    task_id=task,
                    email=group_leader
                )

            return Response({'message': 'Project added successfully'}, status=status.HTTP_201_CREATED)
        except User.DoesNotExist:
            return Response({'error': 'One or more users not found'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Failed to add project: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UploadDocumentView(APIView):
    def post(self, request):
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        task_id = request.data.get('task_id')
        title = request.data.get('title', '')
        file = request.FILES.get('file')

        if not task_id or not file:
            return Response({'error': 'task_id and file are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            task = Task.objects.get(task_id=task_id)
            # Check if user is assigned to the task
            if not User_Task.objects.filter(email=user, task_id=task).exists():
                return Response({'error': 'You are not assigned to this task'}, status=status.HTTP_403_FORBIDDEN)

            document = Document.objects.create(
                task_id=task,
                document_title=title or file.name,
                last_modified_by=user,
                file=file,
                doc_type=file.content_type or 'application/octet-stream'
            )

            return Response({
                'message': 'Document uploaded successfully',
                'document_id': document.document_id
            }, status=status.HTTP_201_CREATED)
        except Task.DoesNotExist:
            return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f'Error uploading document: {str(e)}')
            return Response({'error': f'Failed to upload document: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#View that returns members of a project
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
 
                members = UserProject.objects.filter(project_id=project_id).values('email', 'role')
                emails = [member['email'] for member in members]
                first_names = User.objects.filter(email__in=emails).values('email', 'first_name', 'last_name')
                first_name_map = {item['email']: item['first_name'] for item in first_names}
                last_name_map = {item['email']: item['last_name'] for item in first_names}
                members_list = [
                    {
                        'email': member['email'],
                        'first_name': first_name_map.get(member['email'], 'Unknown'),  # Default to 'Unknown' if no first_name
                        'last_name': last_name_map.get(member['email'], 'Unknown'),   # Default to 'Unknown' if no last_name
                        'role': member['role']
                    }
                    for member in members
                ]
                return Response({'members': members_list}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response(
                    {'error': f'Failed to fetch members: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

#View that adds tasks
class AddTaskView(APIView):
    def post(self, request):
        try:
            task_name = request.data.get('task_name')
            task_description = request.data.get('task_description')
            task_due_date = request.data.get('task_due_date')
            task_status = request.data.get('task_status')
            task_priority = request.data.get('task_priority')
            project_id = Project.objects.get(project_id=request.data.get('project_id'))
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
        except Project.DoesNotExist:
           return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

#View for calendar data        
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
                    'start': user_project.project_id.due_date.strftime('%Y-%m-%d'),
                    'type': 'project',
                    'id': user_project.project_id.project_id,
                    'name': user_project.project_id.project_name,
                    'description': user_project.project_id.project_description or '',
                    'role': user_project.role
                }
                for user_project in user_projects
            ]
            
            # Fetch user tasks with project information
            user_tasks = User_Task.objects.filter(email=user).select_related('task_id', 'task_id__project_id')
            task_events = [
                {
                    'title': f"Task: {user_task.task_id.task_name}",
                    'start': user_task.task_id.task_due_date.strftime('%Y-%m-%d'),
                    'type': 'task',
                    'id': user_task.task_id.task_id,
                    'name': user_task.task_id.task_name,
                    'description': user_task.task_id.task_description or '',
                    'status': user_task.task_id.task_status,
                    'priority': user_task.task_id.task_priority,
                    'project': {
                        'id': user_task.task_id.project_id.project_id,
                        'name': user_task.task_id.project_id.project_name
                    } if user_task.task_id.project_id else None
                }
                for user_task in user_tasks
            ]
            
            # Combine project and task events
            events = project_events + task_events
            
            # Get current server time
            current_time = timezone.now().strftime('%Y-%m-%d %H:%M:%S')
            
            return Response({
                'events': events,
                'current_time': current_time
            })
            
        except InvalidToken:
            return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({'error': f'Database error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#View that returns tasks for a user
class GetUserTasksView(APIView):
    def get(self, request):
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
            
            token = auth_header.split(' ')[1]
            try:
                # Validate token
                payload = UntypedToken(token).payload
                user_email = payload.get('user_email')
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
            except InvalidToken:
                return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)
            except Exception as e:
                return Response({'error': f'Database error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#View that updates tasks
class UpdateTaskView(APIView):
    def post(self, request):
        try:
            task_id = request.data.get('task_id')
            task_name = request.data.get('task_name')
            task_description = request.data.get('task_description')
            task_due_date = request.data.get('due_date')
            print(task_id)

            task = Task.objects.get(task_id=task_id)
            task.task_name = task_name
            task.task_description = task_description
            task.task_due_date = task_due_date
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
    
#View that displays sends related to a project
class GetProjectTasksView(APIView):
    def get(self, request):
        project_id = request.query_params.get('project_id')
        if not project_id:
            return Response({'error': 'project_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            # Get user's projects to verify access
            user_projects = UserProject.objects.filter(email=user, project_id=project_id).exists()
            if not user_projects:
                return Response({'error': 'Access denied to this project'}, status=status.HTTP_403_FORBIDDEN)

            tasks = Task.objects.filter(project_id=project_id).select_related('project_id')
            tasks_data = []
            for task in tasks:
                assignees = User_Task.objects.filter(task_id=task).select_related('email')
                assignee_emails = [ut.email.email for ut in assignees]
                assignee_names = User.objects.filter(email__in=assignee_emails).values('first_name', 'last_name', 'email')
                tasks_data.append({
                    'task_id': task.task_id,
                    'task_name': task.task_name,
                    'task_description': task.task_description,
                    'task_due_date': task.task_due_date.strftime('%Y-%m-%d'),
                    'task_status': task.task_status,
                    'task_priority': task.task_priority,
                    'assignees': list(assignee_names)
                })
            return Response({'tasks': tasks_data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Failed to fetch tasks: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#View that deletes tasks
class DeleteTaskView(APIView):
    def delete(self, request, task_id):
        try:
            task = Task.objects.get(task_id=task_id)
            task.delete()
            return Response({'message': 'Task deleted successfully'}, status=status.HTTP_200_OK)
        except Task.DoesNotExist:
            return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

class ReviewTask(APIView):
    def post(self, request, task_id):
        try:
            task = Task.objects.get(task_id=task_id)
            task_status = request.data.get('status')
            print("Status: ", task_status)
            
            # Ensure task_status is not None, use a default or raise an error
            if task_status is None:
                return Response(
                    {'error': 'Status is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            task.task_status = task_status
            task.save()
            return Response({'message': 'Task reviewed'}, status=status.HTTP_200_OK)
        except Task.DoesNotExist:
            return Response(
                {'error': 'Task not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

#View that adds user to project
class AddProjectUserView(APIView):
    def post(self, request):
        try:
            project_id = request.data.get('project_id')
            email = request.data.get('email')
            role = request.data.get('role')
            
            if not all([project_id, email, role]):
                return Response({'error': 'project_id, email, and role are required'}, status=status.HTTP_400_BAD_REQUEST)
            
            project = Project.objects.get(project_id=project_id)
            user = User.objects.get(email=email)
            project_user = UserProject.objects.create(
                project_id=project,
                email=user,
                role=role
            )
            return Response({'message': 'User added to project successfully'}, status=status.HTTP_201_CREATED)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'Failed to add user: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#View that sends documents related to a task
class GetTaskDocumentsView(APIView):
    def get(self, request):
        try:
            task_id = request.GET.get('task_id')
            if not task_id:
                return Response({'error': 'Task ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            documents = Document.objects.filter(task_id__task_id=task_id)
            serializer = DocumentSerializer(documents, many=True)
            
            return Response({'documents': serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in GetTaskDocumentsView: {str(e)}")
            return Response({'error': f'Failed to fetch documents: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#View that provides project data
class GetProjectDataView(APIView):
    def get(self, request):
        try:
            project_id = request.GET.get('project_id')
            if not project_id:
                return Response({'error': 'Project ID is required'}, status=status.HTTP_400_BAD_REQUEST)
           
            project = Project.objects.get(project_id=project_id)
 
            project_data = {
                'project_name': project.project_name,
                'project_description': project.project_description,
                'due_date': project.due_date.strftime('%d/%m/%Y') if project.due_date else 'No due date',
                'created_on': project.created_on.strftime('%d/%m/%Y'),
                'feedback': project.feedback or '',
                'grade': project.grade or ''
            }
 
            return Response({'project_data': project_data}, status=status.HTTP_200_OK)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

#View that uploads documents
class DocumentUploadView(APIView):
    def get_mime_type_and_extension(self, file):

        # Get filename and extension
        filename = file.name
        file_ext = os.path.splitext(filename)[1].lower() if filename else ''
        
        # First try to get MIME type from file content_type
        mime_type = file.content_type
        
        # If content_type is unreliable, guess from filename
        if not mime_type or mime_type == 'application/octet-stream':
            guessed_mime, _ = mimetypes.guess_type(filename)
            if guessed_mime:
                mime_type = guessed_mime
            else:
                mime_type = 'application/octet-stream'
        
        # Normalize MIME type and get proper extension
        mime_to_ext = {
            'application/pdf': '.pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
            'application/msword': '.doc',
            'image/jpeg': '.jpg',
            'image/jpg': '.jpg',
            'image/png': '.png',
            'text/plain': '.txt',
            'text/csv': '.csv',
            'application/vnd.ms-excel': '.xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
            'application/vnd.ms-powerpoint': '.ppt',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
            'application/zip': '.zip',
            'application/x-zip-compressed': '.zip',
        }
        
        # Get proper extension based on MIME type
        proper_ext = mime_to_ext.get(mime_type)
        
        # If we couldn't determine proper extension from MIME type, use file extension
        if not proper_ext:
            if file_ext and file_ext != '.bin':
                proper_ext = file_ext
            else:
                proper_ext = '.bin'
        
        logger.info(f"File: {filename}, Detected MIME: {mime_type}, Extension: {proper_ext}")
        return mime_type, proper_ext

    def post(self, request):
        logger.info(f"Received document upload request: {dict(request.data)}")
        user = get_user_from_token(request)
        if not user:
            logger.error("Authentication failed: No valid user token")
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        file = request.FILES.get('file')
        title = request.data.get('title')
        description = request.data.get('description')
        task_id = request.data.get('task_id')  # Optional

        if not file or not title:
            logger.error("Missing required fields: file or title")
            return Response({'error': 'File and title are required'}, status=status.HTTP_400_BAD_REQUEST)

        task = None
        if task_id:
            try:
                task_id_int = int(task_id)
                task = Task.objects.get(task_id=task_id_int)
                logger.info(f"Found task: task_id={task_id_int}")
            except ValueError:
                logger.error(f"Invalid task_id: {task_id}")
                return Response({'error': 'Invalid task ID'}, status=status.HTTP_400_BAD_REQUEST)
            except Task.DoesNotExist:
                logger.error(f"Task not found: task_id={task_id}")
                return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            # Use improved MIME type and extension detection
            mime_type, proper_ext = self.get_mime_type_and_extension(file)
            
            # Ensure title has proper extension
            title_base = os.path.splitext(title)[0]  # Remove existing extension if any
            final_title = f"{title_base}{proper_ext}"
            
            logger.info(f"Final title: {final_title}, MIME type: {mime_type}")

            document = Document(
                task_id=task,
                document_title=final_title,
                document_description=description,
                doc_type=mime_type,
                last_modified_by=user,
                file=file
            )
            document.save()
            
            logger.info(f"Document saved: document_id={document.document_id}, doc_type={document.doc_type}")
            serializer = DocumentSerializer(document)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error saving document: {str(e)}")
            return Response({'error': f'Failed to save document: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#View that downloads documents
class DownloadDocumentView(APIView):
    def get_proper_mime_type(self, filename, stored_mime_type=None):
        """
        Get the most accurate MIME type for a file based on its extension
        """
        # Comprehensive MIME type mapping - prioritize these over guessed types
        extension_to_mime = {
            '.pdf': 'application/pdf',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.doc': 'application/msword',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.xls': 'application/vnd.ms-excel',
            '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            '.ppt': 'application/vnd.ms-powerpoint',
            '.txt': 'text/plain',
            '.csv': 'text/csv',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.zip': 'application/zip',
            '.rar': 'application/x-rar-compressed',
            '.7z': 'application/x-7z-compressed',
        }
        
        # Get file extension
        file_ext = os.path.splitext(filename)[1].lower()
        
        # First priority: our explicit mapping
        if file_ext in extension_to_mime:
            return extension_to_mime[file_ext]
        
        # Second priority: Python's mimetypes guess
        guessed_mime, _ = mimetypes.guess_type(filename)
        if guessed_mime:
            return guessed_mime
            
        # Third priority: stored MIME type (if reliable)
        if stored_mime_type and stored_mime_type != 'application/octet-stream':
            return stored_mime_type
            
        # Fallback
        return 'application/octet-stream'

    def get_safe_filename(self, filename):
        """
        Ensure filename is safe for download and properly encoded
        """
        # Remove any path separators and clean up filename
        safe_filename = os.path.basename(filename)
        
        # Replace any problematic characters
        problematic_chars = ['<', '>', ':', '"', '|', '?', '*']
        for char in problematic_chars:
            safe_filename = safe_filename.replace(char, '_')
            
        return safe_filename

    def get(self, request):
        user = get_user_from_token(request)
        if not user:
            logger.error("Authentication failed: No valid user token")
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        document_id = request.GET.get('document_id')
        if not document_id:
            logger.error("Missing document_id")
            return Response({'error': 'Document ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            document = Document.objects.get(document_id=document_id)
            
            # Verify user has access to the project associated with the document's task
            if document.task_id:
                project_id = document.task_id.project_id
                if not UserProject.objects.filter(email=user, project_id=project_id).exists():
                    logger.error(f"User {user.email} does not have access to project {project_id.project_id}")
                    return Response({'error': 'Access denied to this document'}, status=status.HTTP_403_FORBIDDEN)

            if not document.file:
                logger.error(f"No file associated with document_id {document_id}")
                return Response({'error': 'No file found for this document'}, status=status.HTTP_404_NOT_FOUND)

            # Get the filename - prefer document title, fallback to file name
            filename = document.document_title
            if not filename:
                filename = document.file.name.split('/')[-1] if document.file.name else f"document_{document_id}"
            
            # Ensure filename is safe
            safe_filename = self.get_safe_filename(filename)
            
            # Get proper MIME type
            mime_type = self.get_proper_mime_type(safe_filename, document.doc_type)
            
            logger.info(f"Downloading: {safe_filename}, MIME: {mime_type}")

            # Read and serve the file
            try:
                file_content = document.file.open('rb')
                file_data = file_content.read()
                file_content.close()
                
                response = HttpResponse(
                    content=file_data,
                    content_type=mime_type
                )
                
                # Set proper headers for download
                # Use both filename and filename* for better browser compatibility
                response['Content-Disposition'] = f'attachment; filename="{safe_filename}"; filename*=UTF-8\'\'{safe_filename}'
                response['Content-Length'] = len(file_data)
                response['Content-Type'] = mime_type
                
                # Additional headers to help with file association
                response['X-Content-Type-Options'] = 'nosniff'
                response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
                
                logger.info(f"Serving file: {safe_filename} ({len(file_data)} bytes) with MIME: {mime_type}")
                return response
                
            except Exception as file_error:
                logger.error(f"Error reading file: {str(file_error)}")
                return Response({'error': f'Error reading file: {str(file_error)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Document.DoesNotExist:
            logger.error(f"Document not found: document_id={document_id}")
            return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error downloading document: {str(e)}")
            return Response({'error': f'Failed to download document: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#View that removes user from project
class DeleteProjectUserView(APIView):
    def post(self, request):
        project_id = request.data.get('project_id')
        email = request.data.get('email')
        
        try:
            user_project = UserProject.objects.get(project_id=project_id, email=email)
            
            # Count current Supervisors and Group Leaders
            supervisors = UserProject.objects.filter(project_id=project_id, role='Supervisor').count()
            group_leaders = UserProject.objects.filter(project_id=project_id, role='Group Leader').count()
            
            role = user_project.role
            # Simulate counts after deletion
            new_sup = supervisors - (1 if role == 'Supervisor' else 0)
            new_gl = group_leaders - (1 if role == 'Group Leader' else 0)
            
            if new_sup < 1 or new_gl < 1:
                return Response({
                    'error': 'Cannot remove member: Project must have at least one Supervisor and one Group Leader'
                }, status=status.HTTP_403_FORBIDDEN)
            
            user_project.delete()
            return Response({'message': 'Project user deleted successfully'}, status=status.HTTP_200_OK)
        except UserProject.DoesNotExist:
            return Response({'error': 'User not found in project'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'Failed to delete member: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#View that deletes documents
class DeleteDocumentView(APIView):
    def delete(self, request, document_id):
        # Use manual JWT authentication
        user = get_user_from_token(request)
        if not user:
            logger.error("Authentication failed: No valid user token")
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            document = Document.objects.get(document_id=document_id)
            
            # Verify user has access if document is associated with a task/project
            if document.task_id:
                project = document.task_id.project_id
                if not UserProject.objects.filter(email=user, project_id=project).exists():
                    logger.error(f"User {user.email} does not have access to project {project.project_id}")
                    return Response({'error': 'Access denied to this document'}, status=status.HTTP_403_FORBIDDEN)

            # Delete the document
            document.delete()
            
            logger.info(f"Document deleted: document_id={document_id} by user={user.email}")
            return Response({'message': 'Document deleted successfully'}, status=status.HTTP_200_OK)
        
        except Document.DoesNotExist:
            logger.error(f"Document not found: document_id={document_id}")
            return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            logger.error(f"Error deleting document: {str(e)}")
            return Response({'error': f'Failed to delete document: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)   


class GetCompletedTasksView(APIView):
    def get(self, request):
        try:
            requested_project_id = request.GET.get('project_id')
            if not requested_project_id:
                return Response({'error': 'Project ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            project = Project.objects.get(project_id=requested_project_id)
            tasks = Task.objects.filter(project_id=project, task_status='Completed')
            task_members = User_Task.objects.filter(task_id__in=tasks).select_related('email', 'task_id')
            task_members_dict = {}
            for task_member in task_members:
                task_id = task_member.task_id.task_id
                try:
                    user = User.objects.get(email=task_member.email.email)
                    # Initialize list for task_id if it doesn't exist
                    if task_id not in task_members_dict:
                        task_members_dict[task_id] = []
                    # Append user details to the list for this task_id
                    task_members_dict[task_id].append({
                        'fname': user.first_name,
                        'lname': user.last_name
                    })
                except User.DoesNotExist:
                    # Handle case where user is not found (optional)
                    if task_id not in task_members_dict:
                        task_members_dict[task_id] = []
                    task_members_dict[task_id].append({'fname': 'Unknown', 'lname': 'Unknown'})
            tasks_list = [
                {
                    'task_id': task.task_id,
                    'task_name': task.task_name,
                    'task_description': task.task_description,
                    'task_status': task.task_status,
                    'task_due_date': task.task_due_date.strftime('%d/%m/%Y') if task.task_due_date else 'No due date',
                    'task_priority': task.task_priority,
                    'assigned_members': task_members_dict.get(task.task_id, [])
                }
                for task in tasks
            ]
            return Response({'tasks': tasks_list, 'members': task_members_dict}, status=status.HTTP_200_OK)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'Failed to fetch tasks: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetFinalizedTasksView(APIView):
    def get(self, request, requested_project_id):
        try:
            user = get_user_from_token(request)
            if not user:
                logger.error("Authentication failed: No valid user token")
                return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Fetch the project
            project = Project.objects.get(project_id=requested_project_id)
            
            # Get all tasks for the project
            all_tasks = Task.objects.filter(project_id=project)
            # Get only finalized tasks
            finalized_tasks = all_tasks.filter(task_status='Finalized')
            
            # Check if all tasks are finalized
            if all_tasks.count() != finalized_tasks.count():
                return Response(
                    {'error': 'Not all tasks are finalized'},
                )
            
            # If all tasks are finalized, proceed with the original logic
            task_members = User_Task.objects.filter(task_id__in=finalized_tasks).select_related('email', 'task_id')
            task_members_dict = {}
            for task_member in task_members:
                task_id = task_member.task_id.task_id
                try:
                    user = User.objects.get(email=task_member.email.email)
                    if task_id not in task_members_dict:
                        task_members_dict[task_id] = []
                    task_members_dict[task_id].append({
                        'fname': user.first_name,
                        'lname': user.last_name
                    })
                except User.DoesNotExist:
                    if task_id not in task_members_dict:
                        task_members_dict[task_id] = []
                    task_members_dict[task_id].append({'fname': 'Unknown', 'lname': 'Unknown'})
            
            tasks_list = [
                {
                    'task_id': task.task_id,
                    'task_name': task.task_name,
                    'task_description': task.task_description,
                    'task_status': task.task_status,
                    'task_due_date': task.task_due_date.strftime('%d/%m/%Y') if task.task_due_date else 'No due date',
                    'task_priority': task.task_priority,
                    'assigned_members': task_members_dict.get(task.task_id, [])
                }
                for task in finalized_tasks
            ]
            
            return Response(
                {'tasks': tasks_list, 'members': task_members_dict},
                status=status.HTTP_200_OK
            )
        
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'Failed to fetch tasks: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# API endpoint to fetch chat history for a specific project.
# Requires authentication via JWT token.
# Query param: project_id (required)
# Returns: List of messages with sender details, content, and timestamp.
class GetProjectChatView(APIView):

    def get(self, request):
        # Extract project_id from query params
        project_id = request.GET.get('project_id')
        if not project_id:
            return Response({'error': 'Project ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Authenticate user from token
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            # Fetch project
            project = Project.objects.get(project_id=project_id)
            
            # Check if user has access to the project
            if not UserProject.objects.filter(email=user, project_id=project).exists():
                logger.error(f"User {user.email} does not have access to project {project_id}")
                return Response({'error': 'Access denied to this project'}, status=status.HTTP_403_FORBIDDEN)
            
            # Fetch project chats, ordered by message sent_at
            project_chats = ProjectChat.objects.filter(project_id=project).order_by('chat_message__sent_at').select_related('chat_message', 'chat_message__email')
            
            # Extract messages from project chats
            messages = [pc.chat_message for pc in project_chats]
            
            # Serialize messages with sender name and time
            serialized_messages = [
                {
                    'id': msg.chat_message_id,
                    'sender_email': msg.email.email,
                    'sender_name': f"{msg.email.first_name} {msg.email.last_name}",
                    'content': msg.content,
                    'sent_at': msg.sent_at.strftime('%Y-%m-%d %H:%M:%S'),  # Human-readable format
                    'role': msg.Role  # Include the Role field from the updated model
                }
                for msg in messages
            ]
            
            return Response({'messages': serialized_messages}, status=status.HTTP_200_OK)
        
        except Project.DoesNotExist:
            logger.error(f"Project not found: project_id={project_id}")
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            logger.error(f"Error fetching chat history: {str(e)}")
            return Response({'error': f'Failed to fetch chat history: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# API endpoint to send a new chat message to a project chat.
# Requires authentication via JWT token.
# POST data: project_id (required), content (required)
# Creates a ChatMessage and associates it with ProjectChat for consistency with models.
class SendChatMessageView(APIView):

    def post(self, request):
        # Extract data from request body
        project_id = request.data.get('project_id')
        content = request.data.get('content')
        
        if not project_id or not content:
            return Response({'error': 'project_id and content are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Authenticate user from token
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            # Fetch project
            project = Project.objects.get(project_id=project_id)
            
            # Check if user has access to the project and get role
            try:
                user_project = UserProject.objects.get(email=user, project_id=project)
            except UserProject.DoesNotExist:
                logger.error(f"User {user.email} does not have access to project {project_id}")
                return Response({'error': 'Access denied to this project'}, status=status.HTTP_403_FORBIDDEN)
            
            # Create the chat message with Role from UserProject
            message = ChatMessage.objects.create(
                email=user,
                sent_at=timezone.now(),
                content=content,
                Role=user_project.role
            )
            
            # Create ProjectChat entry to associate with project
            ProjectChat.objects.create(
                project_id=project,
                chat_message=message
            )
            
            logger.info(f"Message sent by {user.email} to project {project_id}")
            return Response({'message': 'Chat message sent successfully', 'id': message.chat_message_id}, status=status.HTTP_201_CREATED)
        
        except Project.DoesNotExist:
            logger.error(f"Project not found: project_id={project_id}")
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            logger.error(f"Error sending chat message: {str(e)}")
            return Response({'error': f'Failed to send chat message: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)   
        

#View that update project name,description and due date
class UpdateProjectDetailsView(APIView):
    def post(self, request):
        user = get_user_from_token(request)
        if not user:
            logger.error("Authentication failed: No valid user token")
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        project_id = request.data.get('project_id')
        name = request.data.get('name')
        description = request.data.get('description')
        due_date = request.data.get('due_date')

        if not project_id:
            return Response({'error': 'project_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        if not any([name, description, due_date]):
            return Response({'error': 'At least one field to update (name, description, due_date) is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            project = Project.objects.get(project_id=project_id)
            
            # Check if user has access and is Supervisor
            try:
                user_project = UserProject.objects.get(email=user, project_id=project)
                if user_project.role != 'Supervisor':
                    logger.error(f"User {user.email} is not a supervisor for project {project_id}")
                    return Response({'error': 'Only supervisors can update project details'}, status=status.HTTP_403_FORBIDDEN)
            except UserProject.DoesNotExist:
                logger.error(f"User {user.email} does not have access to project {project_id}")
                return Response({'error': 'Access denied to this project'}, status=status.HTTP_403_FORBIDDEN)

            if name:
                project.project_name = name
            if description:
                project.project_description = description
            if due_date:
                project.due_date = due_date  # Assumes due_date is in 'YYYY-MM-DD' format

            project.save()
            
            logger.info(f"Project {project_id} details updated by {user.email}")
            return Response({'message': 'Project details updated successfully'}, status=status.HTTP_200_OK)
        
        except Project.DoesNotExist:
            logger.error(f"Project not found: project_id={project_id}")
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            logger.error(f"Error updating project details: {str(e)}")
            return Response({'error': f'Failed to update project details: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#View that update project grade and feedback
class UpdateProjectFeedbackView(APIView):
    def post(self, request):
        user = get_user_from_token(request)
        if not user:
            logger.error("Authentication failed: No valid user token")
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        project_id = request.data.get('project_id')
        grade = request.data.get('grade')
        feedback = request.data.get('feedback')

        if not project_id:
            return Response({'error': 'project_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        if not any([grade, feedback]):
            return Response({'error': 'At least one field to update (grade, feedback) is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            project = Project.objects.get(project_id=project_id)
            
            if grade is not None:
                try:
                    project.grade = int(grade)
                except ValueError:
                    return Response({'error': 'Grade must be an integer'}, status=status.HTTP_400_BAD_REQUEST)
            if feedback:
                project.feedback = feedback

            project.save()
            
            logger.info(f"Project {project_id} feedback/grade updated by {user.email}")
            return Response({'message': 'Project feedback and grade updated successfully'}, status=status.HTTP_200_OK)
        
        except Project.DoesNotExist:
            logger.error(f"Project not found: project_id={project_id}")
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            logger.error(f"Error updating project feedback: {str(e)}")
            return Response({'error': f'Failed to update project feedback: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)      

#View that updates user profile
class UpdateProfileView(APIView):
    def post(self, request):
        # Authenticate user from token
        user = get_user_from_token(request)
        if not user:
            logger.error("Authentication failed: No valid user token")
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Extract fields from request data
        first_name = request.data.get('fname')
        last_name = request.data.get('lname')
        password = request.data.get('password')
        
        # Ensure at least one field is provided
        if not any([first_name, last_name, password]):
            return Response({'error': 'At least one field to update (fname, lname, password) is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Update fields if provided
            if first_name:
                user.first_name = first_name
            if last_name:
                user.last_name = last_name
            if password:
                hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                user.password = hashed_password
            
            user.save()
            
            logger.info(f"Profile updated for user {user.email}")
            return Response({'message': 'Profile updated successfully'}, status=status.HTTP_200_OK)
        
        except Exception as e:
            logger.error(f"Error updating profile: {str(e)}")
            return Response({'error': f'Failed to update profile: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


#Create notification for multiple users
#Frontend must send token and in the body a list of emails, title and message
class CreateNotificationView(APIView):
    def post(self, request):
        # Authenticate user from token 
        user = get_user_from_token(request)
        if not user:
            logger.error("Authentication failed: No valid user token")
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Extract data from request body
        emails = request.data.get('emails', [])  # Expecting a list of email strings
        title = request.data.get('title')
        message = request.data.get('message')
        
        if not isinstance(emails, list) or not emails or not title or not message:
            return Response({'error': 'emails (as a list), title, and message are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Create the notification
            notification = Notification.objects.create(title=title, message=message)
            
            # Link to each user via UserNotification
            created_links = []
            for email_str in emails:
                try:
                    recipient = User.objects.get(email=email_str)
                    user_notif = UserNotification.objects.create(email=recipient, notif=notification)
                    created_links.append(user_notif.user_notification_id)
                except User.DoesNotExist:
                    # Skip invalid emails or collect errors; here we skip silently
                    logger.warning(f"User with email {email_str} not found; skipping")
                    pass
            
            if not created_links:
                notification.delete()  # Clean up if no valid links were created
                return Response({'error': 'No valid users found for notification'}, status=status.HTTP_400_BAD_REQUEST)
            
            logger.info(f"Notification {notification.notif_id} created by {user.email} for {len(created_links)} users")
            return Response({
                'message': 'Notification created successfully',
                'notif_id': notification.notif_id
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            logger.error(f"Error creating notification: {str(e)}")
            return Response({'error': f'Failed to create notification: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#View that deletes notification for a specific user
#Frontend must send token (for email) and notif_id in the URL
class DeleteNotificationView(APIView):
    def delete(self, request, notif_id):
        # Authenticate user from token to get the user's email
        user = get_user_from_token(request)
        if not user:
            logger.error("Authentication failed: No valid user token")
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            # Fetch the notification
            notification = Notification.objects.get(notif_id=notif_id)
            
            # Find and delete the UserNotification link for this user
            user_notifs = UserNotification.objects.filter(email=user, notif=notification)
            if not user_notifs.exists():
                logger.warning(f"No notification link found for user {user.email} and notif_id {notif_id}")
                return Response({'error': 'Notification not found for this user'}, status=status.HTTP_404_NOT_FOUND)
            
            user_notifs.delete()
            
            # Check if the notification has no more links to user(s) and deletes it
            remaining_links = UserNotification.objects.filter(notif=notification).exists()
            if not remaining_links:
                notification.delete()
                logger.info(f"Notification {notif_id} deleted as it had no remaining user links")
            else:
                logger.info(f"Notification link deleted for user {user.email} and notif_id {notif_id}")
            
            return Response({'message': 'Notification deleted successfully for this user'}, status=status.HTTP_200_OK)
        
        except Notification.DoesNotExist:
            logger.error(f"Notification not found: notif_id={notif_id}")
            return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            logger.error(f"Error deleting notification: {str(e)}")
            return Response({'error': f'Failed to delete notification: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#View that marks a task as completed
class CompleteTaskView(APIView):
    def post(self, request):
        user = get_user_from_token(request)
        
        if not user:
            logger.error("Authentication failed: No valid user token")
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        task_id = request.data.get('task_id')
        task_status = request.data.get('task_status')
        if not task_id:
            return Response({'error': 'task_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            task = Task.objects.get(task_id=task_id)
            
            # Check if user is assigned to the task
            if not User_Task.objects.filter(email=user, task_id=task).exists():
                logger.error(f"User {user.email} is not assigned to task {task_id}")
                return Response({'error': 'You are not assigned to this task'}, status=status.HTTP_403_FORBIDDEN)

            task.task_status = task_status
            task.save()
            
            logger.info(f"Task {task_id} marked as completed by {user.email}")
            return Response({'message': 'Task marked as completed successfully'}, status=status.HTTP_200_OK)
        
        except Task.DoesNotExist:
            logger.error(f"Task not found: task_id={task_id}")
            return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            logger.error(f"Error completing task: {str(e)}")
            return Response({'error': f'Failed to complete task: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#View that fetches task details       
class GetTaskMembersView(APIView):
    def post(self, request):
        user = get_user_from_token(request)
        task_id = request.data.get('taskId')
        if not user:
            logger.error("Authentication failed: No valid user token")
        
        task = Task.objects.get(task_id=task_id)
        task_members = User_Task.objects.filter(task_id=task).select_related('email')
        email_list = [member.email.email for member in task_members]
        task_members = User.objects.filter(email__in=email_list)
        task_members_list = [{'first_name': member.first_name, 'last_name': member.last_name, 'email': member.email} for member in task_members]
        return Response({'task_members': task_members_list}, status=status.HTTP_200_OK)

#View that gets task details
class GetTaskDetailsView(APIView):
    def post(self, request):
        user = get_user_from_token(request)
        task_id = request.data.get('taskId')
        if not user:
            logger.error("Authentication failed: No valid user token")

        task = Task.objects.get(task_id=task_id)
        task_details = {
            'task_name': task.task_name,
            'task_description': task.task_description,
            'task_due_date': task.task_due_date
        }
        print(task_details)
        return Response({'task_details': task_details}, status=status.HTTP_200_OK)

#View that removes a member from a task
class RemoveTaskMemberView(APIView):
    def post(self, request):
        task_id = request.data.get('taskId')
        email = request.data.get('email')

        job = User_Task.objects.get(task_id=task_id, email=email)
        job.delete()
        return Response({'message': 'Task member removed successfully'}, status=status.HTTP_200_OK)

#View that adds a member to a task
class AddTaskMemberView(APIView):
    def post(self, request):
        task_id = request.data.get('taskId')
        email = request.data.get('email')
        task = Task.objects.get(task_id=task_id)
        user = User.objects.get(email=email)

        job = User_Task.objects.create(task_id=task, email=user)
        job.save()
        return Response({'message': 'Task member added successfully'}, status=status.HTTP_200_OK)

#View that deletes a project          
class DeleteProjectView(APIView):
    def delete(self, request, project_id):
        project = Project.objects.get(project_id=project_id)
        project.delete();
        return Response({'message': "Project deleted successfully"}, status=status.HTTP_200_OK)

#View that changes role of a user in a project
class ChangeRoleView(APIView):
    def post(self, request):
        # Authenticate the requester
        requester = get_user_from_token(request)
        if not requester:
            logger.error("Authentication failed: No valid user token")
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        # Extract data from request body
        member_email = request.data.get('email')
        project_id = request.data.get('project_id')
        new_role = request.data.get('new_role')

        if not all([member_email, project_id, new_role]):
            return Response({'error': 'email, project_id, and new_role are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Fetch the project
            project = Project.objects.get(project_id=project_id)

            # Fetch the member's UserProject entry
            try:
                member_project = UserProject.objects.get(email__email=member_email, project_id=project)
            except UserProject.DoesNotExist:
                logger.error(f"Member {member_email} not found in project {project_id}")
                return Response({'error': 'Member not found in this project'}, status=status.HTTP_404_NOT_FOUND)

            # Count current Supervisors and Group Leaders
            supervisors = UserProject.objects.filter(project_id=project_id, role='Supervisor').count()
            group_leaders = UserProject.objects.filter(project_id=project_id, role='Group Leader').count()
            current_role = member_project.role

            # Simulate counts after change
            new_sup = supervisors + (1 if new_role == 'Supervisor' else 0) - (1 if current_role == 'Supervisor' else 0)
            new_gl = group_leaders + (1 if new_role == 'Group Leader' else 0) - (1 if current_role == 'Group Leader' else 0)

            if new_sup < 1 or new_gl < 1:
                return Response({
                    'error': 'Cannot change role: Project must have at least one Supervisor and one Group Leader'
                }, status=status.HTTP_403_FORBIDDEN)

            # Update the role
            member_project.role = new_role
            member_project.save()

            logger.info(f"Role changed for {member_email} in project {project_id} to {new_role} by {requester.email}")
            return Response({'message': 'Role changed successfully'}, status=status.HTTP_200_OK)

        except Project.DoesNotExist:
            logger.error(f"Project not found: project_id={project_id}")
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.error(f"Error changing role: {str(e)}")
            return Response({'error': f'Failed to change role: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

# View to add a project link
class AddProjectLinkView(APIView):
    def post(self, request):
        user = get_user_from_token(request)
        if not user:
            logger.error("Authentication failed: No valid user token")
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        project_id = request.data.get('project_id')
        link_url = request.data.get('link')  # Assuming 'link' is the key for link_url as per user description

        if not project_id or not link_url:
            return Response({'error': 'project_id and link are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            project = Project.objects.get(project_id=project_id)
            
            # Create the link
            link = ProjectLinks.objects.create(
                project=project,
                link_url=link_url
            )
            
            logger.info(f"Link added to project {project_id} by {user.email}")
            return Response({
                'message': 'Link added successfully',
                'link_id': link.link_id
            }, status=status.HTTP_201_CREATED)
        
        except Project.DoesNotExist:
            logger.error(f"Project not found: project_id={project_id}")
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            logger.error(f"Error adding project link: {str(e)}")
            return Response({'error': f'Failed to add link: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# View to delete a project link
class DeleteProjectLinkView(APIView):
    def post(self, request):
        user = get_user_from_token(request)
        if not user:
            logger.error("Authentication failed: No valid user token")
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        project_id = request.data.get('project_id')
        link_id = request.data.get('link_id')  # Assuming 'Link_id' is sent as 'link_id'

        if not project_id or not link_id:
            return Response({'error': 'project_id and link_id are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            project = Project.objects.get(project_id=project_id)
            

            # Fetch and delete the link, ensuring it belongs to the project
            try:
                link = ProjectLinks.objects.get(link_id=link_id, project=project)
                link.delete()
                logger.info(f"Link {link_id} deleted from project {project_id} by {user.email}")
                return Response({'message': 'Link deleted successfully'}, status=status.HTTP_200_OK)
            except ProjectLinks.DoesNotExist:
                logger.error(f"Link {link_id} not found in project {project_id}")
                return Response({'error': 'Link not found in this project'}, status=status.HTTP_404_NOT_FOUND)
        
        except Project.DoesNotExist:
            logger.error(f"Project not found: project_id={project_id}")
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            logger.error(f"Error deleting project link: {str(e)}")
            return Response({'error': f'Failed to delete link: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#View to add a meeting
class AddMeetingView(APIView):
    def post(self, request):
        user = get_user_from_token(request)
        if not user:
            logger.error("Authentication failed: No valid user token")
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        project_id = request.data.get('project_id')
        meeting_title = request.data.get('meeting_title')
        date_time_str = request.data.get('date_time')  # Assuming frontend sends date_time as string

        if not all([project_id, meeting_title, date_time_str]):
            return Response({'error': 'project_id, meeting_title, and date_time are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            project = Project.objects.get(project_id=project_id)


            # Parse date_time (assuming format 'YYYY-MM-DD HH:MM:SS')
            try:
                date_time = datetime.strptime(date_time_str, '%Y-%m-%d %H:%M:%S')
            except ValueError:
                return Response({'error': 'Invalid date_time format. Expected YYYY-MM-DD HH:MM:SS'}, status=status.HTTP_400_BAD_REQUEST)

            # Create the meeting
            meeting = Meeting.objects.create(
                project_id=project,
                meeting_title=meeting_title,
                date_time=date_time
            )
            
            logger.info(f"Meeting {meeting.meeting_id} added for project {project_id} by {user.email}")
            return Response({'message': 'Meeting added successfully', 'meeting_id': meeting.meeting_id}, status=status.HTTP_201_CREATED)
        
        except Project.DoesNotExist:
            logger.error(f"Project not found: project_id={project_id}")
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            logger.error(f"Error adding meeting: {str(e)}")
            return Response({'error': f'Failed to add meeting: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#View to delete a meeting
class DeleteMeetingView(APIView):
    def delete(self, request, meeting_id):
        user = get_user_from_token(request)
        if not user:
            logger.error("Authentication failed: No valid user token")
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            meeting = Meeting.objects.get(meeting_id=meeting_id)
            project = meeting.project_id

            meeting.delete()
            
            logger.info(f"Meeting {meeting_id} deleted by {user.email}")
            return Response({'message': 'Meeting deleted successfully'}, status=status.HTTP_200_OK)
        
        except Meeting.DoesNotExist:
            logger.error(f"Meeting not found: meeting_id={meeting_id}")
            return Response({'error': 'Meeting not found'}, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            logger.error(f"Error deleting meeting: {str(e)}")
            return Response({'error': f'Failed to delete meeting: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# View to get user details for password reset        
class GetUserDetailsView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            details = {
                'first_name': user.first_name,
                'last_name': user.last_name,
                'security_question': user.security_question,
            }
            return Response({'user_details': details}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error fetching user details: {str(e)}")
            return Response({'error': f'Failed to fetch user details: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# View to verify security answer for password reset       
class VerifySecurityAnswerView(APIView):
    def post(self, request):
        email = request.data.get('email')
        security_answer = request.data.get('security_answer')
        
        if not email or not security_answer:
            return Response({'error': 'Email and security answer are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            if user.security_answer == security_answer:
                logger.info(f"Security answer verified successfully for user {email}")
                return Response({'message': 'Security answer is correct'}, status=status.HTTP_200_OK)
            else:
                logger.warning(f"Invalid security answer provided for user {email}")
                return Response({'error': 'Invalid security answer'}, status=status.HTTP_401_UNAUTHORIZED)
        
        except User.DoesNotExist:
            logger.warning(f"Security answer verification attempted for non-existent email: {email}")
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            logger.error(f"Error verifying security answer: {str(e)}")
            return Response({'error': f'Failed to verify security answer: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# View for resetting/forgot password
# This view allows updating the password for a user by providing email and new password.
# No authentication token is required, as it's intended for use on the login page.
class ResetPasswordView(APIView):
    def post(self, request):
        email = request.data.get('email')
        new_password = request.data.get('password')
        
        if not email or not new_password:
            return Response({'error': 'Email and new password are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            
            # Hash the new password
            hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            user.password = hashed_password
            user.save()
            
            logger.info(f"Password reset successfully for user {email}")
            return Response({'message': 'Password reset successfully'}, status=status.HTTP_200_OK)
        
        except User.DoesNotExist:
            logger.warning(f"Password reset attempted for non-existent email: {email}")
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            logger.error(f"Error resetting password: {str(e)}")
            return Response({'error': f'Failed to reset password: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)        