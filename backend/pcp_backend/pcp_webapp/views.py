from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.tokens import AccessToken
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

        response = Response({
            'success': True,
        }, status=status.HTTP_200_OK)

        response.set_cookie(
            'access_token',
            str(refresh.access_token),
            httponly=True,
            secure=True,  # False for local testing
            samesite='Lax',
            max_age=3600
        )
        response.set_cookie(
            'refresh_token',
            str(refresh),
            httponly=True,
            secure=True,  # False for local testing
            samesite='Lax',
            max_age=86400
        )
        return response

class ProtectedView(APIView):
    def get(self, request):
        # Extract access_token from cookies
        access_token = request.COOKIES.get('access_token')
        if not access_token:
            return Response(
                {'detail': 'Authentication credentials were not provided.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            # Validate the token
            token = AccessToken(access_token)
            # Optionally, you can access token payload (e.g., user_id, email)
            user_id = token['user_id']
            # Add your logic here
            return Response({'message': 'This is a protected endpoint!'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'detail': 'Invalid token.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

def landing_page(request):
    return render(request, 'landingpage.html')