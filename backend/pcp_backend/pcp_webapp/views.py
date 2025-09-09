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

            if not email or not password:
                return JsonResponse({'message': 'Email and password are required'}, status=400)

            if settings.USERS_COLLECTION.find_one({'email': email}):
                return JsonResponse({'message': 'Email already registered'}, status=400)

            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            settings.USERS_COLLECTION.insert_one({
                'email': email,
                'password': hashed_password,
            })

            return JsonResponse({'message': 'Registration successful'}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid request format'}, status=400)
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=500)
    return JsonResponse({'message': 'Invalid request method'}, status=405)

class LoginView(APIView):
    def options(self, request, *args, **kwargs):
        return Response(status=status.HTTP_200_OK)

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

        return Response({
            'success': True,
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'user': {'email': email}
        }, status=status.HTTP_200_OK)
