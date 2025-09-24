# signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Task, Project, Feedback, EditRequest
from .utils import (
    notify_task_assignee,
    notify_feedback_given,
    notify_edit_requested,
    notify_due_date_upcoming_task,
    notify_due_date_upcoming_project
)

# --- Task assignment ---
@receiver(post_save, sender=Task)
def task_post_save(sender, instance: Task, created, **kwargs):
    if created:
        notify_task_assignee(instance)
    # Also check if due date is approaching
    notify_due_date_upcoming_task(instance)

# --- Project due date ---
@receiver(post_save, sender=Project)
def project_post_save(sender, instance: Project, created, **kwargs):
    if created:
        # Optional: notify members of project creation
        pass
    notify_due_date_upcoming_project(instance)

# --- Feedback given ---
@receiver(post_save, sender=Feedback)
def feedback_post_save(sender, instance: Feedback, created, **kwargs):
    if created:
        notify_feedback_given(instance)

# --- Edit requested ---
@receiver(post_save, sender=EditRequest)
def edit_request_post_save(sender, instance: EditRequest, created, **kwargs):
    if created:
        notify_edit_requested(instance)