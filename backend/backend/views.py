from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django_rest_passwordreset.views import ResetPasswordConfirm
from rest_framework.response import Response
from rest_framework import status

# Validate password when resetting
class CustomResetPasswordConfirmView(ResetPasswordConfirm):
    def post(self, request, *args, **kwargs):
        # Get the password from the request data
        password = request.data.get("password")
        
        # Validate the password using Django's validators
        try:
            validate_password(password)
        except ValidationError as e:
            # Return validation errors if the password doesn't meet the criteria
            raise Response({"password": e.messages}, status=status.HTTP_400_BAD_REQUEST)
        
        # If the password is valid, proceed with the normal flow
        return super().post(request, *args, **kwargs)
