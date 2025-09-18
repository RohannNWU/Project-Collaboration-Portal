from django.db import models

class User(models.Model):
    email = models.CharField(max_length=100, unique=True, db_column='email', primary_key=True)
    fname = models.CharField(max_length=50, db_column='fname')
    lname = models.CharField(max_length=50, db_column='lname')
    password = models.CharField(max_length=255, db_column='password')

    class Meta:
        managed = False
        db_table = 'pcpuser'  # Adjust if schema differs

    def __str__(self):
        return self.email

class Project(models.Model):
    project_id = models.AutoField(db_column='project_id', primary_key=True)
    due_date = models.DateField(db_column='due_date')
    cm_id = models.IntegerField(db_column='cm_id')
    feedback = models.TextField(null=True, db_column='feedback')
    grade = models.IntegerField(null=True, db_column='grade')
    project_name = models.CharField(max_length=100, db_column='project_name')
    project_description = models.TextField(null=True, db_column='project_description')
    created_on = models.DateField(db_column='created_on')

    class Meta:
        managed = False
        db_table = 'project'
    
class User_Project(models.Model):
    email = models.ForeignKey(User, models.DO_NOTHING, db_column='email')
    project_id = models.ForeignKey(Project, models.DO_NOTHING, db_column='project_id')
    role = models.CharField(max_length=50, db_column='role')

    class Meta:
        managed = False
        db_table = 'user_project'