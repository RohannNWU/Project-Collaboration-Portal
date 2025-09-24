from django.utils import timezone
from django.db import transaction
from pcp_webapp.models import Notification, User_Task, Project, UserProject, Task
import logging

logger = logging.getLogger(__name__)

def create_notification(project, user, title, message, notification_type, task=None, grades=None, due_date=None, requested_by=None):
    """Helper function to create a notification."""
    try:
        with transaction.atomic():
            notification = Notification.objects.create(
                project_id=project,
                project=project,
                task=task,
                title=title,
                message=message,
                notification_type=notification_type,
                time_sent=timezone.now(),
                grades=grades,
                due_date=due_date,
                requested_by=requested_by
            )
            logger.info(f"Notification created: {notification_type} for user {user.email} on project {project.project_name}")
    except Exception as e:
        logger.error(f"Failed to create notification {notification_type} for user {user.email}: {str(e)}")

def notify_due_dates():
    """Check and send notifications for projects and tasks with approaching due dates."""
    threshold_date = timezone.now().date() + timezone.timedelta(days=2)  # Notify for due dates within 2 days
    # Project due dates
    projects = Project.objects.filter(due_date__lte=threshold_date, due_date__gte=timezone.now().date())
    for project in projects:
        members = UserProject.objects.filter(project_id=project)
        for member in members:
            user = member.email
            title = f"Project Deadline Approaching: {project.project_name}"
            message = f"The project '{project.project_name}' is due on {project.due_date}. Please ensure all tasks are completed."
            create_notification(
                project=project,
                user=user,
                title=title,
                message=message,
                notification_type='deadline_approaching',
                due_date=project.due_date
            )

    # Task due dates
    tasks = Task.objects.filter(task_due_date__lte=threshold_date, task_due_date__gte=timezone.now().date())
    for task in tasks:
        project = task.project_id
        members = User_Task.objects.filter(task_id=task)
        for member in members:
            user = member.email
            title = f"Task Deadline Approaching: {task.task_name}"
            message = f"The task '{task.task_name}' in project '{project.project_name}' is due on {task.task_due_date}."
            create_notification(
                project=project,
                user=user,
                title=title,
                message=message,
                notification_type='deadline_approaching',
                task=task,
                due_date=task.task_due_date
            )