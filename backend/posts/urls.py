from django.urls import include, path
from posts import views

app_name = "posts"

urlpatterns = [
    path('projects/', views.ProjectListCreate.as_view()),
    path('projects/<int:pk>/', views.ProjectDetail.as_view()),
    path('', views.PostListCreate.as_view()),
    path('<int:pk>/', views.PostDetail.as_view()),
    path('additional/', views.PostListAdditional.as_view()),
    path('additional/<int:pk>/', views.PostRetrieveUpdateAdditional.as_view()),
    path('<int:pk>/refresh_guest_token/', views.RefreshGuestToken.as_view()),
    path('<int:pk>/summary/', views.PostSummary.as_view()),
    path('<int:post_id>/comments/', views.CommentListCreate.as_view()),
    path('<int:post_id>/comments/<int:pk>/', views.CommentDetail.as_view()),
]