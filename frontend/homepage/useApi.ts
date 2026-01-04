"use client";
import { useState, useEffect, useCallback } from "react";
import type { Show } from "../lib/types";
import {
  fetchCsrf,
  getAuthentication,
  spotifyCallback,
  getRecommendations,
  dislikeShow,
  resetDislikes,
  logout,
} from "../lib/api";

export function useApi() {
  const [recommendations, setRecommendations] = useState<Show[]>([]);
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  const csrfAction = useCallback(
    async (
      action: (token: string) => Promise<void>,
      options?: { finallyAction?: () => void }
    ) => {
      if (!csrfToken) return;
      try {
        await action(csrfToken);
      } catch (err) {
        console.error("Action failed", err);
      } finally {
        options?.finallyAction?.();
      }
    },
    [csrfToken]
  );

  const loadRecommendations = useCallback(async () => {
    try {
      const recs = await getRecommendations();
      setRecommendations(recs);
    } catch (err) {
      console.error("Failed to load recommendations", err);
    }
  }, []);

  const initCsrf = useCallback(async () => {
    try {
      const data = await fetchCsrf();
      setCsrfToken(data?.csrftoken ?? null);
    } catch (err) {
      console.error("Failed to fetch CSRF token", err);
    }
  }, []);

  const checkAuthentication = async () => {
    try {
      const data = await getAuthentication();
      setAuthenticated(data.authenticated);
    } catch (err) {
      console.error("Failed to check authentication", err);
    }
  };

  const handleDislike = useCallback(
    async (showId: string) => {
      await csrfAction(async () => {
        await dislikeShow(showId, csrfToken);
        await loadRecommendations();
      });
    },
    [csrfToken, loadRecommendations, csrfAction]
  );

  const handleResetDislikes = async () => {
    await csrfAction(async () => {
      await resetDislikes(csrfToken);
      await loadRecommendations();
    });
  };

  const handleLogout = async () => {
    await csrfAction(async () => {
      await logout(csrfToken);
      window.location.reload();
    });
  };

  const handleCallback = useCallback(
    async (code: string) => {
      await csrfAction(async () => {
        setLoading(true);
        window.history.replaceState({}, document.title, "/");
        await spotifyCallback(code, csrfToken);
        await loadRecommendations();
        await initCsrf();
        setLoading(false);
      });
    },
    [csrfAction, csrfToken, loadRecommendations, initCsrf]
  );

  useEffect(() => {
    initCsrf();
    checkAuthentication();
  }, [initCsrf]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code && csrfToken && recommendations.length === 0) {
      handleCallback(code);
    } else if (authenticated && recommendations.length === 0) {
      loadRecommendations();
    }
  }, [
    csrfToken,
    authenticated,
    handleCallback,
    loadRecommendations,
    recommendations.length,
  ]);

  return {
    recommendations,
    loading,
    handleDislike,
    handleResetDislikes,
    handleLogout,
    loadRecommendations,
  };
}
