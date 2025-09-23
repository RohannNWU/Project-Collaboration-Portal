from django.contrib import admin
from .models import User, Project, Task, Message, Document, ActivityLog, ProjectMember

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'fname', 'lname', 'is_active', 'created_at', 'last_login']
    list_filter = ['is_active', 'created_at']
    search_fields = ['email', 'fname', 'lname']
    readonly_fields = ['created_at', 'last_login']

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'status', 'priority', 'progress', 'due_date', 'created_at']
    list_filter = ['status', 'priority', 'created_at']
    search_fields = ['name', 'description', 'owner__email']
    readonly_fields = ['created_at', 'updated_at']
    filter_horizontal = ['members']

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'assignee', 'status', 'priority', 'due_date', 'created_at']
    list_filter = ['status', 'priority', 'project', 'created_at']
    search_fields = ['title', 'description', 'assignee__email']
    readonly_fields = ['created_at', 'updated_at', 'completed_at']

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['subject', 'sender', 'recipient', 'message_type', 'is_read', 'created_at']
    list_filter = ['message_type', 'is_read', 'created_at']
    search_fields = ['subject', 'content', 'sender__email', 'recipient__email']
    readonly_fields = ['created_at']

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'project', 'action_type', 'created_at']
    list_filter = ['action_type', 'created_at']
    search_fields = ['description', 'user__email']
    readonly_fields = ['created_at']

@admin.register(ProjectMember)
class ProjectMemberAdmin(admin.ModelAdmin):
    list_display = ['project', 'user', 'role', 'joined_at']
    list_filter = ['role', 'joined_at']
    search_fields = ['project__name', 'user__email']
