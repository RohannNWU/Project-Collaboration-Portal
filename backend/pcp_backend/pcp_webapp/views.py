from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import UntypedToken, AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken
from datetime import datetime, timedelta
from .models import User, Project, UserProject, Task, User_Task
import bcrypt

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

class GetMembersView(APIView):
    def post(self, request):
            try:
                # Extract projectName from the request body
                project_name = request.data.get('projectName')
                if not project_name:
                    return Response(
                        {'error': 'projectName is required'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Fetch the project
                try:
                    project = Project.objects.get(project_name=project_name)
                except Project.DoesNotExist:
                    return Response(
                        {'error': f'Project with name {project_name} does not exist'},
                        status=status.HTTP_404_NOT_FOUND
                    )

                members = UserProject.objects.filter(project_id=project).values('email')
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
            return Response({'error': f'Database error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)