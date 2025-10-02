from django.utils import timezone
from django.db import models
from django.contrib.auth.models import User as DjangoUser
from django.conf import settings

class User(models.Model):
    email = models.CharField(max_length=100, unique=True, primary_key=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    password = models.CharField(max_length=255)
    security_question = models.CharField(max_length=255)
    security_answer = models.CharField(max_length=255)

    class Meta:
        managed = True

    def __str__(self):
        return self.email

class Project(models.Model):
    project_id = models.AutoField(primary_key=True)
    due_date = models.DateField()
    cm_id = models.IntegerField(null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)
    grade = models.IntegerField(null=True, blank=True)
    project_name = models.CharField(max_length=100)
    project_description = models.TextField(null=True, blank=True)
    created_on = models.DateField()

    class Meta:
        managed = True

    def __str__(self):
        return self.project_name

class UserProject(models.Model):
    user_project_id = models.BigAutoField(primary_key=True)
    email = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    project_id = models.ForeignKey(Project, on_delete=models.CASCADE)
    role = models.CharField(max_length=50)

    class Meta:
        managed = True

    def __str__(self):
        return f"{self.email} - {self.user_project_id}"
    
class Task(models.Model):
    task_id = models.AutoField(primary_key=True)
    task_name = models.CharField(max_length=100)
    task_description = models.TextField(null=True, blank=True)
    task_due_date = models.DateField()
    task_status = models.CharField(max_length=50)
    task_priority = models.CharField(max_length=50)
    project_id = models.ForeignKey(Project, on_delete=models.CASCADE)
    is_final_submission = models.BooleanField(default=False)

    class Meta:
        managed = True

    def __str__(self):
        return self.task_name

class User_Task(models.Model):
    user_task_id = models.AutoField(primary_key=True)
    task_id = models.ForeignKey(Task, on_delete=models.CASCADE)
    email = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        managed = True

    def __str__(self):
        return f"{self.user_email} - {self.task_id}"
    

# Removed conflicting Document model using the correct one below (lines 117-131)
      
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
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.subject} - {self.sender.email} to {self.recipient.email}"

class Document(models.Model):
    document_id = models.AutoField(primary_key=True)
    task_id = models.ForeignKey(Task, on_delete=models.CASCADE, null=True, blank=True)
    document_title = models.CharField(max_length=200)
    document_description = models.TextField(blank=True, null=True)
    date_time_uploaded = models.DateTimeField(default=timezone.now)
    doc_type = models.CharField(max_length=500)
    date_time_last_modified = models.DateTimeField(auto_now=True)
    last_modified_by = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to='documents/')  # Added this to store the actual file

    class Meta:
        managed = True

    def __str__(self):
        return self.document_title

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
    email = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
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

    notif_id = models.AutoField(primary_key=True)
    project_id = models.ForeignKey(Project, on_delete=models.DO_NOTHING)
    time_sent = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=100)
    message = models.TextField()
    
    # References
    #project = models.ForeignKey('Project', on_delete=models.CASCADE, null=True, blank=True, 
     #                          related_name='notifications')
    #task = models.ForeignKey('Task', on_delete=models.CASCADE, null=True, blank=True, 
     #                       related_name='notifications')
    
    # specific notification types
    grades = models.CharField(max_length=100, null=True, blank=True)  # For feedback notifications
    due_date = models.DateTimeField(null=True, blank=True)  # For deadline notifications
    requested_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, 
                                   related_name='requested_edits')

    class Meta:
        managed = True
 
    def __str__(self):
        return f"{self.title} - {self.time_sent} - {self.message}"
    
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

class ChatMessage(models.Model):
    chat_message_id = models.AutoField(primary_key=True)
    email = models.ForeignKey(User, on_delete=models.CASCADE)
    sent_at = models.DateTimeField(auto_now_add=True)
    content = models.TextField()
    Role = models.CharField(default='',max_length=50)
    
    class Meta:
        managed = True

    def __str__(self):
     return f"Message by {self.email} at {self.sent_at}"
    
class ProjectChat(models.Model):
    project_chat_id = models.AutoField(primary_key=True)
    project_id = models.ForeignKey(Project, on_delete=models.CASCADE)
    chat_message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE)
    
    class Meta:
        managed = True

    def __str__(self):
        return f"Chat in Project {self.project_id} - Message ID {self.chat_message_id}"

#Notification model
class Notification(models.Model):
    notif_id = models.AutoField(primary_key=True)
    time_sent = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=100)
    message = models.TextField()

    class Meta:
        managed = True
 
    def __str__(self):
        return f"{self.title} - {self.time_sent} - {self.message}"

#UserNotification model to link notifications to users as bridge table
class UserNotification(models.Model):
    user_notification_id = models.AutoField(primary_key=True)
    email = models.ForeignKey(User, on_delete=models.CASCADE)
    notif = models.ForeignKey(Notification, on_delete=models.CASCADE)

    class Meta:
        managed = True

    def __str__(self):
        return f"Notification {self.notif_id} for {self.email} - Read: {self.is_read}"

class ProjectLinks(models.Model):
    link_id = models.AutoField(primary_key=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='links')
    link_url = models.URLField(max_length=500)

    class Meta:
        managed = True

    def __str__(self):
        return f"Link for {self.project.project_name}: {self.link_url}"
    
class Meeting(models.Model):
    meeting_id = models.AutoField(primary_key=True)
    project_id = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='meetings')
    meeting_title = models.CharField(max_length=200)    
    date_time = models.DateTimeField()
    
    class Meta:
        managed = True
    
    def __str__(self):
        return f"Meeting {self.meeting_title} for Project {self.project_id.project_name} on {self.date_time}"