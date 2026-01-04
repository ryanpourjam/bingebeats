import json
import numpy as np
from spotipy import Spotify
from algorithm.recommender import (
    build_user_vector,
    recommend_shows,
    build_show_vector,
)
from pathlib import Path

shows_path = Path(__file__).resolve().parent.parent / "filtered_shows.json"
with open(shows_path, encoding="utf-8") as f:
    shows = json.load(f)
show_vecs = np.array([build_show_vector(show) for show in shows])
shows_dict = {show["id"]: show for show in shows}


def recommend_route(sp: Spotify):
    artists_data = sp.current_user_top_artists(limit=20)
    artists = artists_data.get("items", [])
    artists_with_genres = [a for a in artists if a.get("genres")]

    if not artists_with_genres:
        return []

    top_artists = artists_with_genres[:8]

    user_data = {
        "top_artists_with_genres": [
            {"genres": artist["genres"]} for artist in top_artists
        ],
    }

    user_vec = build_user_vector(user_data)
    ranked_show_ids = recommend_shows(user_vec, shows, show_vecs)
    return ranked_show_ids


def collect_show_info(top_ids: list):
    shows_info = []
    for sid in top_ids:
        if sid in shows_dict:
            show = {
                "id": shows_dict[sid]["id"],
                "name": shows_dict[sid]["name"],
                "imageUrl": shows_dict[sid]["poster_path"],
                "description": shows_dict[sid]["overview"],
                "homepage": shows_dict[sid]["homepage"],
            }
            shows_info.append(show)
    return shows_info
