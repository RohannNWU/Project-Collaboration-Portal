# Generated migration for extended models

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('pcp_webapp', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='created_at',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
        migrations.AddField(
            model_name='user',
            name='last_login',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('status', models.CharField(choices=[('planning', 'Planning'), ('in_progress', 'In Progress'), ('review', 'Under Review'), ('completed', 'Completed'), ('on_hold', 'On Hold')], default='planning', max_length=20)),
                ('priority', models.CharField(choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('urgent', 'Urgent')], default='medium', max_length=10)),
                ('progress', models.IntegerField(default=0)),
                ('start_date', models.DateField(blank=True, null=True)),
                ('due_date', models.DateField(blank=True, null=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='owned_projects', to='pcp_webapp.user')),
            ],
            options={
                'db_table': 'projects',
            },
        ),
        migrations.CreateModel(
            name='ProjectMember',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(choices=[('member', 'Member'), ('supervisor', 'Supervisor'), ('admin', 'Admin')], default='member', max_length=20)),
                ('joined_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='pcp_webapp.project')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='pcp_webapp.user')),
            ],
            options={
                'db_table': 'project_members',
            },
        ),
        migrations.AddField(
            model_name='project',
            name='members',
            field=models.ManyToManyField(related_name='projects', through='pcp_webapp.ProjectMember', to='pcp_webapp.user'),
        ),
        migrations.CreateModel(
            name='Task',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('status', models.CharField(choices=[('todo', 'To Do'), ('in_progress', 'In Progress'), ('review', 'Under Review'), ('completed', 'Completed')], default='todo', max_length=20)),
                ('priority', models.CharField(choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('urgent', 'Urgent')], default='medium', max_length=10)),
                ('due_date', models.DateTimeField(blank=True, null=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('assignee', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='assigned_tasks', to='pcp_webapp.user')),
                ('creator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='created_tasks', to='pcp_webapp.user')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tasks', to='pcp_webapp.project')),
            ],
            options={
                'db_table': 'tasks',
            },
        ),
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('message_type', models.CharField(choices=[('direct', 'Direct Message'), ('project', 'Project Message'), ('system', 'System Notification')], default='direct', max_length=20)),
                ('subject', models.CharField(max_length=200)),
                ('content', models.TextField()),
                ('is_read', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('project', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='pcp_webapp.project')),
                ('recipient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='received_messages', to='pcp_webapp.user')),
                ('sender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sent_messages', to='pcp_webapp.user')),
            ],
            options={
                'db_table': 'messages',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Document',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=200)),
                ('file_path', models.CharField(max_length=500)),
                ('file_size', models.BigIntegerField()),
                ('file_type', models.CharField(max_length=50)),
                ('uploaded_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='documents', to='pcp_webapp.project')),
                ('uploaded_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='uploaded_documents', to='pcp_webapp.user')),
            ],
            options={
                'db_table': 'documents',
            },
        ),
        migrations.CreateModel(
            name='ActivityLog',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('action_type', models.CharField(choices=[('project_created', 'Project Created'), ('project_updated', 'Project Updated'), ('task_created', 'Task Created'), ('task_updated', 'Task Updated'), ('task_completed', 'Task Completed'), ('document_uploaded', 'Document Uploaded'), ('member_added', 'Member Added'), ('member_removed', 'Member Removed')], max_length=30)),
                ('description', models.TextField()),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('project', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='activities', to='pcp_webapp.project')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='activities', to='pcp_webapp.user')),
            ],
            options={
                'db_table': 'activity_logs',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AlterUniqueTogether(
            name='projectmember',
            unique_together={('project', 'user')},
        ),
    ]