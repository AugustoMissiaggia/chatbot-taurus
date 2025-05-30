from rest_framework import serializers
from core.models.message import Message  

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'user', 'sender', 'text', 'timestamp']
        read_only_fields = ['id', 'timestamp']
