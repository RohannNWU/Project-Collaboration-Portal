from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.core.paginator import Paginator
from django.db.models import Q, Count, Avg, Sum
from django.utils import timezone
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

from .models import User, Project, Task, Message, Document, ActivityLog, ProjectMember
from .serializers import (
    UserSerializer, ProjectSerializer, TaskSerializer, MessageSerializer,
    DocumentSerializer, ActivityLogSerializer, DashboardStatsSerializer,
    TaskCreateSerializer, ProjectCreateSerializer
)
from rest_framework_simplejwt.tokens import UntypedToken, AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken
import bcrypt
import binascii

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
        logger.info(f"Login attempt for email: {request.data.get('email')}")
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({'error': 'Email and password are required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            
            if not user.is_active:
                return Response({'error': 'Account is deactivated'}, 
                              status=status.HTTP_401_UNAUTHORIZED)
            
            hash_bytes = binascii.unhexlify(user.password[2:])

            if not bcrypt.checkpw(password.encode('utf-8'), hash_bytes):
                logger.warning(f"Failed login attempt for email: {email}")
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Update last login
            user.last_login = timezone.now()
            user.save()
            
            logger.info(f"Successful login for email: {email}")
            current_time = datetime.utcnow()
            access = AccessToken()
            access.set_exp(from_time=current_time, lifetime=timedelta(hours=1))
            access.payload['user_email'] = user.email
            access.payload['fname'] = user.fname
            access.payload['lname'] = user.lname
            username = user.fname + ' ' + user.lname
            return Response({
                'access': str(access),
                'username': username,
                'email': user.email
            })
        except User.DoesNotExist:
            logger.warning(f"Login attempt with non-existent email: {email}")
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            logger.error(f"Login error: {e}")
            return Response({'error': 'Internal server error'}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DashboardView(APIView):
    def get(self, request):
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            # Get dashboard statistics
            now = timezone.now()
            week_from_now = now + timedelta(days=7)
            week_ago = now - timedelta(days=7)
            
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
            
            total_tasks = user_tasks.count()
            completed_tasks = user_tasks.filter(status='completed').count()
            overdue_tasks = user_tasks.filter(
                due_date__lt=now,
                status__in=['todo', 'in_progress']
            ).count()
            
            completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
            
            unread_messages = Message.objects.filter(recipient=user, is_read=False).count()
            
            # Projects by status
            projects_by_status = dict(user_projects.values('status').annotate(count=Count('status')).values_list('status', 'count'))
            
            # Tasks by priority
            tasks_by_priority = dict(user_tasks.values('priority').annotate(count=Count('priority')).values_list('priority', 'count'))
            
            # Weekly task completion data
            weekly_completion = []
            for i in range(7):
                day = now - timedelta(days=6-i)
                day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
                day_end = day_start + timedelta(days=1)
                completed_count = user_tasks.filter(
                    completed_at__gte=day_start,
                    completed_at__lt=day_end
                ).count()
                weekly_completion.append({
                    'date': day.strftime('%Y-%m-%d'),
                    'day': day.strftime('%a'),
                    'completed': completed_count
                })
            
            # Recent activities
            recent_activities = ActivityLog.objects.filter(
                Q(project__in=user_projects) | Q(user=user)
            )[:10]
            
            # Upcoming deadlines
            upcoming_deadlines = user_tasks.filter(
                due_date__gte=now,
                status__in=['todo', 'in_progress']
            ).order_by('due_date')[:5]
            
            # Recent projects with enhanced data
            recent_projects = user_projects.order_by('-updated_at')[:5]
            
            return Response({
                'email': user.email,
                'username': user.fname + ' ' + user.lname,
                'stats': {
                    'active_projects': active_projects,
                    'tasks_due_this_week': tasks_due_this_week,
                    'unread_messages': unread_messages,
                    'total_tasks': total_tasks,
                    'completed_tasks': completed_tasks,
                    'overdue_tasks': overdue_tasks,
                    'completion_rate': round(completion_rate, 1),
                    'projects_by_status': projects_by_status,
                    'tasks_by_priority': tasks_by_priority,
                    'weekly_task_completion': weekly_completion
                },
                'recent_activities': ActivityLogSerializer(recent_activities, many=True).data,
                'upcoming_deadlines': TaskSerializer(upcoming_deadlines, many=True).data,
                'projects': ProjectSerializer(recent_projects, many=True).data
            })
        except Exception as e:
            logger.error(f"Dashboard error for user {user.email}: {e}")
            return Response({'error': 'Internal server error'}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

            # Validate email format
            from django.core.validators import validate_email
            from django.core.exceptions import ValidationError
            try:
                validate_email(user_email)
            except ValidationError:
                return Response({'error': 'Invalid email format'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if user already exists
            if User.objects.filter(email=user_email).exists():
                return Response({'error': 'User with this email already exists'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Validate password strength
            if len(password) < 8:
                return Response({'error': 'Password must be at least 8 characters long'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            # Insert new user with raw SQL
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO pcpusers (email, fname, lname, password) VALUES (%s, %s, %s, %s)",
                    [user_email, fname, lname, hashed_password]
                )
            
            logger.info(f"New user created: {user_email}")
            return Response({'message': 'User added successfully', 'id': user_email}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"User creation error: {e}")
            return Response({'error': f'Failed to add user: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProjectListCreateView(APIView):

    def get(self, request):
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            # Get query parameters for filtering and pagination
            status_filter = request.GET.get('status')
            priority_filter = request.GET.get('priority')
            search = request.GET.get('search')
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 10))
            
            # Get projects where user is owner or member
            projects = Project.objects.filter(
                Q(owner=user) | Q(members=user)
            ).distinct()
            
            # Apply filters
            if status_filter:
                projects = projects.filter(status=status_filter)
            if priority_filter:
                projects = projects.filter(priority=priority_filter)
            if search:
                projects = projects.filter(
                    Q(name__icontains=search) | Q(description__icontains=search)
                )
            
            projects = projects.order_by('-updated_at')
            
            # Pagination
            paginator = Paginator(projects, page_size)
            page_obj = paginator.get_page(page)
            
            serializer = ProjectSerializer(page_obj, many=True)
            
            return Response({
                'results': serializer.data,
                'count': paginator.count,
                'num_pages': paginator.num_pages,
                'current_page': page,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous()
            })
        except Exception as e:
            logger.error(f"Project list error for user {user.email}: {e}")
            return Response({'error': 'Internal server error'}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            serializer = ProjectCreateSerializer(data=request.data)
            if not serializer.is_valid():
                return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
            
            validated_data = serializer.validated_data
            member_emails = validated_data.pop('member_emails', [])
            
            project = Project.objects.create(
                name=validated_data.get('name'),
                description=validated_data.get('description', ''),
                owner=user,
                status=validated_data.get('status', 'planning'),
                priority=validated_data.get('priority', 'medium'),
                start_date=validated_data.get('start_date'),
                due_date=validated_data.get('due_date')
            )
            
            # Add members to project
            for email in member_emails:
                try:
                    member_user = User.objects.get(email=email)
                    ProjectMember.objects.create(
                        project=project,
                        user=member_user,
                        role='member'
                    )
                except User.DoesNotExist:
                    logger.warning(f"Attempted to add non-existent user {email} to project {project.id}")
            
            # Log activity
            ActivityLog.objects.create(
                user=user,
                project=project,
                action_type='project_created',
                description=f'Created project: {project.name}'
            )
            
            logger.info(f"Project created: {project.name} by {user.email}")
            serializer = ProjectSerializer(project)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Project creation error: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class TaskListCreateView(APIView):

    def get(self, request):
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            # Get query parameters
            status_filter = request.GET.get('status')
            priority_filter = request.GET.get('priority')
            project_id = request.GET.get('project_id')
            assignee_filter = request.GET.get('assignee')
            search = request.GET.get('search')
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 20))
            
            # Get tasks assigned to user or in projects they're part of
            user_projects = Project.objects.filter(
                Q(owner=user) | Q(members=user)
            ).distinct()
            
            tasks = Task.objects.filter(
                Q(assignee=user) | Q(project__in=user_projects)
            ).distinct()
            
            # Apply filters
            if status_filter:
                tasks = tasks.filter(status=status_filter)
            if priority_filter:
                tasks = tasks.filter(priority=priority_filter)
            if project_id:
                tasks = tasks.filter(project_id=project_id)
            if assignee_filter:
                tasks = tasks.filter(assignee__email=assignee_filter)
            if search:
                tasks = tasks.filter(
                    Q(title__icontains=search) | Q(description__icontains=search)
                )
            
            tasks = tasks.order_by('-created_at')
            
            # Pagination
            paginator = Paginator(tasks, page_size)
            page_obj = paginator.get_page(page)
            
            serializer = TaskSerializer(page_obj, many=True)
            
            return Response({
                'results': serializer.data,
                'count': paginator.count,
                'num_pages': paginator.num_pages,
                'current_page': page,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous()
            })
        except Exception as e:
            logger.error(f"Task list error for user {user.email}: {e}")
            return Response({'error': 'Internal server error'}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            serializer = TaskCreateSerializer(data=request.data)
            if not serializer.is_valid():
                return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
            
            validated_data = serializer.validated_data
            project = Project.objects.get(id=validated_data.get('project'))
            
            # Check if user has access to this project
            if not (project.owner == user or project.members.filter(email=user.email).exists()):
                return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
            
            # Get assignee if provided
            assignee = None
            assignee_email = validated_data.get('assignee_email')
            if assignee_email:
                try:
                    assignee = User.objects.get(email=assignee_email)
                    # Check if assignee has access to the project
                    if not (project.owner == assignee or project.members.filter(email=assignee.email).exists()):
                        return Response({'error': 'Assignee does not have access to this project'}, 
                                      status=status.HTTP_400_BAD_REQUEST)
                except User.DoesNotExist:
                    return Response({'error': 'Assignee not found'}, status=status.HTTP_400_BAD_REQUEST)
            
            task = Task.objects.create(
                title=validated_data.get('title'),
                description=validated_data.get('description', ''),
                project=project,
                creator=user,
                assignee=assignee,
                status=validated_data.get('status', 'todo'),
                priority=validated_data.get('priority', 'medium'),
                due_date=validated_data.get('due_date'),
                estimated_hours=validated_data.get('estimated_hours')
            )
            
            # Log activity
            ActivityLog.objects.create(
                user=user,
                project=project,
                action_type='task_created',
                description=f'Created task: {task.title}'
            )
            
            logger.info(f"Task created: {task.title} by {user.email}")
            serializer = TaskSerializer(task)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Task creation error: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class MessageListCreateView(APIView):

    def get(self, request):
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            # Get query parameters
            message_type = request.GET.get('type')
            is_read = request.GET.get('is_read')
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 20))
            
            messages = Message.objects.filter(recipient=user)
            
            # Apply filters
            if message_type:
                messages = messages.filter(message_type=message_type)
            if is_read is not None:
                messages = messages.filter(is_read=is_read.lower() == 'true')
            
            messages = messages.order_by('-created_at')
            
            # Pagination
            paginator = Paginator(messages, page_size)
            page_obj = paginator.get_page(page)
            
            serializer = MessageSerializer(page_obj, many=True)
            
            return Response({
                'results': serializer.data,
                'count': paginator.count,
                'unread_count': Message.objects.filter(recipient=user, is_read=False).count()
            })
        except Exception as e:
            logger.error(f"Message list error for user {user.email}: {e}")
            return Response({'error': 'Internal server error'}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            recipient_email = request.data.get('recipient_email')
            if not recipient_email:
                return Response({'error': 'Recipient email is required'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            try:
                recipient = User.objects.get(email=recipient_email)
            except User.DoesNotExist:
                return Response({'error': 'Recipient not found'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate required fields
            subject = request.data.get('subject')
            content = request.data.get('content')
            if not subject or not content:
                return Response({'error': 'Subject and content are required'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            message = Message.objects.create(
                sender=user,
                recipient=recipient,
                project_id=request.data.get('project_id'),
                message_type=request.data.get('message_type', 'direct'),
                subject=subject,
                content=content
            )
            
            logger.info(f"Message sent from {user.email} to {recipient.email}")
            serializer = MessageSerializer(message)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Message creation error: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ProjectDetailView(APIView):
    def get(self, request, project_id):
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            project = Project.objects.get(id=project_id)
            
            # Check access
            if not (project.owner == user or project.members.filter(email=user.email).exists()):
                return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
            
            serializer = ProjectSerializer(project)
            return Response(serializer.data)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Project detail error: {e}")
            return Response({'error': 'Internal server error'}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, project_id):
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            project = Project.objects.get(id=project_id)
            
            # Check if user is owner or admin
            user_membership = ProjectMember.objects.filter(project=project, user=user).first()
            if not (project.owner == user or (user_membership and user_membership.role == 'admin')):
                return Response({'error': 'Insufficient permissions'}, status=status.HTTP_403_FORBIDDEN)
            
            # Update project fields
            allowed_fields = ['name', 'description', 'status', 'priority', 'start_date', 'due_date', 'progress']
            for field in allowed_fields:
                if field in request.data:
                    setattr(project, field, request.data[field])
            
            project.save()
            
            # Log activity
            log_activity(user, project, 'project_updated', f'Updated project: {project.name}')
            
            serializer = ProjectSerializer(project)
            return Response(serializer.data)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Project update error: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class TaskDetailView(APIView):
    def get(self, request, task_id):
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            task = Task.objects.get(id=task_id)
            
            # Check access
            if not (task.project.owner == user or 
                   task.project.members.filter(email=user.email).exists() or
                   task.assignee == user):
                return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
            
            serializer = TaskSerializer(task)
            return Response(serializer.data)
        except Task.DoesNotExist:
            return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Task detail error: {e}")
            return Response({'error': 'Internal server error'}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, task_id):
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            task = Task.objects.get(id=task_id)
            
            # Check access
            if not (task.project.owner == user or 
                   task.project.members.filter(email=user.email).exists() or
                   task.assignee == user or task.creator == user):
                return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
            
            # Update task fields
            allowed_fields = ['title', 'description', 'status', 'priority', 'due_date', 'actual_hours']
            old_status = task.status
            
            for field in allowed_fields:
                if field in request.data:
                    setattr(task, field, request.data[field])
            
            # Handle assignee change
            if 'assignee_email' in request.data:
                assignee_email = request.data['assignee_email']
                if assignee_email:
                    try:
                        assignee = User.objects.get(email=assignee_email)
                        task.assignee = assignee
                    except User.DoesNotExist:
                        return Response({'error': 'Assignee not found'}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    task.assignee = None
            
            task.save()
            
            # Log activity for status changes
            if old_status != task.status:
                log_activity(user, task.project, 'task_updated', 
                           f'Changed task "{task.title}" status from {old_status} to {task.status}')
                
                if task.status == 'completed':
                    log_activity(user, task.project, 'task_completed', 
                               f'Completed task: {task.title}')
            
            serializer = TaskSerializer(task)
            return Response(serializer.data)
        except Task.DoesNotExist:
            return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Task update error: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, task_id):
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            task = Task.objects.get(id=task_id)
            
            # Check if user can delete (owner, admin, or creator)
            user_membership = ProjectMember.objects.filter(project=task.project, user=user).first()
            if not (task.project.owner == user or 
                   (user_membership and user_membership.role in ['admin']) or
                   task.creator == user):
                return Response({'error': 'Insufficient permissions'}, status=status.HTTP_403_FORBIDDEN)
            
            task_title = task.title
            project = task.project
            task.delete()
            
            # Log activity
            log_activity(user, project, 'task_deleted', f'Deleted task: {task_title}')
            
            return Response({'message': 'Task deleted successfully'})
        except Task.DoesNotExist:
            return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Task deletion error: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def bulk_mark_messages_read(request):
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        message_ids = request.data.get('message_ids', [])
        if not message_ids:
            return Response({'error': 'No message IDs provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        updated_count = Message.objects.filter(
            id__in=message_ids,
            recipient=user,
            is_read=False
        ).update(is_read=True)
        
        return Response({
            'message': f'{updated_count} messages marked as read',
            'updated_count': updated_count
        })
    except Exception as e:
        logger.error(f"Bulk mark messages read error: {e}")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def user_workload(request):
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        from .utils import get_user_workload
        days = int(request.GET.get('days', 7))
        workload_data = get_user_workload(user, days)
        
        return Response({
            'workload': workload_data,
            'total_upcoming_tasks': sum(day['task_count'] for day in workload_data),
            'total_estimated_hours': sum(day['estimated_hours'] for day in workload_data)
        })
    except Exception as e:
        logger.error(f"User workload error: {e}")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
def project_members(request, project_id):
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        project = Project.objects.get(id=project_id)
        
        # Check access
        if not (project.owner == user or project.members.filter(email=user.email).exists()):
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        if request.method == 'GET':
            members = ProjectMember.objects.filter(project=project)
            serializer = ProjectMemberSerializer(members, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            # Check if user can add members (owner or admin)
            user_membership = ProjectMember.objects.filter(project=project, user=user).first()
            if not (project.owner == user or (user_membership and user_membership.role == 'admin')):
                return Response({'error': 'Insufficient permissions'}, status=status.HTTP_403_FORBIDDEN)
            
            member_email = request.data.get('email')
            role = request.data.get('role', 'member')
            
            if not member_email:
                return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                member_user = User.objects.get(email=member_email)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if user is already a member
            if ProjectMember.objects.filter(project=project, user=member_user).exists():
                return Response({'error': 'User is already a member'}, status=status.HTTP_400_BAD_REQUEST)
            
            member = ProjectMember.objects.create(
                project=project,
                user=member_user,
                role=role
            )
            
            # Log activity
            log_activity(user, project, 'member_added', 
                       f'Added {member_user.full_name} as {role}')
            
            # Send notification to new member
            from .utils import send_notification
            send_notification(
                sender=user,
                recipient=member_user,
                subject=f'Added to project: {project.name}',
                content=f'You have been added to the project "{project.name}" as a {role}.',
                message_type='project',
                project=project
            )
            
            serializer = ProjectMemberSerializer(member)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Project members error: {e}")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def task_statistics(request):
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        # Get user's tasks
        user_tasks = Task.objects.filter(assignee=user)
        
        # Calculate statistics
        total_tasks = user_tasks.count()
        completed_tasks = user_tasks.filter(status='completed').count()
        in_progress_tasks = user_tasks.filter(status='in_progress').count()
        overdue_tasks = user_tasks.filter(
            due_date__lt=timezone.now(),
            status__in=['todo', 'in_progress']
        ).count()
        
        # Average completion time
        completed_with_hours = user_tasks.filter(
            status='completed',
            actual_hours__isnull=False
        )
        avg_completion_time = completed_with_hours.aggregate(
            avg_hours=Avg('actual_hours')
        )['avg_hours'] or 0
        
        # Tasks by priority
        priority_breakdown = dict(
            user_tasks.values('priority').annotate(count=Count('priority')).values_list('priority', 'count')
        )
        
        # Monthly completion trend (last 6 months)
        monthly_data = []
        for i in range(6):
            month_start = timezone.now().replace(day=1) - timedelta(days=30*i)
            month_end = month_start + timedelta(days=32)
            month_end = month_end.replace(day=1) - timedelta(days=1)
            
            completed_in_month = user_tasks.filter(
                completed_at__gte=month_start,
                completed_at__lte=month_end
            ).count()
            
            monthly_data.append({
                'month': month_start.strftime('%b %Y'),
                'completed': completed_in_month
            })
        
        return Response({
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'in_progress_tasks': in_progress_tasks,
            'overdue_tasks': overdue_tasks,
            'completion_rate': round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0,
            'avg_completion_time': round(avg_completion_time, 1),
            'priority_breakdown': priority_breakdown,
            'monthly_completion': list(reversed(monthly_data))
        })
    except Exception as e:
        logger.error(f"Task statistics error: {e}")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
def mark_message_read(request, message_id):
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        message = Message.objects.get(id=message_id, recipient=user)
        message.is_read = True
        message.save()
        
        return Response({'message': 'Message marked as read'})
    except Exception as e:
        logger.error(f"Mark message read error: {e}")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def user_profile(request):
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        serializer = UserSerializer(user)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"User profile error: {e}")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def project_analytics(request, project_id):
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
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
        task_priority_breakdown = project.tasks.values('priority').annotate(count=Count('priority'))
        
        # Team performance metrics
        team_performance = project.tasks.filter(assignee__isnull=False).values(
            'assignee__email', 'assignee__fname', 'assignee__lname'
        ).annotate(
            total_tasks=Count('id'),
            completed_tasks=Count('id', filter=Q(status='completed')),
            avg_completion_time=Avg('actual_hours')
        )
        
        # Timeline data (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        timeline_data = []
        for i in range(30):
            day = thirty_days_ago + timedelta(days=i)
            day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            
            created_tasks = project.tasks.filter(
                created_at__gte=day_start,
                created_at__lt=day_end
            ).count()
            
            completed_tasks_day = project.tasks.filter(
                completed_at__gte=day_start,
                completed_at__lt=day_end
            ).count()
            
            timeline_data.append({
                'date': day.strftime('%Y-%m-%d'),
                'created': created_tasks,
                'completed': completed_tasks_day
            })
        
        return Response({
            'project': ProjectSerializer(project).data,
            'analytics': {
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
                'overdue_tasks': overdue_tasks,
                'completion_rate': (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0,
                'task_status_breakdown': list(task_status_breakdown),
                'task_priority_breakdown': list(task_priority_breakdown),
                'team_performance': list(team_performance),
                'timeline_data': timeline_data
            }
        })
    except Exception as e:
        logger.error(f"Project analytics error: {e}")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)