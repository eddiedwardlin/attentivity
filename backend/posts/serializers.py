from rest_framework import serializers
from .models import Comment, Post, Project
from django.contrib.auth import get_user_model

class ProjectSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.email')
    posts = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'title', 'author', 'posts']

class PostSerializer(serializers.ModelSerializer):
    project = serializers.SlugRelatedField(queryset=Project.objects.none(), slug_field='title')
    author = serializers.ReadOnlyField(source='author.email')
    comments = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    image = serializers.ImageField(required=False)
    file = serializers.FileField(required=False)
    summary = serializers.ReadOnlyField()
    guest_token_expiration = serializers.ReadOnlyField()
    additional_users = serializers.SlugRelatedField(queryset=get_user_model().objects.all(), slug_field='email', many=True)

    class Meta:
        model = Post
        fields = ['id', 'project', 'title', 'body', 'author', 'image', 'file', 'comments', 'summary', 'guest_token', 'guest_token_expiration', 'additional_users']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Restrict project queryset by user
        user = self.context['request'].user
        if user.is_authenticated:
            if user.is_staff:  # Staff can access all projects
                self.fields['project'].queryset = Project.objects.all()
            else:  # Regular users can only access their own projects
                self.fields['project'].queryset = Project.objects.filter(author=user)

    def validate_image(self, data):
        max_file_size = 100 * 1024 * 1024  # 100MB
        if data.size > max_file_size:
            raise serializers.ValidationError("Image size should not exceed 5MB.")
        return data
    
    def validate_file(self, data):
        max_file_size = 1024 * 1024 * 1024  # 1GB
        if data.size > max_file_size:
            raise serializers.ValidationError("File size should not exceed 5MB.")
        return data

class CommentSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.email')

    class Meta:
        model = Comment
        fields = ['id', 'body', 'author', 'guest_name']
