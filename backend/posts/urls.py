from django.urls import include, path
from posts import views

app_name = "posts"

urlpatterns = [
    path('projects/', views.ProjectList.as_view()),
    path('projects/<int:pk>/', views.ProjectDetail.as_view()),
    path('', views.PostList.as_view()),
    path('<int:pk>/', views.PostDetail.as_view()),
    path('<int:pk>/refresh_guest_token/', views.RefreshGuestToken.as_view()),
    path('<int:pk>/summary/', views.PostSummary.as_view()),
    path('<int:post_id>/comments/', views.CommentList.as_view()),
    path('<int:post_id>/comments/<int:pk>/', views.CommentDetail.as_view()),
]