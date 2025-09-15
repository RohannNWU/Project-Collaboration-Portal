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
                    "INSERT INTO pcpusers (email, fname, lname, password) VALUES (%s, %s, %s, %s)",
                    [user_email, fname, lname, hashed_password]
                )
            return Response({'message': 'User added successfully', 'id': user_email}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f'Failed to add user: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class NewProjectView(APIView):
    def post(self, request):
        project_name = request.data.get('projectname')
        due_date = request.data.get('duedate')
        project_members = request.data.get('projectmembers')

        if not all([project_name, due_date, project_members]):
                return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO project (project_name, due_date, project_members) VALUES (%s, %s, %s)",
                [project_name, due_date, project_members]
            )
        return Response({'message': 'Project added successfully'}, status=status.HTTP_201_CREATED)
        