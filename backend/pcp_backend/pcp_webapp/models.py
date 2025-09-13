from django.db import models

class User(models.Model):
    email = models.CharField(max_length=100, unique=True, db_column='email', primary_key=True)
    fname = models.CharField(max_length=50, db_column='fname')
    lname = models.CharField(max_length=50, db_column='lname')
    password = models.CharField(max_length=65, db_column='password')

    class Meta:
        managed = False  # Table is pre-existing
        db_table = 'pcpusers'

    def __str__(self):
        return self.email