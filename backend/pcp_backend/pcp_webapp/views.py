from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import User
from rest_framework_simplejwt.tokens import UntypedToken, AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken
from datetime import datetime, timedelta
from django.db import connection
import bcrypt
import binascii
import pytz


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
            username = user.fname + ' ' + user.lname
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
            return Response({'email': user.email, 'username': user.fname + ' ' + user.lname})
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
                    "INSERT INTO pcpuser (email, fname, lname, password) VALUES (%s, %s, %s, %s)",
                    [user_email, fname, lname, hashed_password]
                )
            return Response({'message': 'User added successfully', 'id': user_email}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f'Failed to add user: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
#Calander VIEW
class CalendarView(APIView):
    def get(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        token = auth_header.split(' ')[1]
        try:
            payload = UntypedToken(token).payload
            user_email = payload.get('user_email')
            if not user_email:
                return Response({'error': 'Invalid token payload'}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Get current time in SAST and format it
            sast_tz = pytz.timezone('Africa/Johannesburg')
            current_time = datetime.now(sast_tz).strftime('%Y/%m/%d - %H:%M')
            
            # Fetch project_id for the logged-in user from user_project table
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT project_id 
                    FROM user_project 
                    WHERE email = %s
                """, [user_email])
                project_rows = cursor.fetchall()
                project_ids = [row[0] for row in project_rows] if project_rows else []
                
                if not project_ids:
                    print(f"No projects found for user: {user_email}")
                    return Response({'events': [], 'current_time': current_time}, status=status.HTTP_200_OK)
                
                # Fetch due dates for projects the user is part of
                placeholders = ','.join(['%s'] * len(project_ids))
                cursor.execute(f"""
                    SELECT project_id, project_name, due_date 
                    FROM project 
                    WHERE project_id IN ({placeholders})
                """, project_ids)
                projects = cursor.fetchall()
                
                # Fetch due dates for tasks assigned to the user within their projects (using user_task bridge table)
                cursor.execute(f"""
                    SELECT t.task_id, t.task_name, t.task_due_date, p.project_name 
                    FROM task t 
                    JOIN project p ON t.project_id = p.project_id 
                    JOIN user_task ut ON t.task_id = ut.task_id
                    WHERE t.project_id IN ({placeholders}) AND ut.email = %s
                """, project_ids + [user_email])
                tasks = cursor.fetchall()
            
            # Format events: project due dates and task due dates for the user's projects
            events = []
            # Add project due dates
            for proj in projects:
                project_name, due_date = proj
                if due_date:
                    events.append({
                        'title': f'Project Due: {project_name}',
                        'start': due_date.isoformat(),
                    })
            
            # Add task due dates for tasks assigned to the user
            for task in tasks:
                task_name, due_date, project_name = task
                if due_date:
                    events.append({
                        'title': f'Task Due: {task_name} (Project: {project_name})',
                        'start': due_date.isoformat(),
                    })
            
            # Print data for debugging
            print("Fetched Calendar Data for User:", user_email)
            print("Current Time:", current_time)
            print("Events:", events)
            
            return Response({'events': events, 'current_time': current_time}, status=status.HTTP_200_OK)
        
        except InvalidToken:
            print("Invalid token received")
            return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            print(f"Error fetching calendar data: {str(e)}")
            return Response({'error': f'Failed to fetch calendar data: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)