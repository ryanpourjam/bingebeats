from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")
embedding_cache = {}


def embed(text):
    if text not in embedding_cache:
        embedding_cache[text] = model.encode(text)
    return embedding_cache[text]


def average_embedding(texts):
    vectors = [embed(t) for t in texts if t]
    if vectors:
        return np.mean(vectors, axis=0)
    else:
        return np.zeros(model.get_sentence_embedding_dimension())


def get_embedding_dim():
    return model.get_sentence_embedding_dimension()
