from rest_framework import serializers
from .models import User, Project, Task, Message, Document, ActivityLog, ProjectMember

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = ['email', 'fname', 'lname', 'full_name', 'created_at', 'last_login', 'is_active']

class ProjectMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ProjectMember
        fields = ['user', 'role', 'joined_at']

class ProjectSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    members_detail = ProjectMemberSerializer(source='projectmember_set', many=True, read_only=True)
    task_count = serializers.SerializerMethodField()
    completed_tasks = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'owner', 'members_detail', 'status', 'priority', 
                 'progress', 'start_date', 'due_date', 'created_at', 'updated_at', 
                 'task_count', 'completed_tasks']

    def get_task_count(self, obj):
        return obj.tasks.count()

    def get_completed_tasks(self, obj):
        return obj.tasks.filter(status='completed').count()

class TaskSerializer(serializers.ModelSerializer):
    assignee = UserSerializer(read_only=True)
    creator = UserSerializer(read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'project', 'project_name', 'assignee', 
                 'creator', 'status', 'priority', 'due_date', 'completed_at', 
                 'created_at', 'updated_at']

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'sender', 'recipient', 'project', 'project_name', 'message_type', 
                 'subject', 'content', 'is_read', 'created_at']

class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    
    class Meta:
        model = Document
        fields = ['id', 'name', 'file_path', 'file_size', 'file_type', 'project', 
                 'project_name', 'uploaded_by', 'uploaded_at']

class ActivityLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    
    class Meta:
        model = ActivityLog
        fields = ['id', 'user', 'project', 'project_name', 'action_type', 'description', 'created_at']

class DashboardStatsSerializer(serializers.Serializer):
    active_projects = serializers.IntegerField()
    tasks_due_this_week = serializers.IntegerField()
    unread_messages = serializers.IntegerField()
    total_tasks = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
    overdue_tasks = serializers.IntegerField()