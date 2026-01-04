import { mapShow } from "./mappers";
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
import type { Show } from "../lib/types";

async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T | null> {
  console.log(`${BACKEND_URL}${endpoint}`);
  try {
    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      credentials: "include",
      ...options,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API error ${res.status}: ${text}`);
    }

    try {
      return await res.json();
    } catch {
      return null;
    }
  } catch (err) {
    console.error(`API error ${endpoint}`, err);
    throw err;
  }
}

export async function fetchCsrf() {
  return await apiFetch<{ csrftoken: string }>("/auth/csrf/", {
    method: "GET",
  });
}

export async function getAuthentication() {
  return await apiFetch<{ authenticated: boolean }>("/auth/status/", {
    method: "GET",
  });
}

export async function spotifyCallback(code: string, csrfToken: string) {
  return await apiFetch(`/auth/callback/${code}/`, {
    method: "POST",
    headers: { "X-CSRFToken": csrfToken },
  });
}

export async function getRecommendations() {
  const res = await apiFetch<{ shows: Show[] }>("/users/me/recommendations/", {
    method: "GET",
  });
  return mapShow(res);
}

export async function dislikeShow(showId: string, csrfToken: string) {
  return await apiFetch(`/users/me/dislikes/${showId}/`, {
    method: "POST",
    headers: { "X-CSRFToken": csrfToken },
  });
}

export async function resetDislikes(csrfToken: string) {
  return await apiFetch("/users/me/dislikes/", {
    method: "DELETE",
    headers: { "X-CSRFToken": csrfToken },
  });
}

export async function logout(csrfToken: string) {
  return await apiFetch("/auth/session/", {
    method: "DELETE",
    headers: { "X-CSRFToken": csrfToken },
  });
}
