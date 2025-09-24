from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import User, Project, Task, Message, Document, ActivityLog, ProjectMember, Notification, User_Task, UserProject
from .serializers import (
    UserSerializer, ProjectSerializer, TaskSerializer, MessageSerializer,
    DocumentSerializer, ActivityLogSerializer, DashboardStatsSerializer, NotificationSummarySerializer
)
from .utils import notify_due_dates
from rest_framework_simplejwt.tokens import UntypedToken, AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken
from datetime import datetime, timedelta
from django.db import connection
from django.db.models import Q, Count
from django.utils import timezone
import bcrypt
import binascii

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        try:
            user = User.objects.get(email=email)
            hash_bytes = binascii.unhexlify(user.password[2:])

            if not bcrypt.checkpw(password.encode('utf-8'), hash_bytes):
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

            current_time = datetime.utcnow()
            access = AccessToken()
            access.set_exp(from_time=current_time, lifetime=timedelta(hours=1))
            access.payload['user_email'] = user.email
            access.payload['fname'] = user.fname
            access.payload['lname'] = user.lname
            username = f"{user.fname} {user.lname}"
            return Response({
                'access': str(access),
                'username': username,
                'email': user.email
            })
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class DashboardView(APIView):
    def get(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        token = auth_header.split(' ')[1]
        try:
            UntypedToken(token)
            payload = UntypedToken(token).payload
            user_email = payload.get('user_email')
            user = User.objects.get(email=user_email)
            
            # Get dashboard statistics
            now = timezone.now()
            week_from_now = now + timedelta(days=7)
            
            # User's projects (as owner or member)
            user_projects = Project.objects.filter(
                Q(owner=user) | Q(members=user)
            ).distinct()
            
            active_projects = user_projects.filter(status__in=['planning', 'in_progress']).count()
            
            # Tasks assigned to user
            user_tasks = Task.objects.filter(assignee=user)
            tasks_due_this_week = user_tasks.filter(
                due_date__gte=now,
                due_date__lte=week_from_now,
                status__in=['todo', 'in_progress']
            ).count()
            
            unread_messages = Message.objects.filter(recipient=user, is_read=False).count()
            
            # Recent activities
            recent_activities = ActivityLog.objects.filter(
                project__in=user_projects
            )[:10]
            
            # Upcoming deadlines
            upcoming_deadlines = user_tasks.filter(
                due_date__gte=now,
                status__in=['todo', 'in_progress']
            ).order_by('due_date')[:5]
            
            # Check and send due date approaching notifications
            notify_due_dates()
            
            return Response({
                'email': user.email,
                'username': user.fname + ' ' + user.lname,
                'stats': {
                    'active_projects': active_projects,
                    'tasks_due_this_week': tasks_due_this_week,
                    'unread_messages': unread_messages,
                },
                'recent_activities': ActivityLogSerializer(recent_activities, many=True).data,
                'upcoming_deadlines': TaskSerializer(upcoming_deadlines, many=True).data,
                'projects': ProjectSerializer(user_projects[:5], many=True).data
            })
        except InvalidToken:
            return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)

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

            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            # Insert new user with raw SQL
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO pcpusers (email, fname, lname, password) VALUES (%s, %s, %s, %s)",
                    [user_email, fname, lname, hashed_password]
                )
            return Response({'message': 'User added successfully', 'id': user_email}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f'Failed to add user: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

class ProjectListCreateView(APIView):
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
        
        # Get projects where user is owner or member
        projects = Project.objects.filter(
            Q(owner=user) | Q(members=user)
        ).distinct().order_by('-updated_at')
        
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = self.get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        data = request.data.copy()
        data['owner'] = user.email
        
        try:
            project = Project.objects.create(
                name=data.get('name'),
                description=data.get('description', ''),
                owner=user,
                status=data.get('status', 'planning'),
                priority=data.get('priority', 'medium'),
                start_date=data.get('start_date'),
                due_date=data.get('due_date')
            )
            
            # Log activity
            ActivityLog.objects.create(
                user=user,
                project=project,
                action_type='project_created',
                description=f'Created project: {project.name}'
            )
            
            serializer = ProjectSerializer(project)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
 ########################################################    
    def patch(self, request, pk):
        user = self.get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            project = Project.objects.get(id=pk)
            if not (project.owner == user or project.members.filter(email=user.email).exists()):
                return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
            due_date = request.data.get('due_date')
            if due_date:
                project.due_date = due_date
                project.save()
                ActivityLog.objects.create(
                    user=user,
                    project=project,
                    action_type='due_date_changed',
                    description=f'Changed due date to {due_date}'
                )
            serializer = ProjectSerializer(project)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class TaskListCreateView(APIView):
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
        
        # Get tasks assigned to user or in projects they're part of
        user_projects = Project.objects.filter(
            Q(owner=user) | Q(members=user)
        ).distinct()
        
        tasks = Task.objects.filter(
            Q(assignee=user) | Q(project__in=user_projects)
        ).distinct().order_by('-created_at')
        
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = self.get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            project = Project.objects.get(id=request.data.get('project_id'))
            
            # Check if user has access to this project
            if not (project.owner == user or project.members.filter(email=user.email).exists()):
                return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
            
            task = Task.objects.create(
                title=request.data.get('title'),
                description=request.data.get('description', ''),
                project=project,
                creator=user,
                assignee_id=request.data.get('assignee_email'),
                status=request.data.get('status', 'todo'),
                priority=request.data.get('priority', 'medium'),
                due_date=request.data.get('due_date')
            )
            
            # Log activity
            ActivityLog.objects.create(
                user=user,
                project=project,
                action_type='task_created',
                description=f'Created task: {task.title}'
            )
            
            serializer = TaskSerializer(task)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

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