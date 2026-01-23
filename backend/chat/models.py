from django.db import models
from core.utils import custom_id

def default_forum_id():
    return custom_id(prefix="forum").lower()

class Forum(models.Model):
    id = models.CharField(
        primary_key=True,
        max_length=255,
        default=default_forum_id,
        editable=False,
        unique=True,
    )
    nick_name = models.CharField(max_length=255, default="Anonymous")
    member = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='forum')
    message = models.TextField()
class chat(models.Model):
    id = models.CharField(
        primary_key=True,
        max_length=255,
        default=default_forum_id,
        editable=False,
        unique=True,
    )
class chat_group(models.Model):
    id = models.CharField(
        primary_key=True,
        max_length=255,
        default=default_forum_id,
        editable=False,
        unique=True,
    )