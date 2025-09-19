import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import ChatMessage, ProjectChat
from django.utils import timezone
from asgiref.sync import sync_to_async


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope["url_route"]["kwargs"]["chat_id"]
        self.room_group_name = f"chat_{self.chat_id}"

        # Join group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        content = data["content"]
        username = data.get("username", "Anonymous")

        # Save to DB (sync_to_async because Django ORM is sync)
        chat_message = await sync_to_async(ChatMessage.objects.create)(
            chat_room_id=self.chat_id,
            user=username,
            content=content,
            sent_at=timezone.now(),
            status="sent"
        )

        # Broadcast message to group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": {
                    "id": chat_message.pk,
                    "user": username,
                    "content": content,
                    "sent_at": str(chat_message.sent_at),
                    "status": "sent"
                }
            }
        )

        # Receive message from group
        async def chat_message(self, event):
            await self.send(text_data=json.dumps(event["message"]))