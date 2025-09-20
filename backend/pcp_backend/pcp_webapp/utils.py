from django.db import transaction
from .models import Notification, User
from django.utils import timezone
from datetime import timedelta

#Notifications code
def create_automated_notification(recipient, notification_type, title, message, **kwargs):
    """
    Create an automated notification with additional context
    """
    notification_data = {
        'recipient': recipient,
        'notification_type': notification_type,
        'title': title,
        'message': message,
        'time_sent': timezone.now()
    }
    
    optional_fields = ['project', 'task', 'grades', 'due_date', 'requested_by']
    for field in optional_fields:
        if field in kwargs:
            notification_data[field] = kwargs[field]
    
    return Notification.objects.create(**notification_data)

def notify_project_created(project, creator):
    """Notify all members when a project is created"""
    members = project.members.all()
    notifications = []
    
    for member in members:
        if member != creator:  # Don't notify the creator
            notification = create_automated_notification(
                recipient=member,
                notification_type='project_created',
                title=f"New Project: {project.name}",
                message=f"A new project '{project.name}' has been created by {creator.fname} {creator.lname}",
                project=project
            )
            notifications.append(notification)
    
    return notifications

def notify_task_assigned(task, assignee, assigned_by):
    """Notify user when a task is assigned to them"""
    return create_automated_notification(
        recipient=assignee,
        notification_type='task_assigned',
        title=f"New Task Assigned: {task.title}",
        message=f"You have been assigned to task '{task.title}' in project '{task.project.name}' by {assigned_by.fname} {assigned_by.lname}",
        project=task.project,
        task=task
    )

def notify_feedback_received(project, recipient, supervisor, grades, feedback):
    """Notify user when feedback is received from supervisor"""
    return create_automated_notification(
        recipient=recipient,
        notification_type='feedback_received',
        title=f"Feedback Received for {project.name}",
        message=f"Supervisor {supervisor.fname} {supervisor.lname} has provided feedback: {feedback}",
        project=project,
        grades=grades
    )

def notify_deadline_approaching(entity, recipient, entity_type):
    """Notify user when deadline is approaching"""
    if entity_type == 'project':
        title = f"Project Deadline Approaching: {entity.name}"
        message = f"The deadline for project '{entity.name}' is approaching on {entity.due_date.strftime('%Y-%m-%d')}"
    else:  # task
        title = f"Task Deadline Approaching: {entity.title}"
        message = f"The deadline for task '{entity.title}' is approaching on {entity.due_date.strftime('%Y-%m-%d')}"
    
    return create_automated_notification(
        recipient=recipient,
        notification_type='deadline_approaching',
        title=title,
        message=message,
        project=entity.project if entity_type == 'task' else entity,
        task=entity if entity_type == 'task' else None,
        due_date=entity.due_date
    )

def notify_due_date_changed(entity, recipient, entity_type, old_due_date, changed_by):
    """Notify user when due date is changed"""
    if entity_type == 'project':
        title = f"Project Due Date Changed: {entity.name}"
        message = f"The due date for project '{entity.name}' has been changed from {old_due_date.strftime('%Y-%m-%d')} to {entity.due_date.strftime('%Y-%m-%d')} by {changed_by.fname} {changed_by.lname}"
    else:  # task
        title = f"Task Due Date Changed: {entity.title}"
        message = f"The due date for task '{entity.title}' has been changed from {old_due_date.strftime('%Y-%m-%d')} to {entity.due_date.strftime('%Y-%m-%d')} by {changed_by.fname} {changed_by.lname}"
    
    return create_automated_notification(
        recipient=recipient,
        notification_type='due_date_changed',
        title=title,
        message=message,
        project=entity.project if entity_type == 'task' else entity,
        task=entity if entity_type == 'task' else None,
        due_date=entity.due_date
    )

def notify_edit_requested(project, recipient, requested_by, edit_details):
    """Notify user when edit is requested"""
    return create_automated_notification(
        recipient=recipient,
        notification_type='edit_requested',
        title=f"Edit Requested for {project.name}",
        message=f"{requested_by.fname} {requested_by.lname} has requested edits: {edit_details}",
        project=project,
        requested_by=requested_by
    )