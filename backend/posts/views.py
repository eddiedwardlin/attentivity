from django.shortcuts import render
from posts.models import Comment, Post, Project
from rest_framework import generics, permissions
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from posts import serializers
from .permissions import IsAuthorOrReadOnly
from rest_framework.response import Response
import uuid
from datetime import timedelta
from django.utils.timezone import now
from dotenv import load_dotenv
import os
import google.generativeai as genai
from urllib.parse import unquote
import time
import mimetypes
import requests
import tempfile
from .utils.summary import getSummary

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")
DEV_MODE = os.getenv("DEV_MODE") == "TRUE"

class ProjectListCreate(generics.ListCreateAPIView):
    serializer_class = serializers.ProjectSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_staff: # Get all projects if staff user
            return Project.objects.all()
        elif self.request.user.is_authenticated: # Other users can only see their own projects
            return Project.objects.filter(author=self.request.user)
        return None

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class ProjectDetail(generics.RetrieveDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = serializers.ProjectSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class PostListCreate(generics.ListCreateAPIView):
    serializer_class = serializers.PostSerializer
    parser_classes = [MultiPartParser, FormParser] # Different parsers to deal with images and files
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_staff: # Get all posts if staff user
            return Post.objects.all()
        elif self.request.user.is_authenticated: # Other users can only see their own posts
            return Post.objects.filter(author=self.request.user)
        return None

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class PostDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = serializers.PostSerializer
    
    def get_permissions(self):
        if self.request.method == 'GET': # This could be used for guest page
            if not self.request.user.is_authenticated:
                guest_token = self.request.query_params.get('guest_token')
                post = Post.objects.get(id=self.kwargs['pk'])
                if post.is_guest_token_valid() and guest_token == str(post.guest_token): # If guest token hasn't expired and matches the one passed in as query parameter allow access
                    return [permissions.AllowAny()]
            return [permissions.IsAuthenticatedOrReadOnly(), IsAuthorOrReadOnly()]
            
        return [permissions.IsAuthenticatedOrReadOnly()]

class PostListAdditional(generics.ListAPIView):
    serializer_class = serializers.PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        return Post.objects.filter(additional_users=user) # Filters out posts that the logged in user is an additional user for

class PostRetrieveUpdateAdditional(generics.RetrieveUpdateAPIView):
    queryset = Post.objects.all()
    serializer_class = serializers.PostSerializer
    permission_classes = [IsAuthorOrReadOnly]
        
class RefreshGuestToken(generics.UpdateAPIView):
    queryset = Post.objects.all()
    serializer_class = serializers.PostSerializer
    permission_classes = [IsAuthorOrReadOnly]

    def patch(self, *args, **kwargs):
        post = Post.objects.get(id=self.kwargs['pk'])
        post.guest_token = uuid.uuid4() # generate new guest token
        post.guest_token_expiration = now() + timedelta(days=7) # Reset expiration time
        post.save()

        serializer = self.get_serializer(post)
        return Response(serializer.data)

class PostSummary(generics.RetrieveAPIView):
    queryset = Post.objects.all()
    serializer_class = serializers.PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]

    def get(self, *args, **kwargs):
        instance = self.get_object() # get the post
        comments = self.request.query_params.get('comments') # comments passed as query parameters since it's not stored in post model

        if comments:
            instance.summary = getSummary(instance, comments) # Set the summary so it can be retrieved in the future with no api call
            instance.save()
        else:
            instance.summary = None # Summary set to None if there's no comments
            instance.save()

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class CommentListCreate(generics.ListCreateAPIView):
    serializer_class = serializers.CommentSerializer

    def get_queryset(self):
        post_id = self.kwargs['post_id']
        return Comment.objects.filter(post_id=post_id)
    
    def get_permissions(self):
        if not self.request.user.is_authenticated:
            guest_token = self.request.query_params.get('guest_token') # Token passed in as query parameter
            post = Post.objects.get(id=self.kwargs['post_id'])
            if post.is_guest_token_valid() and guest_token == str(post.guest_token): # If guest token hasn't expired and matches the one passed in as query parameter allow access
                return [permissions.AllowAny()]
        return [permissions.IsAuthenticatedOrReadOnly(), IsAuthorOrReadOnly()]

    def perform_create(self, serializer):
        post = Post.objects.get(id=self.kwargs['post_id'])
        if self.request.user.is_authenticated:
            serializer.save(post=post, author=self.request.user, guest_name=None)
        else:
            serializer.save(post=post, author=None, guest_name=self.request.data.get('guest_name')) # Author is None if comment is from guest, instead use guest name

class CommentDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = serializers.CommentSerializer

    def get_queryset(self):
        post_id = self.kwargs['post_id']
        return Comment.objects.filter(post_id=post_id)
    
    def get_permissions(self):
        if self.request.method == 'DELETE': # Decide who can delete comments
            comment = Comment.objects.get(id=self.kwargs['pk'])
            if not self.request.user.is_authenticated:
                guest_token = self.request.query_params.get('guest_token') # Token passed in as query parameter
                post = Post.objects.get(id=self.kwargs['post_id'])
                if post.is_guest_token_valid() and guest_token == str(post.guest_token) and comment.author == None: # If guest token hasn't expired and matches the one passed in as query parameter allow access for guest comments
                    return [permissions.AllowAny()]
            return [permissions.IsAuthenticatedOrReadOnly()]
        
        return [permissions.IsAuthenticatedOrReadOnly(), IsAuthorOrReadOnly()]