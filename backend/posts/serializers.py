from rest_framework import serializers

from .models import Comment, Post

class PostSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.email')
    comments = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    image = serializers.ImageField(required=False)
    file = serializers.FileField(required=False)

    class Meta:
        model = Post
        fields = ['id', 'title', 'body', 'author', 'image', 'file', 'comments', 'summary', 'guest_token', 'guest_token_expiration']

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
