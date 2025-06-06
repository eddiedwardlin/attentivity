from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

from users import views

app_name = "users"

urlpatterns = [
    path("register/", views.UserRegistrationAPIView.as_view(), name="create-user"),
    path("login/", views.UserLoginAPIView.as_view(), name="login-user"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("logout/", views.UserLogoutAPIView.as_view(), name="logout-user"),
    path("", views.UserAPIView.as_view(), name="user-info"),
    path("list/", views.UserList.as_view(), name="user-list"),
]