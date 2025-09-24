# utils.py
from django.utils import timezone
from datetime import timedelta
from .models import Notification, Task, Project, User

def notify_task_assignee(task: Task):
    """Send notification when a task is assigned to a user."""
    if task.assignee:
        Notification.objects.create(
            recipient=task.assignee,
            notification_type='task_assigned',
            title=f"Task assigned: {task.title}",
            message=f"You have been assigned the task '{task.title}' in project '{task.project.name}'.",
            task=task,
            project=task.project
        )

def notify_feedback_given(feedback):
    """Send notification when feedback is given on a task or project."""
    if hasattr(feedback, 'recipient') and feedback.recipient:
        Notification.objects.create(
            recipient=feedback.recipient,
            notification_type='feedback_received',
            title=f"Feedback received: {feedback.title if hasattr(feedback, 'title') else 'Feedback'}",
            message=f"You have received feedback: {feedback.content if hasattr(feedback, 'content') else ''}",
            project=getattr(feedback, 'project', None),
            task=getattr(feedback, 'task', None),
            grades=getattr(feedback, 'grades', None)
        )

def notify_edit_requested(edit_request):
    """Send notification when a supervisor or project member requests an edit."""
    if hasattr(edit_request, 'recipient') and edit_request.recipient:
        Notification.objects.create(
            recipient=edit_request.recipient,
            notification_type='edit_requested',
            title=f"Edit requested: {edit_request.title if hasattr(edit_request, 'title') else 'Edit'}",
            message=f"{edit_request.requested_by.full_name} has requested edits.",
            project=getattr(edit_request, 'project', None),
            task=getattr(edit_request, 'task', None),
            requested_by=getattr(edit_request, 'requested_by', None)
        )

def notify_due_date_upcoming_task(task: Task):
    """Send notification if a task due date is approaching (1 day before)."""
    if task.assignee and task.due_date:
        now = timezone.now()
        if 0 <= (task.due_date - now).days <= 1:
            Notification.objects.create(
                recipient=task.assignee,
                notification_type='deadline_approaching',
                title=f"Task due soon: {task.title}",
                message=f"The task '{task.title}' in project '{task.project.name}' is due on {task.due_date.strftime('%Y-%m-%d %H:%M')}.",
                task=task,
                project=task.project,
                due_date=task.due_date
            )

def notify_due_date_upcoming_project(project: Project):
    """Send notification if a project due date is approaching (1 day before) to all members."""
    now = timezone.now()
    if project.due_date and 0 <= (project.due_date - now).days <= 1:
        recipients = list(project.members.all()) + [project.owner]
        for user in recipients:
            Notification.objects.create(
                recipient=user,
                notification_type='deadline_approaching',
                title=f"Project due soon: {project.name}",
                message=f"The project '{project.name}' is due on {project.due_date.strftime('%Y-%m-%d')}.",
                project=project,
                due_date=project.due_date
            )