from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.conf import settings

class User(models.Model):
    id = models.AutoField(primary_key=True)
    email = models.CharField(max_length=100) #unique=True, primary_key=True)
    fname = models.CharField(max_length=50)
    lname = models.CharField(max_length=50)
    owner = models.CharField(max_length=50)
    password = models.CharField(max_length=255)
    created_at = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        managed = True
        #db_table = 'pcpusers'

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return f"{self.fname} {self.lname}"

class Project(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('in_progress', 'In Progress'),
        ('review', 'Under Review'),
        ('completed', 'Completed'),
        ('on_hold', 'On Hold'),
    ]

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_projects')
    members = models.ManyToManyField(User, through='ProjectMember', related_name='projects')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    progress = models.IntegerField(default=0)  # 0-100
    start_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = True
        #db_table = 'projects'

    def __str__(self):
        return self.name

class ProjectMember(models.Model):
    ROLE_CHOICES = [
        ('member', 'Member'),
        ('supervisor', 'Supervisor'),
        ('admin', 'Admin'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(default=timezone.now)

    class Meta:
        managed = True
        #db_table = 'project_members'
        unique_together = ('project', 'user')

class Task(models.Model):
    STATUS_CHOICES = [
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('review', 'Under Review'),
        ('completed', 'Completed'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tasks')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    due_date = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = True
        #db_table = 'tasks'

    def __str__(self):
        return self.title

class User_Task(models.Model):
    user_task_id = models.AutoField(primary_key=True)
    task_id = models.ForeignKey(Task, on_delete=models.DO_NOTHING)
    email = models.ForeignKey(User, on_delete=models.DO_NOTHING)

    class Meta:
        managed = True

    def __str__(self):
        return f"{self.user_email} - {self.task_id}"

class Message(models.Model):
    MESSAGE_TYPES = [
        ('direct', 'Direct Message'),
        ('project', 'Project Message'),
        ('system', 'System Notification'),
    ]

    id = models.AutoField(primary_key=True)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    email = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True, related_name='messages')
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES, default='direct')
    subject = models.CharField(max_length=200)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        managed = True
        #db_table = 'messages'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.subject} - {self.sender.email} to {self.recipient.email}"

class Document(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200)
    file_path = models.CharField(max_length=500)
    file_size = models.BigIntegerField()
    file_type = models.CharField(max_length=50)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='documents')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_documents')
    uploaded_at = models.DateTimeField(default=timezone.now)

    class Meta:
        managed = True
        #db_table = 'documents'

    def __str__(self):
        return self.name

class ActivityLog(models.Model):
    ACTION_TYPES = [
        ('project_created', 'Project Created'),
        ('project_updated', 'Project Updated'),
        ('task_created', 'Task Created'),
        ('task_updated', 'Task Updated'),
        ('task_completed', 'Task Completed'),
        ('document_uploaded', 'Document Uploaded'),
        ('member_added', 'Member Added'),
        ('member_removed', 'Member Removed'),
    ]

    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True, related_name='activities')
    action_type = models.CharField(max_length=30, choices=ACTION_TYPES)
    description = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        managed = True
        #db_table = 'activity_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.action_type}"
class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('project_created', 'Project Created'),
        ('task_assigned', 'Task Assigned'),
        ('feedback_received', 'Feedback Received'),
        ('deadline_approaching', 'Deadline Approaching'),
        ('due_date_changed', 'Due Date Changed'),
        ('edit_requested', 'Edit Requested'),
    ]

    id = models.AutoField(primary_key=True)
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    time_sent = models.DateTimeField(default=timezone.now)
    
    # References
    project = models.ForeignKey('Project', on_delete=models.CASCADE, null=True, blank=True, 
                               related_name='notifications')
    task = models.ForeignKey('Task', on_delete=models.CASCADE, null=True, blank=True, 
                            related_name='notifications')
    
    # specific notification types
    grades = models.CharField(max_length=100, null=True, blank=True)  # For feedback notifications
    due_date = models.DateTimeField(null=True, blank=True)  # For deadline notifications
    requested_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, 
                                   related_name='requested_edits')

    class Meta:
        managed = True
        #db_table = 'notifications'
        ordering = ['-time_sent']

    def __str__(self):
        return f"{self.notification_type} - {self.recipient.email}"
    
#for automated notifications
class Feedback(models.Model):
    task = models.ForeignKey("Task", on_delete=models.CASCADE, related_name="feedbacks")
    supervisor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback on {self.task.title} by {self.supervisor}"


class EditRequest(models.Model):
    task = models.ForeignKey("Task", on_delete=models.CASCADE, related_name="edit_requests")
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Edit requested for {self.task.title} by {self.requested_by}"