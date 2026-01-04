from django.urls import path
from . import views

urlpatterns = [
    path("auth/csrf/", views.csrf),
    path("auth/status/", views.authentication_status),
    path("auth/spotify/login/", views.spotify_login),
    path("auth/callback/<str:code>/", views.callback),
    path("auth/session/", views.session),
    path("users/me/recommendations/", views.top_recommendations),
    path("users/me/dislikes/", views.dislikes),
    path("users/me/dislikes/<str:show_id>/", views.dislikes),
]
