"""
Add estimated_hours and actual_hours fields to Task model
"""

from django.db import migrations, models
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('pcp_webapp', '0002_create_extended_models'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='estimated_hours',
            field=models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(1)]),
        ),
        migrations.AddField(
            model_name='task',
            name='actual_hours',
            field=models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(1)]),
        ),
        migrations.AlterField(
            model_name='project',
            name='progress',
            field=models.IntegerField(default=0, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)]),
        ),
    ]