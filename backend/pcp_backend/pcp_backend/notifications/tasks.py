from celery import shared_task
from django.utils import timezone
from .services import NotificationEvent, notify
from .models import NotificationPriority, NotificationType


@shared_task
def schedule_due_soon(task_id: str, project_id: str, assignee_ids: list[str], due_iso: str):
    """
    This is meant to fire *around* the 24h-before mark.
    If the window is tight or missed (e.g., delayed beat), we still send the reminder or escalate if overdue.
    """
    now = timezone.now()
    due_at = timezone.datetime.fromisoformat(due_iso).astimezone(timezone.utc)

    # Try to catch "about to be due" if we’re in the 24h-before window
    if now < due_at and (due_at - timezone.timedelta(hours=24)) <= now:
        event = NotificationEvent(
            type=NotificationType.DUE_SOON_REMINDER,
            project_id=project_id,
            actor_user_id=None,
            title="Task due in 24 hours",
            message="Heads up! One of your tasks is due soon — don't forget to check it.",
            task_id=task_id,
            action_url=f"/projects/{project_id}/tasks/{task_id}",
            idempotency_key=f"dueSoon:{task_id}:{now.strftime('%Y%m%d%H')}",
            explicit_recipient_user_ids=assignee_ids
        )
        notify(event)

    elif now >= due_at:
        # Okay, this slipped past — escalate to "overdue"
        event = NotificationEvent(
            type=NotificationType.OVERDUE_REMINDER,
            project_id=project_id,
            actor_user_id=None,
            title="Task overdue",
            message="This task has passed its due date. Please check and update status as needed.",
            task_id=task_id,
            action_url=f"/projects/{project_id}/tasks/{task_id}",
            idempotency_key=f"overdue:{task_id}:{now.strftime('%Y%m%d%H')}",
            force_priority=NotificationPriority.CRITICAL,
            explicit_recipient_user_ids=assignee_ids
        )
        notify(event)

    # Else: Task's due date is still far out — another scheduler will catch it later.


@shared_task
def fire_due_soon(task_id: str, project_id: str, assignee_ids: list[str]):
    """
    Should run *exactly* 24 hours before a task is due.

    NOTE: Assumes Celery Beat or similar is precise. No fallback logic here.
    """
    now = timezone.now()
    # Might want to refactor the repeated message block below someday
    event = NotificationEvent(
        type=NotificationType.DUE_SOON_REMINDER,
        project_id=project_id,
        actor_user_id=None,
        title="Task due in 24 hours",
        message="Heads up! One of your tasks is due soon — don't forget to check it.",
        task_id=task_id,
        action_url=f"/projects/{project_id}/tasks/{task_id}",
        idempotency_key=f"dueSoon:{task_id}:{now.strftime('%Y%m%d%H')}",
        explicit_recipient_user_ids=assignee_ids
    )
    notify(event)


@shared_task
def fire_overdue(task_id: str, project_id: str, assignee_ids: list[str]):
    """
    Intended for use when something has *definitely* passed due time.
    Used either directly, or by fallback logic in schedule_due_soon.
    """
    now = timezone.now()
    event = NotificationEvent(
        type=NotificationType.OVERDUE_REMINDER,
        project_id=project_id,
        actor_user_id=None,
        title="Task overdue",
        message="This task has passed its due date. Please check and update status as needed.",
        task_id=task_id,
        action_url=f"/projects/{project_id}/tasks/{task_id}",
        idempotency_key=f"overdue:{task_id}:{now.strftime('%Y%m%d%H')}",
        force_priority=NotificationPriority.CRITICAL,
        explicit_recipient_user_ids=assignee_ids
    )
    notify(event)
