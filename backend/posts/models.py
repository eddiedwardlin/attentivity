from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.db.models.signals import post_delete
from django.dispatch import receiver
import uuid
from datetime import timedelta
from django.utils.timezone import now

class Project(models.Model):
    title = models.CharField(_("Project title"), max_length=250)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="projects",
        null=True,
        on_delete=models.CASCADE,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)
        constraints = [
            models.UniqueConstraint(fields=['author', 'title'], name='unique_project_per_user') # Projects made by a user must have a unique name
        ]

    def __str__(self):
        return self.title

def get_default_guest_token_expiration():
        return now() + timedelta(days=7)

class Post(models.Model):
    project = models.ForeignKey(
        Project,
        related_name="posts",
        null=True,
        on_delete=models.CASCADE,
    )
    title = models.CharField(_("Post title"), max_length=250)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="posts",
        null=True,
        on_delete=models.CASCADE,
    )
    body = models.TextField(_("Post body"))
    image = models.ImageField(_("Post image"), upload_to="images/%Y/%m/%d/", null=True, blank=True)
    file = models.FileField(_("Post file"), upload_to="files/%Y/%m/%d/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    summary = models.TextField(null=True, blank=True)
    guest_token = models.UUIDField(default=uuid.uuid4, editable=False)
    guest_token_expiration = models.DateTimeField(default=get_default_guest_token_expiration)

    class Meta:
        ordering = ("title",)
        constraints = [
            models.UniqueConstraint(fields=['author', 'project', 'title'], name='unique_post_per_user') # Posts made by the same user in the same project must have a unique name
        ]

    def __str__(self):
        return f"{self.title} by {self.author}"
    
    def is_guest_token_valid(self):
        return now() <= self.guest_token_expiration

class Comment(models.Model):
    post = models.ForeignKey(Post, related_name="comments", on_delete=models.CASCADE)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="post_comments",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    guest_name = models.CharField(_("Guest Name"), max_length=100, null=True, blank=True)
    body = models.TextField(_("Comment body"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.body[:20]} by {self.author}"