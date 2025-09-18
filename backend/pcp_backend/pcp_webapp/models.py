from django.db import models

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

class UserProject(models.Model):
    user_project_id = models.BigAutoField(primary_key=True)
    email = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    project_id = models.ForeignKey(Project, on_delete=models.DO_NOTHING)
    role = models.CharField(max_length=50)

    class Meta:
        managed = True

    def __str__(self):
        return f"{self.email} - {self.user_project_id}"