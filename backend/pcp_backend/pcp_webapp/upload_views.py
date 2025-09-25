import os
import json
import logging
import jwt
import mimetypes
from datetime import datetime
from django.http import JsonResponse, HttpResponse, Http404, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .models import User, Task, User_Task, Project, UserProject

logger = logging.getLogger(__name__)

def get_user_from_token(request):
    """Extract user from JWT token in request headers or query parameters"""
    try:
        # First check Authorization header
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        # If not in header, check URL parameters
        elif 'token' in request.GET:
            token = request.GET.get('token')
            
        if not token:
            return None
            
        # Decode the token
        payload = jwt.decode(token, options={"verify_signature": False})
        user_email = payload.get('user_email')
        
        if user_email:
            return User.objects.get(email=user_email)
        return None
    except Exception as e:
        logger.error(f"Token validation error: {str(e)}")
        return None

@csrf_exempt
@require_http_methods(["POST"])
def upload_document(request):
    """
    Dedicated file upload endpoint that bypasses database issues.
    Saves files to media storage and returns success response.
    """
    try:
        # Authenticate user
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        # Get uploaded file and metadata
        uploaded_file = request.FILES.get('file')
        title = request.POST.get('title', '')
        description = request.POST.get('description', '')
        
        if not uploaded_file:
            return JsonResponse({'error': 'File is required'}, status=400)
        
        # Use filename as title if not provided
        if not title:
            title = uploaded_file.name
        
        # Create user directory if it doesn't exist
        user_dir = f'documents/{user.email}'
        
        # Generate unique filename to avoid conflicts
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        file_extension = os.path.splitext(uploaded_file.name)[1]
        unique_filename = f"{timestamp}_{uploaded_file.name}"
        
        # Save file to storage
        file_path = default_storage.save(
            f'{user_dir}/{unique_filename}', 
            ContentFile(uploaded_file.read())
        )
        
        # Create metadata file alongside the uploaded file
        metadata = {
            'original_name': uploaded_file.name,
            'title': title,
            'description': description,
            'file_size': uploaded_file.size,
            'file_type': uploaded_file.content_type,
            'uploaded_by': user.email,
            'upload_date': datetime.now().isoformat(),
            'file_path': file_path
        }
        
        # Save metadata as JSON file
        metadata_filename = f"{timestamp}_{os.path.splitext(uploaded_file.name)[0]}_metadata.json"
        metadata_path = default_storage.save(
            f'{user_dir}/{metadata_filename}',
            ContentFile(json.dumps(metadata, indent=2))
        )
        
        logger.info(f"File uploaded successfully: {file_path} by {user.email}")
        
        # Return success response matching expected format
        return JsonResponse({
            'message': 'Document uploaded successfully',
            'document': {
                'id': timestamp,  # Use timestamp as unique ID
                'title': title,
                'name': title,
                'description': description,
                'file_size': uploaded_file.size,
                'file_type': uploaded_file.content_type,
                'upload_date': datetime.now().isoformat(),
                'uploaded_by': user.email,
                'file_path': file_path,
                'metadata_path': metadata_path
            }
        }, status=201)
        
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        return JsonResponse({
            'error': 'Upload failed',
            'details': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def list_uploaded_documents(request):
    """
    List all uploaded documents for the authenticated user.
    Reads from file system instead of database.
    """
    try:
        # Authenticate user
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        user_dir = f'documents/{user.email}'
        documents = []
        
        # Check if user directory exists
        if default_storage.exists(user_dir):
            # List all files in user directory
            try:
                dirs, files = default_storage.listdir(user_dir)
                
                # Process metadata files to get document info
                for file in files:
                    if file.endswith('_metadata.json'):
                        try:
                            metadata_path = f'{user_dir}/{file}'
                            with default_storage.open(metadata_path, 'r') as f:
                                metadata = json.load(f)
                                documents.append({
                                    'id': metadata.get('upload_date', '').replace(':', '').replace('-', ''),
                                    'title': metadata.get('title', ''),
                                    'name': metadata.get('title', ''),
                                    'description': metadata.get('description', ''),
                                    'file_size': metadata.get('file_size', 0),
                                    'file_type': metadata.get('file_type', ''),
                                    'upload_date': metadata.get('upload_date', ''),
                                    'uploaded_by': metadata.get('uploaded_by', ''),
                                    'file_path': metadata.get('file_path', '')
                                })
                        except Exception as e:
                            logger.warning(f"Error reading metadata file {file}: {str(e)}")
                            continue
                            
            except Exception as e:
                logger.warning(f"Error listing directory {user_dir}: {str(e)}")
        
        return JsonResponse({'documents': documents}, status=200)
        
    except Exception as e:
        logger.error(f"List documents error: {str(e)}")
        return JsonResponse({
            'error': 'Failed to list documents',
            'details': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def view_document(request, file_path):
    """
    Serve uploaded documents for viewing/downloading.
    """
    try:
        # Authenticate user
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        # Decode the file path (it comes URL encoded)
        import urllib.parse
        decoded_path = urllib.parse.unquote(file_path)
        
        # Security check: ensure the path is within user's directory
        user_dir = f'documents/{user.email}'
        if not decoded_path.startswith(user_dir):
            return JsonResponse({'error': 'Access denied'}, status=403)
        
        # Check if file exists
        if not default_storage.exists(decoded_path):
            return JsonResponse({'error': 'File not found'}, status=404)
        
        # Open and serve the file
        try:
            file_obj = default_storage.open(decoded_path, 'rb')
            
            # Get file content type
            import mimetypes
            content_type, _ = mimetypes.guess_type(decoded_path)
            if not content_type:
                content_type = 'application/octet-stream'
            
            # Create HTTP response with file content
            from django.http import HttpResponse
            response = HttpResponse(file_obj.read(), content_type=content_type)
            
            # Get filename for Content-Disposition header
            filename = decoded_path.split('/')[-1]
            
            # Set headers for inline viewing (not download)
            response['Content-Disposition'] = f'inline; filename="{filename}"'
            response['Content-Length'] = default_storage.size(decoded_path)
            
            file_obj.close()
            return response
            
        except Exception as e:
            logger.error(f"Error serving document: {str(e)}")
            return JsonResponse({'error': 'Failed to serve document'}, status=500)
        
    except Exception as e:
        logger.error(f"View document error: {str(e)}")
        return JsonResponse({
            'error': 'Failed to view document',
            'details': str(e)
        }, status=500)


# Task-Based Document Management APIs

@csrf_exempt
@require_http_methods(["GET"])
def get_user_tasks_with_documents(request):
    """Get all tasks assigned to the user with their associated documents and permissions"""
    try:
        # Extract user from JWT token
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Invalid authorization header'}, status=401)
        
        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_email = payload.get('email')
            user = User.objects.get(email=user_email)
        except (jwt.InvalidTokenError, User.DoesNotExist):
            return JsonResponse({'error': 'Invalid token or user not found'}, status=401)

        # Get all tasks assigned to the user
        user_tasks = User_Task.objects.filter(email=user).select_related('task_id', 'task_id__project_id')
        
        # Get all projects the user is part of to determine read-only access
        user_projects = UserProject.objects.filter(email=user).select_related('project_id')
        user_project_ids = [up.project_id.project_id for up in user_projects]
        
        tasks_data = []
        
        for user_task in user_tasks:
            task = user_task.task_id
            
            # Get documents for this task (from user's directory)
            user_doc_dir = os.path.join(settings.MEDIA_ROOT, 'documents', user.email)
            task_documents = []
            
            if os.path.exists(user_doc_dir):
                for filename in os.listdir(user_doc_dir):
                    if filename.endswith('.json'):
                        continue
                    
                    metadata_file = os.path.join(user_doc_dir, f"{filename}.json")
                    if os.path.exists(metadata_file):
                        try:
                            with open(metadata_file, 'r') as f:
                                metadata = json.load(f)
                                # Check if document is associated with this task
                                if metadata.get('task_id') == task.task_id:
                                    task_documents.append({
                                        'filename': filename,
                                        'title': metadata.get('title', filename),
                                        'description': metadata.get('description', ''),
                                        'size': metadata.get('size', 0),
                                        'type': metadata.get('type', ''),
                                        'upload_date': metadata.get('upload_date', ''),
                                        'uploader': metadata.get('uploader', ''),
                                        'file_path': f"{user.email}/{filename}",
                                        'can_edit': True,  # User can edit their own documents
                                        'can_delete': True
                                    })
                        except json.JSONDecodeError:
                            continue
            
            tasks_data.append({
                'task_id': task.task_id,
                'task_name': task.task_name,
                'task_description': task.task_description,
                'task_due_date': task.task_due_date.isoformat() if task.task_due_date else None,
                'task_status': task.task_status,
                'task_priority': task.task_priority,
                'project_id': task.project_id.project_id,
                'project_name': task.project_id.project_name,
                'documents': task_documents,
                'can_upload': True,  # User can upload to their assigned tasks
                'access_level': 'full'  # Full CRUD access to assigned tasks
            })
        
        # Get read-only access to other team members' tasks in shared projects
        other_tasks = Task.objects.filter(
            project_id__project_id__in=user_project_ids
        ).exclude(
            task_id__in=[ut.task_id.task_id for ut in user_tasks]
        ).select_related('project_id')
        
        for task in other_tasks:
            # Get task assignee documents (read-only)
            task_assignees = User_Task.objects.filter(task_id=task).select_related('email')
            task_documents = []
            
            for assignee in task_assignees:
                assignee_doc_dir = os.path.join(settings.MEDIA_ROOT, 'documents', assignee.email.email)
                
                if os.path.exists(assignee_doc_dir):
                    for filename in os.listdir(assignee_doc_dir):
                        if filename.endswith('.json'):
                            continue
                        
                        metadata_file = os.path.join(assignee_doc_dir, f"{filename}.json")
                        if os.path.exists(metadata_file):
                            try:
                                with open(metadata_file, 'r') as f:
                                    metadata = json.load(f)
                                    if metadata.get('task_id') == task.task_id:
                                        task_documents.append({
                                            'filename': filename,
                                            'title': metadata.get('title', filename),
                                            'description': metadata.get('description', ''),
                                            'size': metadata.get('size', 0),
                                            'type': metadata.get('type', ''),
                                            'upload_date': metadata.get('upload_date', ''),
                                            'uploader': metadata.get('uploader', ''),
                                            'file_path': f"{assignee.email.email}/{filename}",
                                            'can_edit': False,  # Read-only access
                                            'can_delete': False
                                        })
                            except json.JSONDecodeError:
                                continue
            
            if task_documents:  # Only include tasks that have documents
                tasks_data.append({
                    'task_id': task.task_id,
                    'task_name': task.task_name,
                    'task_description': task.task_description,
                    'task_due_date': task.task_due_date.isoformat() if task.task_due_date else None,
                    'task_status': task.task_status,
                    'task_priority': task.task_priority,
                    'project_id': task.project_id.project_id,
                    'project_name': task.project_id.project_name,
                    'documents': task_documents,
                    'can_upload': False,  # Cannot upload to other's tasks
                    'access_level': 'read_only'  # Read-only access
                })
        
        return JsonResponse({
            'tasks': tasks_data,
            'user_email': user.email,
            'total_tasks': len(tasks_data)
        })
        
    except Exception as e:
        logger.error(f"Error fetching user tasks with documents: {str(e)}")
        return JsonResponse({'error': 'Failed to fetch tasks and documents'}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def upload_task_document(request):
    """Upload a document and associate it with a specific task"""
    try:
        # Extract user from JWT token
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Invalid authorization header'}, status=401)
        
        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_email = payload.get('email')
            user = User.objects.get(email=user_email)
        except (jwt.InvalidTokenError, User.DoesNotExist):
            return JsonResponse({'error': 'Invalid token or user not found'}, status=401)

        # Get form data
        task_id = request.POST.get('task_id')
        title = request.POST.get('title', '')
        description = request.POST.get('description', '')
        
        if not task_id:
            return JsonResponse({'error': 'Task ID is required'}, status=400)
        
        # Verify user is assigned to this task
        try:
            task = Task.objects.get(task_id=task_id)
            user_task = User_Task.objects.get(task_id=task, email=user)
        except (Task.DoesNotExist, User_Task.DoesNotExist):
            return JsonResponse({'error': 'Task not found or user not assigned to this task'}, status=403)
        
        # Handle file upload
        if 'file' not in request.FILES:
            return JsonResponse({'error': 'No file provided'}, status=400)
        
        uploaded_file = request.FILES['file']
        
        # Create user directory
        user_dir = os.path.join(settings.MEDIA_ROOT, 'documents', user.email)
        os.makedirs(user_dir, exist_ok=True)
        
        # Save file
        file_path = os.path.join(user_dir, uploaded_file.name)
        with open(file_path, 'wb+') as destination:
            for chunk in uploaded_file.chunks():
                destination.write(chunk)
        
        # Create metadata with task association
        metadata = {
            'title': title or uploaded_file.name,
            'description': description,
            'size': uploaded_file.size,
            'type': uploaded_file.content_type or 'application/octet-stream',
            'upload_date': datetime.now().isoformat(),
            'uploader': user.email,
            'task_id': int(task_id),
            'task_name': task.task_name,
            'project_id': task.project_id.project_id,
            'project_name': task.project_id.project_name
        }
        
        # Save metadata
        metadata_path = os.path.join(user_dir, f"{uploaded_file.name}.json")
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        logger.info(f"Task document uploaded successfully: {uploaded_file.name} for task {task_id} by {user.email}")
        
        return JsonResponse({
            'message': 'Document uploaded successfully',
            'filename': uploaded_file.name,
            'task_id': task_id,
            'task_name': task.task_name,
            'metadata': metadata
        })
        
    except Exception as e:
        logger.error(f"Error in upload_task_document: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def update_metadata(request):
    """
    Update a document's metadata file.
    Expects a JSON payload with 'file_path' and 'metadata' parameters.
    """
    try:
        # Authenticate user
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        # Parse JSON data from request body
        try:
            data = json.loads(request.body)
            file_path = data.get('file_path')
            metadata = data.get('metadata')
            
            if not file_path or not metadata:
                return JsonResponse(
                    {'error': 'file_path and metadata are required'}, 
                    status=400
                )
                
        except json.JSONDecodeError:
            return JsonResponse(
                {'error': 'Invalid JSON payload'}, 
                status=400
            )
        
        # Security check: Ensure the file is within the user's directory
        user_dir = f'documents/{user.email}'
        if not file_path.startswith(user_dir):
            return JsonResponse(
                {'error': 'Unauthorized to update this file'}, 
                status=403
            )
        
        # Ensure we're only updating metadata files
        if not file_path.endswith('_metadata.json'):
            return JsonResponse(
                {'error': 'Can only update metadata files'}, 
                status=400
            )
        
        # Write the updated metadata back to the file
        try:
            with default_storage.open(file_path, 'w') as f:
                json.dump(metadata, f, indent=2)
                
            logger.info(f"Updated metadata file: {file_path}")
            return JsonResponse({
                'message': 'Metadata updated successfully',
                'file_path': file_path,
                'metadata': metadata
            })
            
        except Exception as e:
            logger.error(f"Error writing metadata file {file_path}: {str(e)}")
            return JsonResponse(
                {'error': f'Failed to update metadata: {str(e)}'}, 
                status=500
            )
            
    except Exception as e:
        logger.error(f"Error in update_metadata: {str(e)}")
        return JsonResponse(
            {'error': f'Error updating metadata: {str(e)}'}, 
            status=500
        )


@csrf_exempt
@require_http_methods(["POST"])
def delete_document(request):
    """
    Delete a document and its metadata file.
    Expects a JSON payload with 'file_path' parameter.
    """
    try:
        # Authenticate user
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        # Parse JSON data from request body
        try:
            data = json.loads(request.body)
            file_path = data.get('file_path')
            if not file_path:
                return JsonResponse({'error': 'file_path is required'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON payload'}, status=400)
        
        # Security check: Ensure the file is within the user's directory
        user_dir = f'documents/{user.email}'
        if not file_path.startswith(user_dir):
            return JsonResponse(
                {'error': 'Unauthorized to delete this file'}, 
                status=403
            )
        
        # Check if file exists
        if not default_storage.exists(file_path):
            return JsonResponse(
                {'error': 'File not found'}, 
                status=404
            )
        
        # Find and delete the metadata file
        file_name = os.path.basename(file_path)
        file_name_without_ext = os.path.splitext(file_name)[0]
        directory = os.path.dirname(file_path)
        
        # List all files in the directory to find the metadata file
        metadata_file = None
        try:
            _, files = default_storage.listdir(directory)
            for f in files:
                if f.startswith(file_name_without_ext) and f.endswith('_metadata.json'):
                    metadata_file = os.path.join(directory, f)
                    break
        except Exception as e:
            logger.warning(f"Error finding metadata file: {str(e)}")
        
        # Delete the main file
        default_storage.delete(file_path)
        logger.info(f"Deleted file: {file_path}")
        
        # Delete the metadata file if found
        if metadata_file and default_storage.exists(metadata_file):
            default_storage.delete(metadata_file)
            logger.info(f"Deleted metadata file: {metadata_file}")
        
        return JsonResponse({
            'message': 'Document deleted successfully',
            'deleted_file': file_path,
            'deleted_metadata': metadata_file if metadata_file else 'No metadata found'
        })
        
    except Exception as e:
        logger.error(f"Error deleting document: {str(e)}")
        return JsonResponse(
            {'error': f'Error deleting document: {str(e)}'}, 
            status=500
        )
