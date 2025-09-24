from django.core.management.base import BaseCommand
from django.utils import timezone
from pcp_webapp.models import Project, Task, UserProject, User_Task, Notification
from pcp_webapp.utils import create_notification
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Sends notifications for projects and tasks with approaching due dates'

    def handle(self, *args, **kwargs):
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
                self.stdout.write(self.style.SUCCESS(f"Sent project due date notification to {user.email}"))

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
                self.stdout.write(self.style.SUCCESS(f"Sent task due date notification to {user.email}"))