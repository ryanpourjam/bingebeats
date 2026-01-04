import os
from dotenv import load_dotenv
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import login, logout
from django.shortcuts import redirect
from django.views.decorators.csrf import ensure_csrf_cookie
from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth
from algorithm.recommend_route import recommend_route, collect_show_info
from api.models import User

load_dotenv()

CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")

if not all([CLIENT_ID, CLIENT_SECRET, REDIRECT_URI]):
    raise EnvironmentError("Missing one or more Spotify environment variables")

SCOPE = (
    "user-read-private user-top-read user-read-recently-played playlist-read-private"
)


@ensure_csrf_cookie
@api_view(["GET"])
@permission_classes([AllowAny])
def csrf(request):
    csrf_token = request.META.get("CSRF_COOKIE")
    return Response({"csrftoken": csrf_token})


@api_view(["GET"])
@permission_classes([AllowAny])
def authentication_status(request):
    return Response({"authenticated": request.user.is_authenticated})


@api_view(["GET"])
@permission_classes([AllowAny])
def spotify_login(request):
    sp_oauth = SpotifyOAuth(
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        redirect_uri=REDIRECT_URI,
        scope=SCOPE,
    )
    auth_url = sp_oauth.get_authorize_url()
    return redirect(auth_url)


@api_view(["POST"])
@permission_classes([AllowAny])
def callback(request, code):
    if not code:
        return Response(
            {"error": "Missing code parameter"}, status=status.HTTP_400_BAD_REQUEST
        )

    sp_oauth = SpotifyOAuth(
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        redirect_uri=REDIRECT_URI,
        scope=SCOPE,
    )

    try:
        token_info = sp_oauth.get_access_token(code)
        access_token = token_info["access_token"]
        if not access_token:
            raise ValueError("Failed to obtain access token")
        sp = Spotify(auth=access_token)
        profile_data = sp.current_user()
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    spotify_id = profile_data["id"]
    display_name = profile_data.get("display_name", spotify_id)

    try:
        user, created = User.objects.get_or_create(
            username=spotify_id, defaults={"first_name": display_name}
        )

        login(request, user)
        user.ranked_show_ids = recommend_route(sp)
        user.save()
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST", "DELETE"])
@permission_classes([IsAuthenticated])
def dislikes(request, show_id=None):
    user = request.user

    if request.method == "POST":
        if not show_id or not isinstance(show_id, str):
            return Response(
                {"error": "Missing show id"}, status=status.HTTP_400_BAD_REQUEST
            )

        if show_id not in user.disliked_ids:
            user.disliked_ids.append(show_id)
            user.save()

        return Response(status=status.HTTP_201_CREATED)

    if request.method == "DELETE":
        user.disliked_ids = []
        user.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def top_recommendations(request, top_n=5):
    user = request.user
    try:
        ranked_ids = [
            sid for sid in user.ranked_show_ids if sid not in user.disliked_ids
        ]
        top_ids = ranked_ids[:top_n]
        shows = collect_show_info(top_ids)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({"shows": shows}, status=status.HTTP_200_OK)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def session(request):
    logout(request)
    return Response(status=status.HTTP_204_NO_CONTENT)
