from rest_framework import serializers
from marketing.models import MessageTemplate


class MessageTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageTemplate
        fields = ["id", "salon", "name", "body", "created_at", "updated_at"]
        read_only_fields = ["id", "salon", "created_at", "updated_at"]