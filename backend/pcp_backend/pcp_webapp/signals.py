from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from .utils import (
    notify_project_created,
    notify_task_assigned,
    notify_feedback_received,
    notify_deadline_approaching,
    notify_due_date_changed,
    notify_edit_requested
)

# models to work with
try:
    from .models import Project
except ImportError:
    Project = None

try:
    from .models import Task
except ImportError:
    Task = None

@receiver(post_save, sender=Project)
def notify_on_project_creation(sender, instance, created, **kwargs):
    """Notify members when a project is created"""
    if created:
        notify_project_created(instance, instance.owner)

@receiver(post_save, sender=Task)
def notify_on_task_assignment(sender, instance, created, **kwargs):
    """Notify user when assigned to a task"""
    if created and instance.assignee:
        notify_task_assigned(instance, instance.assignee, instance.creator)

@receiver(pre_save, sender=Project)
def check_project_due_date_change(sender, instance, **kwargs):
    """Check if project due date is changed"""
    if instance.pk:  # Existing project
        try:
            old_project = Project.objects.get(pk=instance.pk)
            if old_project.due_date != instance.due_date:
                # Notify all project members
                for member in instance.members.all():
                    notify_due_date_changed(
                        instance, member, 'project', old_project.due_date, instance.owner
                    )
        except Project.DoesNotExist:
            pass

@receiver(pre_save, sender=Task)
def check_task_due_date_change(sender, instance, **kwargs):
    """Check if task due date is changed"""
    if instance.pk:  # Existing task
        try:
            old_task = Task.objects.get(pk=instance.pk)
            if old_task.due_date != instance.due_date and instance.assignee:
                notify_due_date_changed(
                    instance, instance.assignee, 'task', old_task.due_date, instance.creator
                )
        except Task.DoesNotExist:
            pass

def schedule_daily_deadline_checks():
    """Check for approaching deadlines daily"""
    
    # Check projects due in next 3 days
    projects_due_soon = Project.objects.filter(
        due_date__lte=timezone.now() + timedelta(days=3),
        due_date__gt=timezone.now()
    )
    
    for project in projects_due_soon:
        for member in project.members.all():
            notify_deadline_approaching(project, member, 'project')
    
    # Check tasks due in next 2 days
    tasks_due_soon = Task.objects.filter(
        due_date__lte=timezone.now() + timedelta(days=2),
        due_date__gt=timezone.now(),
        assignee__isnull=False
    )
    
    for task in tasks_due_soon:
        notify_deadline_approaching(task, task.assignee, 'task')

# Manual notification triggers called from views
def notify_feedback_from_view(project, recipient, supervisor, grades, feedback):
    """Call this from your feedback view"""
    return notify_feedback_received(project, recipient, supervisor, grades, feedback)

def notify_edit_request_from_view(project, recipient, requested_by, edit_details):
    """Call this from your edit request view"""
    return notify_edit_requested(project, recipient, requested_by, edit_details)