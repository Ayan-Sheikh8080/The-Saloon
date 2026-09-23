from django.contrib import admin
from marketing.models import MessageTemplate


@admin.register(MessageTemplate)
class MessageTemplateAdmin(admin.ModelAdmin):
    list_display = ("name", "salon", "created_at")
    list_filter = ("salon",)