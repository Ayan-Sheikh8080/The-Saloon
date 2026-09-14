from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.serializers import RegisterSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile = serializer.save()

        token, _ = Token.objects.get_or_create(user=profile.user)

        return Response(
            {
                "token": token.key,
                "user": {
                    "id": profile.user.id,
                    "username": profile.user.username,
                    "email": profile.user.email,
                },
                "salon": {
                    "id": profile.salon.id,
                    "name": profile.salon.name,
                },
                "role": profile.role,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {"detail": "Username and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(username=username, password=password)

        if user is None:
            return Response(
                {"detail": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        token, _ = Token.objects.get_or_create(user=user)

        profile = getattr(user, "profile", None)

        return Response(
            {
                "token": token.key,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                },
                "salon": {
                    "id": profile.salon.id,
                    "name": profile.salon.name,
                } if profile else None,
                "role": profile.role if profile else None,
            },
            status=status.HTTP_200_OK,
        )


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = getattr(user, "profile", None)

        return Response(
            {
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                },
                "salon": {
                    "id": profile.salon.id,
                    "name": profile.salon.name,
                } 
                if profile else None,
                "role": profile.role if profile else None,
            }
        )