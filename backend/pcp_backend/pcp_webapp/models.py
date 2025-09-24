from django.db import models
from django.conf import settings #Shaun's code

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
    
    
# Project Chat (chat room per project) - Shaun's code
class ProjectChat(models.Model):
    pc_id = models.AutoField(primary_key=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)

    class Meta:
        managed = True

    def __str__(self):
        return f"Chat for {self.project.project_name}"


#Chat Message
class ChatMessage(models.Model):
    cm_id = models.AutoField(primary_key=True)
    user_room = models.ForeignKey(ProjectChat, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    sent_at = models.DateTimeField(auto_now_add=True) # timestamp
    content = models.TextField() # the message itself
    status = models.CharField(max_length=20, default="sent") # could be: sent, delivered, seen

    class Meta:
        managed = True

    def __str__(self):
        return f"{self.user.email}: {self.content[:30]}..."

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
        return f"{self.user_email} - {self.task_id}"
