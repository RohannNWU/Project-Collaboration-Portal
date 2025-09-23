from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password
from .models import User, Project, Task, Message, Document, ActivityLog, ProjectMember

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    project_count = serializers.SerializerMethodField()
    task_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['email', 'fname', 'lname', 'full_name', 'created_at', 'last_login', 
                 'is_active', 'project_count', 'task_count']
    
    def get_project_count(self, obj):
        return obj.projects.count() + obj.owned_projects.count()
    
    def get_task_count(self, obj):
        return obj.assigned_tasks.filter(status__in=['todo', 'in_progress']).count()

class ProjectMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_email = serializers.EmailField(write_only=True, required=False)
    
    class Meta:
        model = ProjectMember
        fields = ['user', 'user_email', 'role', 'joined_at']

class ProjectSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    owner_email = serializers.EmailField(write_only=True, required=False)
    members_detail = ProjectMemberSerializer(source='projectmember_set', many=True, read_only=True)
    task_count = serializers.SerializerMethodField()
    completed_tasks = serializers.SerializerMethodField()
    overdue_tasks = serializers.SerializerMethodField()
    recent_activity = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'owner', 'members_detail', 'status', 'priority', 
                 'progress', 'start_date', 'due_date', 'created_at', 'updated_at', 
                 'task_count', 'completed_tasks', 'overdue_tasks', 'recent_activity', 'completion_percentage']

    def get_task_count(self, obj):
        return obj.tasks.count()

    def get_completed_tasks(self, obj):
        return obj.tasks.filter(status='completed').count()
    
    def get_overdue_tasks(self, obj):
        from django.utils import timezone
        return obj.tasks.filter(
            due_date__lt=timezone.now(),
            status__in=['todo', 'in_progress']
        ).count()
    
    def get_recent_activity(self, obj):
        recent_activities = obj.activities.all()[:3]
        return ActivityLogSerializer(recent_activities, many=True).data
    
    def get_completion_percentage(self, obj):
        total = obj.tasks.count()
        if total == 0:
            return 0
        completed = obj.tasks.filter(status='completed').count()
        return round((completed / total) * 100, 1)

class TaskSerializer(serializers.ModelSerializer):
    assignee = UserSerializer(read_only=True)
    assignee_email = serializers.EmailField(write_only=True, required=False)
    creator = UserSerializer(read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    is_overdue = serializers.SerializerMethodField()
    days_until_due = serializers.SerializerMethodField()
    estimated_hours = serializers.IntegerField(required=False, allow_null=True)
    actual_hours = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'project', 'project_name', 'assignee', 
                 'assignee_email', 'creator', 'status', 'priority', 'due_date', 'completed_at', 
                 'created_at', 'updated_at', 'is_overdue', 'days_until_due', 
                 'estimated_hours', 'actual_hours']
    
    def get_is_overdue(self, obj):
        from django.utils import timezone
        if obj.due_date and obj.status not in ['completed']:
            return obj.due_date < timezone.now()
        return False
    
    def get_days_until_due(self, obj):
        from django.utils import timezone
        if obj.due_date:
            delta = obj.due_date.date() - timezone.now().date()
            return delta.days
        return None

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)
    recipient_email = serializers.EmailField(write_only=True, required=False)
    project_name = serializers.CharField(source='project.name', read_only=True)
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = ['id', 'sender', 'recipient', 'project', 'project_name', 'message_type', 
                 'subject', 'content', 'is_read', 'created_at', 'time_ago']
    
    def get_time_ago(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff < timedelta(minutes=1):
            return "Just now"
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f"{hours} hour{'s' if hours != 1 else ''} ago"
        elif diff < timedelta(days=7):
            days = diff.days
            return f"{days} day{'s' if days != 1 else ''} ago"
        else:
            return obj.created_at.strftime("%b %d, %Y")

class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    file_size_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = ['id', 'name', 'file_path', 'file_size', 'file_type', 'project', 
                 'project_name', 'uploaded_by', 'uploaded_at', 'file_size_formatted']
    
    def get_file_size_formatted(self, obj):
        size = obj.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"

class ActivityLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = ActivityLog
        fields = ['id', 'user', 'project', 'project_name', 'action_type', 'description', 
                 'created_at', 'time_ago']
    
    def get_time_ago(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff < timedelta(minutes=1):
            return "Just now"
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f"{minutes}m ago"
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f"{hours}h ago"
        else:
            return obj.created_at.strftime("%b %d")

class DashboardStatsSerializer(serializers.Serializer):
    active_projects = serializers.IntegerField()
    tasks_due_this_week = serializers.IntegerField()
    unread_messages = serializers.IntegerField()
    total_tasks = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
    overdue_tasks = serializers.IntegerField()
    completion_rate = serializers.FloatField()
    projects_by_status = serializers.DictField()
    tasks_by_priority = serializers.DictField()
    weekly_task_completion = serializers.ListField()

class TaskCreateSerializer(serializers.ModelSerializer):
    assignee_email = serializers.EmailField(required=False, allow_blank=True)
    
    class Meta:
        model = Task
        fields = ['title', 'description', 'project', 'assignee_email', 'status', 
                 'priority', 'due_date', 'estimated_hours']
    
    def validate_assignee_email(self, value):
        if value:
            try:
                User.objects.get(email=value)
            except User.DoesNotExist:
                raise serializers.ValidationError("User with this email does not exist.")
        return value

class ProjectCreateSerializer(serializers.ModelSerializer):
    member_emails = serializers.ListField(
        child=serializers.EmailField(),
        required=False,
        allow_empty=True
    )
    
    class Meta:
        model = Project
        fields = ['name', 'description', 'status', 'priority', 'start_date', 
                 'due_date', 'member_emails']
    
    def validate_member_emails(self, value):
        for email in value:
            try:
                User.objects.get(email=email)
            except User.DoesNotExist:
                raise serializers.ValidationError(f"User with email {email} does not exist.")
        return value