from django.db import models

class User(models.Model):
    email = models.CharField(max_length=100, unique=True, db_column='email', primary_key=True)
    fname = models.CharField(max_length=50, db_column='fname')
    lname = models.CharField(max_length=50, db_column='lname')
    password = models.CharField(max_length=255, db_column='password')

    class Meta:
        managed = False
        db_table = 'pcpusers'  # Adjust if schema differs

    def __str__(self):
        return self.email

class Project(models.Model):
    notif_id = models.AutoField(primary_key=True, db_column='notif_id')
    task_id = models.IntegerField(db_column='task_id')
    due_date = models.DateField(db_column='due_date')
    cm_id = models.IntegerField(db_column='cm_id')
    feedback = models.CharField(max_length=255, db_column='feedback')
    grade = models.IntegerField(db_column='grade')
    project_name = models.CharField(max_length=100, db_column='project_name')

