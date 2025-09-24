"""
Utility functions for the PCP webapp
"""
from django.utils import timezone
from datetime import timedelta
from .models import ActivityLog, Task, Project
import logging

logger = logging.getLogger(__name__)

def log_activity(user, project, action_type, description, task=None):
    """
    Create an activity log entry
    """
    try:
        ActivityLog.objects.create(
            user=user,
            project=project,
            action_type=action_type,
            description=description
        )
        logger.info(f"Activity logged: {action_type} by {user.email}")
    except Exception as e:
        logger.error(f"Failed to log activity: {e}")

def get_dashboard_stats(user):
    """
    Calculate comprehensive dashboard statistics for a user
    """
    now = timezone.now()
    week_from_now = now + timedelta(days=7)
    
    # User's projects
    user_projects = Project.objects.filter(
        models.Q(owner=user) | models.Q(members=user)
    ).distinct()
    
    # User's tasks
    user_tasks = Task.objects.filter(assignee=user)
    
    stats = {
        'active_projects': user_projects.filter(status__in=['planning', 'in_progress']).count(),
        'total_projects': user_projects.count(),
        'tasks_due_this_week': user_tasks.filter(
            due_date__gte=now,
            due_date__lte=week_from_now,
            status__in=['todo', 'in_progress']
        ).count(),
        'total_tasks': user_tasks.count(),
        'completed_tasks': user_tasks.filter(status='completed').count(),
        'overdue_tasks': user_tasks.filter(
            due_date__lt=now,
            status__in=['todo', 'in_progress']
        ).count(),
        'high_priority_tasks': user_tasks.filter(
            priority='high',
            status__in=['todo', 'in_progress']
        ).count(),
    }
    
    # Calculate completion rate
    if stats['total_tasks'] > 0:
        stats['completion_rate'] = round((stats['completed_tasks'] / stats['total_tasks']) * 100, 1)
    else:
        stats['completion_rate'] = 0
    
    return stats

def validate_project_access(user, project):
    """
    Check if user has access to a project
    """
    return (project.owner == user or 
            project.members.filter(email=user.email).exists())

def get_user_workload(user, days=7):
    """
    Calculate user's workload for the next N days
    """
    now = timezone.now()
    end_date = now + timedelta(days=days)
    
    tasks = Task.objects.filter(
        assignee=user,
        due_date__gte=now,
        due_date__lte=end_date,
        status__in=['todo', 'in_progress']
    ).order_by('due_date')
    
    workload = []
    for i in range(days):
        day = now + timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        day_tasks = tasks.filter(
            due_date__gte=day_start,
            due_date__lt=day_end
        )
        
        workload.append({
            'date': day.strftime('%Y-%m-%d'),
            'day_name': day.strftime('%A'),
            'task_count': day_tasks.count(),
            'estimated_hours': sum(task.estimated_hours or 0 for task in day_tasks),
            'tasks': [{'id': task.id, 'title': task.title, 'priority': task.priority} for task in day_tasks]
        })
    
    return workload

def send_notification(sender, recipient, subject, content, message_type='system', project=None):
    """
    Send a notification message to a user
    """
    try:
        from .models import Message
        Message.objects.create(
            sender=sender,
            recipient=recipient,
            project=project,
            message_type=message_type,
            subject=subject,
            content=content
        )
        logger.info(f"Notification sent from {sender.email} to {recipient.email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send notification: {e}")
        return False