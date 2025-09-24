from django.contrib import admin
from .models import User, Project, Task, Message, ActivityLog, UserProject

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'first_name', 'last_name', 'password']
    search_fields = ['email', 'first_name', 'last_name']

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['project_name', 'project_description', 'due_date', 'created_on']
    list_filter = ['created_on']
    search_fields = ['project_name', 'project_description']
    readonly_fields = ['created_on']

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['task_name', 'task_description', 'task_status', 'task_priority', 'task_due_date']
    list_filter = ['task_status', 'task_priority', 'task_due_date']
    search_fields = ['task_name', 'task_status']

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['subject', 'sender', 'email', 'message_type', 'is_read', 'created_at']
    list_filter = ['message_type', 'is_read', 'created_at']
    search_fields = ['subject', 'content', 'sender__email', 'email__email']
    readonly_fields = ['created_at']

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ['email', 'project', 'action_type', 'created_at']
    list_filter = ['action_type', 'created_at']
    search_fields = ['description', 'email__email']
    readonly_fields = ['created_at']

@admin.register(UserProject)
class UserProjectAdmin(admin.ModelAdmin):
    list_display = ['email', 'role']
    list_filter = ['role']
    search_fields = ['project__name', 'email__email']
