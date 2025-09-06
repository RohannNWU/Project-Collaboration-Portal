from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
import bcrypt
import json

def register_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            username = data.get('username', '')
            role = data.get('role', 'user')

            if not email or not password:
                return JsonResponse({'message': 'Email and password are required'}, status=400)

            if settings.USERS_COLLECTION.find_one({'email': email}):
                return JsonResponse({'message': 'Email already registered'}, status=400)

            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            settings.USERS_COLLECTION.insert_one({
                'email': email,
                'password': hashed_password,
                'username': username,
                'role': role
            })

            return JsonResponse({'message': 'Registration successful'}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid request format'}, status=400)
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=500)
    return JsonResponse({'message': 'Invalid request method'}, status=405)

class LoginView(APIView):
    def options(self, request, *args, **kwargs):
        response = Response(status=status.HTTP_200_OK)
        response['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        response['Access-Control-Allow-Origin'] = 'https://wonderful-coast-0409a4c03.2.azurestaticapps.net'
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'content-type, authorization'
        response['Access-Control-Allow-Credentials'] = 'true'
        return response

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'success': False, 'message': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        user = settings.USERS_COLLECTION.find_one({'email': email})

        if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password']):
            return Response({'success': False, 'message': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken()
        refresh['email'] = email
        refresh['user_id'] = str(user['_id'])

        response = Response({
            'success': True,
            'username': user.get('username', ''),
            'role': user.get('role', 'user'),
        }, status=status.HTTP_200_OK)

        response.set_cookie(
            'access_token',
            str(refresh.access_token),
            httponly=True,
            secure=False,  # False for local testing
            samesite='Lax',
            max_age=3600
        )
        response.set_cookie(
            'refresh_token',
            str(refresh),
            httponly=True,
            secure=False,  # False for local testing
            samesite='Lax',
            max_age=86400
        )
        return response

class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'message': 'This is a protected endpoint!'})

def landing_page(request):
    return render(request, 'landingpage.html')