from django.db.models.signals import post_save
from django.dispatch import receiver
from pcp_webapp.models import Project, Task, UserProject, User_Task, Feedback, EditRequest, User
from pcp_webapp.utils import create_notification
import logging

logger = logging.getLogger(__name__)

# 1. Project created notification
@receiver(post_save, sender=Project)
def notify_project_created(sender, instance, created, **kwargs):
    if created:
        project_members = UserProject.objects.filter(project_id=instance)
        for member in project_members:
            user = member.email
            title = f"New Project Created: {instance.project_name}"
            message = f"You have been added to the new project '{instance.project_name}' created on {instance.created_on}."
            create_notification(
                project=instance,
                user=user,
                title=title,
                message=message,
                notification_type='project_created'
            )

# 2. Task assigned notification
@receiver(post_save, sender=User_Task)
def notify_task_assigned(sender, instance, created, **kwargs):
    if created:
        task = instance.task_id
        user = instance.email
        project = task.project_id
        title = f"New Task Assigned: {task.task_name}"
        message = f"You have been assigned a new task '{task.task_name}' in project '{project.project_name}' due on {task.task_due_date}."
        create_notification(
            project=project,
            user=user,
            title=title,
            message=message,
            notification_type='task_assigned',
            task=task
        )

# 3. Supervisor feedback notification
@receiver(post_save, sender=Feedback)
def notify_feedback_received(sender, instance, created, **kwargs):
    if created:
        task = instance.task
        project = task.project_id
        supervisor = instance.supervisor
        task_members = User_Task.objects.filter(task_id=task)
        for member in task_members:
            user = member.email
            if user != supervisor:
                grades = project.grade if project.grade else None  # Using project.grade as Task has no grade
                title = f"Feedback Received for {task.task_name}"
                message = f"Supervisor {supervisor.first_name} {supervisor.last_name} provided feedback on task '{task.task_name}' in project '{project.project_name}': {instance.comment}"
                create_notification(
                    project=project,
                    user=user,
                    title=title,
                    message=message,
                    notification_type='feedback_received',
                    task=task,
                    grades=str(grades) if grades else None
                )

# 5. Due date changed notification
@receiver(post_save, sender=Project)
@receiver(post_save, sender=Task)
def notify_due_date_changed(sender, instance, created, update_fields, **kwargs):
    if not created and update_fields and ('due_date' in update_fields or 'task_due_date' in update_fields):
        project = instance if sender == Project else instance.project_id
        is_project = sender == Project
        members = UserProject.objects.filter(project_id=project) if is_project else User_Task.objects.filter(task_id=instance)
        
        for member in members:
            user = member.email
            title = f"{'Project' if is_project else 'Task'} Due Date Changed: {instance.project_name if is_project else instance.task_name}"
            message = f"The due date for {'project' if is_project else 'task'} '{instance.project_name if is_project else instance.task_name}' has been changed to {instance.due_date if is_project else instance.task_due_date}."
            create_notification(
                project=project,
                user=user,
                title=title,
                message=message,
                notification_type='due_date_changed',
                task=instance if not is_project else None,
                due_date=instance.due_date if is_project else instance.task_due_date
            )

# 6. Edit request notification
@receiver(post_save, sender=EditRequest)
def notify_edit_requested(sender, instance, created, **kwargs):
    if created:
        task = instance.task
        project = task.project_id
        requested_by = instance.requested_by
        task_members = User_Task.objects.filter(task_id=task)
        for member in task_members:
            user = member.email
            if user != requested_by:
                title = f"Edit Requested for {task.task_name}"
                message = f"{requested_by.first_name} {requested_by.last_name} has requested an edit for task '{task.task_name}' in project '{project.project_name}': {instance.reason}"
                create_notification(
                    project=project,
                    user=user,
                    title=title,
                    message=message,
                    notification_type='edit_requested',
                    task=task,
                    requested_by=requested_by
                )