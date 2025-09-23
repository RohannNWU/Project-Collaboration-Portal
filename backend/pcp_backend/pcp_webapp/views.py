from django.conf import settings
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.contrib.auth.models import User as DjangoUser
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from .models import Document, Task, User
import bcrypt
import json
import os
from datetime import datetime

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

        # First check MongoDB for user authentication
        mongo_user = settings.USERS_COLLECTION.find_one({'email': email})

        if not mongo_user or not bcrypt.checkpw(password.encode('utf-8'), mongo_user['password']):
            return Response({'success': False, 'message': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)

        # Create or get Django user for JWT authentication
        django_user, created = DjangoUser.objects.get_or_create(
            username=email,
            defaults={
                'email': email,
                'first_name': '',
                'last_name': ''
            }
        )

        # Generate JWT token for Django user
        refresh = RefreshToken.for_user(django_user)

        return Response({
            'success': True,
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'user': {'email': email, 'user_id': str(mongo_user['_id']), 'django_user_id': django_user.id}
        }, status=status.HTTP_200_OK)

class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]  # Use DRF's authentication

    def get(self, request):
        user_id = request.user.id  # Access Django user ID from the authenticated user
        return Response({'message': f'This is a protected endpoint! User ID: {user_id}'}, status=status.HTTP_200_OK)

def landing_page(request):
    """
    Redirects to the frontend application.
    The actual landing page is handled by the React frontend.
    """
    from django.http import HttpResponseRedirect
    return HttpResponseRedirect('http://localhost:3000')  # Update with your frontend URL if different

# Document Management API Views

class DocumentListView(APIView):
    """API endpoint to list all documents for a user or create a new document"""
    
    def get(self, request):
        try:
            # Get user from authentication (assuming JWT or session auth)
            if not request.user.is_authenticated:
                return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
            
            documents = Document.objects.filter(uploaded_by=request.user)
            document_list = []
            
            for doc in documents:
                document_list.append({
                    'id': doc.id,  # Document ID (PK) - using 'id' for frontend compatibility
                    'doc_id': doc.id,  # DOC_ID (PK) - keeping for backward compatibility
                    'task_id': doc.task.id if doc.task else None,  # TASK_ID (FK)
                    'title': doc.title,  # Title
                    'name': doc.title,  # Name alias for frontend compatibility
                    'description': doc.description,  # Description
                    'datetime_uploaded': doc.datetime_uploaded.isoformat(),  # DateTime_Uploaded
                    'upload_date': doc.datetime_uploaded.isoformat(),  # Upload date alias
                    'doc_type': doc.doc_type,  # Doc_Type (MIME type)
                    'file_type': doc.doc_type,  # File type alias
                    'date_last_modified': doc.date_last_modified.isoformat(),  # Date_Last_Modified
                    'last_modified_by': doc.last_modified_by.username,  # Last_Modified_By(User)
                    'file_path': doc.file_path,
                    'file_size': doc.file_size,
                    'size': doc.file_size,  # Size alias for frontend compatibility
                    'uploaded_by': doc.uploaded_by.username
                })
            
            return Response({'documents': document_list}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        try:
            # Handle file upload
            uploaded_file = request.FILES.get('file')
            title = request.data.get('title', '')
            description = request.data.get('description', '')
            task_id = request.data.get('task_id', None)
            
            if not request.user.is_authenticated:
                return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
            
            if not uploaded_file:
                return Response({'error': 'File is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Use filename as title if not provided
            if not title:
                title = uploaded_file.name
            
            # Get task if task_id is provided
            task = None
            if task_id:
                try:
                    task = Task.objects.get(id=task_id)
                except Task.DoesNotExist:
                    return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Save file to storage
            file_name = uploaded_file.name
            file_path = default_storage.save(f'documents/{request.user.username}/{file_name}', ContentFile(uploaded_file.read()))
            
            # Create document record
            document = Document.objects.create(
                task=task,  # TASK_ID (FK)
                title=title,  # Title
                description=description,  # Description
                doc_type=uploaded_file.content_type,  # Doc_Type (MIME type)
                last_modified_by=request.user,  # Last_Modified_By(User)
                file_path=file_path,
                file_size=uploaded_file.size,
                uploaded_by=request.user
            )
            
            return Response({
                'message': 'Document uploaded successfully',
                'document': {
                    'id': document.id,  # Document ID (PK) - using 'id' for frontend compatibility
                    'doc_id': document.id,
                    'task_id': document.task.id if document.task else None,
                    'title': document.title,
                    'name': document.title,  # Name alias for frontend compatibility
                    'description': document.description,
                    'datetime_uploaded': document.datetime_uploaded.isoformat(),
                    'upload_date': document.datetime_uploaded.isoformat(),  # Upload date alias
                    'doc_type': document.doc_type,
                    'file_type': document.doc_type,  # File type alias
                    'date_last_modified': document.date_last_modified.isoformat(),
                    'last_modified_by': document.last_modified_by.username,
                    'file_size': document.file_size,
                    'size': document.file_size,  # Size alias for frontend compatibility
                    'uploaded_by': document.uploaded_by.username
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DashboardView(APIView):
    """API endpoint to get dashboard data"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Get basic dashboard data
            user = request.user
            
            # Count documents for this user
            document_count = Document.objects.filter(uploaded_by=user).count()
            
            # Get recent documents (last 5)
            recent_documents = Document.objects.filter(uploaded_by=user).order_by('-datetime_uploaded')[:5]
            recent_docs_data = []
            for doc in recent_documents:
                recent_docs_data.append({
                    'id': doc.id,
                    'title': doc.title,
                    'datetime_uploaded': doc.datetime_uploaded.isoformat(),
                    'file_size': doc.file_size,
                    'doc_type': doc.doc_type
                })
            
            return Response({
                'success': True,
                'data': {
                    'user': {
                        'username': user.username,
                        'email': user.email
                    },
                    'stats': {
                        'total_documents': document_count,
                        'total_tasks': 0,  # Placeholder for when tasks are implemented
                        'total_projects': 0  # Placeholder for when projects are implemented
                    },
                    'recent_documents': recent_docs_data
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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