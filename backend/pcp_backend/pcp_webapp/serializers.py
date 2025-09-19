from rest_framework import serializers
from .models import User, Project, UserProject, ProjectChat, ChatMessage

#User Serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name']


# Project Serializer
class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['project_id', 'project_name', 'project_description', 'due_date']



# Project Chat Serializer
class ProjectChatSerializer(serializers.ModelSerializer):
    project = ProjectSerializer(read_only=True)

    class Meta:
        model = ProjectChat
        fields = ['pc_id', 'project']



# Chat Message Serializer
class ChatMessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)  
    chat_room = serializers.PrimaryKeyRelatedField(queryset=ProjectChat.objects.all())

    class Meta:
        model = ChatMessage
        fields = ['cm_id', 'chat_room', 'user', 'content', 'sent_at', 'status']