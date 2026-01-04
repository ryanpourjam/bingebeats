import numpy as np
import string
from sklearn.metrics.pairwise import cosine_similarity
from algorithm.embeddings import embed, average_embedding, get_embedding_dim

banned_words = ["music", "musical", "pop"]


def build_user_vector(user):
    top_artists = user.get("top_artists_with_genres", [])

    vectors = []
    genres = []
    for index, artist in enumerate(top_artists[:8]):
        genres.extend([g for g in artist.get("genres", [])])
        if index % 2 != 0:
            avg_vec = average_embedding(genres)
            vectors.append(avg_vec)
            genres = []
    embed_dim = get_embedding_dim()
    while len(vectors) < 4:
        vectors.append(np.zeros(embed_dim))

    user_vector = np.concatenate(vectors)
    return user_vector


def build_show_vector(show):
    raw_genres = show.get("genres", [])
    if isinstance(raw_genres, str):
        genres = [g.strip() for g in raw_genres.split(",")]
    else:
        genres = raw_genres

    filtered_genres = []
    for g in genres:
        words_in_genre = [w.strip(string.punctuation) for w in g.lower().split()]
        if not any(word in banned_words for word in words_in_genre):
            filtered_genres.append(g)

    first_genre_vec = (
        embed(filtered_genres[0]) if filtered_genres else np.zeros(get_embedding_dim())
    )
    rest_genres_vec = (
        average_embedding(filtered_genres[1:])
        if len(filtered_genres) > 1
        else first_genre_vec
    )
    tagline_vec = create_vector("tagline", show)
    overview_vec = create_vector("overview", show)
    return np.concatenate([first_genre_vec, rest_genres_vec, tagline_vec, overview_vec])


def create_vector(name, show):
    feature = show.get(name)
    words_in_feature = (
        [w.strip(string.punctuation) for w in feature.lower().split()]
        if feature
        else []
    )
    if feature and not any(word in words_in_feature for word in banned_words):
        return embed(feature)
    else:
        return np.zeros(get_embedding_dim())


def recommend_shows(user_vec, shows, show_vecs):
    similarities = cosine_similarity(show_vecs, user_vec.reshape(1, -1)).flatten()
    top_indices = similarities.argsort()[::-1][:]
    return [(shows[i]["id"]) for i in top_indices]
