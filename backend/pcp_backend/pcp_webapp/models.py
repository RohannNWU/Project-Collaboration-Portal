from django.db import models
from django.contrib.auth.models import User as DjangoUser

class User(models.Model):
    email = models.CharField(max_length=100, unique=True, primary_key=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    password = models.CharField(max_length=255)

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
    project_id = models.ForeignKey(Project, on_delete=models.DO_NOTHING)
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
    project_id = models.ForeignKey(Project, on_delete=models.DO_NOTHING)

    class Meta:
        managed = True

    def __str__(self):
        return self.task_name

class User_Task(models.Model):
    user_task_id = models.AutoField(primary_key=True)
    task_id = models.ForeignKey(Task, on_delete=models.DO_NOTHING)
    email = models.ForeignKey(User, on_delete=models.DO_NOTHING)

    class Meta:
        managed = True

    def __str__(self):
        return f"{self.email} - {self.task_id}"

class Document(models.Model):
    """Document model for file uploads and management"""
    id = models.AutoField(primary_key=True)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    datetime_uploaded = models.DateTimeField(auto_now_add=True)
    doc_type = models.CharField(max_length=100)  # MIME type
    date_last_modified = models.DateTimeField(auto_now=True)
    last_modified_by = models.ForeignKey(DjangoUser, on_delete=models.CASCADE, related_name='modified_documents')
    file_path = models.CharField(max_length=500)
    file_size = models.BigIntegerField()
    uploaded_by = models.ForeignKey(DjangoUser, on_delete=models.CASCADE, related_name='uploaded_documents')

    class Meta:
        managed = True
        ordering = ['-datetime_uploaded']

    def __str__(self):
        return self.title