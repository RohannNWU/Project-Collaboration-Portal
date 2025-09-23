from django.test import TestCase
#from django.contrib.auth.models import User

from django.utils import timezone
from datetime import timedelta
from .models import Project, Task, User
from .utils import (
    notify_task_assignee,
    notify_feedback_given,
    notify_edit_requested,
    notify_due_date_upcoming_task,
    notify_due_date_upcoming_project
)

class NotificationTests(TestCase):

    def setUp(self):
        # Create Users
        self.user1 = User.objects.create(
            email='userone@example.com',
            fname='User',
            lname='One',
            password='1234'
        )
        self.user2 = User.objects.create(
            email='usertwo@example.com',
            fname='User',
            lname='Two',
            password='4321'
        )

        # Create Project
        self.project = Project.objects.create(
            name='Test Project',
            owner=self.user1,
            due_date=timezone.now() + timedelta(days=1)
        )
        self.project.members.add(self.user2)

        # Create Task
        self.task = Task.objects.create(
            title='Test Task',
            project=self.project,
            assignee=self.user2,
            creator=self.user1,
            due_date=timezone.now() + timedelta(hours=20)
        )

    def test_task_assignment_signal(self):
        notify_task_assignee(self.task)
        self.assertEqual(
            self.task.notifications.filter(notification_type='task_assigned').count(),
            1
        )

    def test_feedback_notification(self):
        notify_feedback_given(self.task, feedback_text="Good job")
        self.assertEqual(
            self.task.notifications.filter(notification_type='feedback_given').count(),
            1
        )

    def test_edit_request_notification(self):
        notify_edit_requested(self.task, editor=self.user2)
        self.assertEqual(
            self.task.notifications.filter(notification_type='edit_requested').count(),
            1
        )

    def test_upcoming_task_due_date_notification(self):
        notify_due_date_upcoming_task(self.task)
        self.assertEqual(
            self.task.notifications.filter(notification_type='upcoming_task_due_date').count(),
            1
        )

    def test_upcoming_project_due_date_notification(self):
        notify_due_date_upcoming_project(self.project)
        self.assertEqual(
            self.project.notifications.filter(notification_type='upcoming_project_due_date').count(),
            1
        )
