from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import User, Project, Task, Message, Document, ActivityLog, UserProject, Notification, ProjectChat, ChatMessage

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

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)
    project_name = serializers.CharField(source='project_id.project_name', read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'sender', 'recipient', 'project_id', 'project_name', 'message_type', 
                  'subject', 'content', 'is_read', 'created_at']

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
            return f"{days} day{'s' if days != 1 else ''} ago"from rest_framework import serializers
from .models import User, Project, UserProject, ProjectChat, ChatMessage

#User Serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name']


# Project Serializer
class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['project_id', 'project_name', 'project_description', 'due_date']



# Project Chat Serializer
class ProjectChatSerializer(serializers.ModelSerializer):
    project = ProjectSerializer(read_only=True)

    class Meta:
        model = ProjectChat
        fields = ['pc_id', 'project']



# Chat Message Serializer
class ChatMessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)  
    chat_room = serializers.PrimaryKeyRelatedField(queryset=ProjectChat.objects.all())

    class Meta:
        model = ChatMessage
        fields = ['cm_id', 'chat_room', 'user', 'content', 'sent_at', 'status']