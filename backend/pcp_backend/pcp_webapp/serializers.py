from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import User, Project, Task, Document, ActivityLog, UserProject, Notification

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'full_name']  # Updated to match model

class UserProjectSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProject
        fields = ['user', 'role']

class ProjectSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    members_detail = UserProjectSerializer(source='userproject_set', many=True, read_only=True)
    task_count = serializers.SerializerMethodField()
    completed_tasks = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = ['project_id', 'project_name', 'project_description', 'owner', 'members_detail', 
                  'task_count', 'completed_tasks', 'due_date', 'created_on']

    def get_task_count(self, obj):
        return obj.task_set.count()

    def get_completed_tasks(self, obj):
        return obj.task_set.filter(task_status='Completed').count()

class TaskSerializer(serializers.ModelSerializer):
    assignee = UserSerializer(read_only=True)
    creator = UserSerializer(read_only=True)
    project_name = serializers.CharField(source='project_id.project_name', read_only=True)
    
    class Meta:
        model = Task
        fields = ['task_id', 'task_name', 'task_description', 'project_id', 'project_name', 
                  'assignee', 'creator', 'task_status', 'task_priority', 'task_due_date']


class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    project_name = serializers.CharField(source='project_id.project_name', read_only=True, allow_null=True)
    task_id = serializers.PrimaryKeyRelatedField(queryset=Task.objects.all(), source='task_id', allow_null=True)
    
    class Meta:
        model = Document
        fields = ['document_id', 'document_title', 'document_description', 'doc_type', 
                  'project_name', 'task_id', 'uploaded_by', 'last_modified', 'file']

class ActivityLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    project_name = serializers.CharField(source='project_id.project_name', read_only=True)
    
    class Meta:
        model = ActivityLog
        fields = ['id', 'user', 'project_id', 'project_name', 'action_type', 'description', 'created_at']

class DashboardStatsSerializer(serializers.Serializer):
    active_projects = serializers.IntegerField()
    tasks_due_this_week = serializers.IntegerField()
    unread_messages = serializers.IntegerField()
    total_tasks = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
    overdue_tasks = serializers.IntegerField()

class NotificationSummarySerializer(serializers.ModelSerializer):
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = ['notif_id', 'notification_type', 'title', 'message', 'time_ago', 
                  'time_sent', 'project_id', 'task_id', 'grades', 'due_date']
        read_only_fields = ['time_sent']
    
    def get_time_ago(self, obj):
        now = timezone.now()
        diff = now - obj.time_sent
        if diff < timedelta(minutes=1):
            return "just now"
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f"{hours} hour{'s' if hours != 1 else ''} ago"
        else:
            days = diff.days
            return f"{days} day{'s' if days != 1 else ''} ago"
        

class DocumentSerializer(serializers.ModelSerializer):
    task_id = serializers.PrimaryKeyRelatedField(queryset=Task.objects.all(), allow_null=True)
    last_modified_by = serializers.SlugRelatedField(slug_field='email', queryset=User.objects.all())
    file = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            'document_id',
            'task_id',
            'document_title',
            'document_description',
            'date_time_uploaded',
            'doc_type',
            'date_time_last_modified',
            'last_modified_by',
            'file',
        ]

    def get_file(self, obj):
        # Return the URL of the file if it exists, otherwise None
        return obj.file.url if obj.file else None