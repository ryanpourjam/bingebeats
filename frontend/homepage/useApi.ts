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
  //show recommendations
  const [recommendations, setRecommendations] = useState<Show[]>([]);

  //loading state
  const [loading, setLoading] = useState(false);

  //CSRF token from backend
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  //user authentication using cookies
  const [authenticated, setAuthenticated] = useState(false);

  const csrfAction = useCallback(
    async (
      action: (token: string) => Promise<void>,
      options?: { finallyAction?: () => void }
    ) => {

      //if no csrfToken don't try to load data. Otherwise perform the action as needed.
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
      //get recommendations from backend and display them on the showGrid
      const recs = await getRecommendations();
      setRecommendations(recs);
    } catch (err) {
      console.error("Failed to load recommendations", err);
    }
  }, []);

  const initCsrf = useCallback(async () => {
    try {
      //get CSRF token from backend
      const data = await fetchCsrf();
      setCsrfToken(data?.csrftoken ?? null);
    } catch (err) {
      console.error("Failed to fetch CSRF token", err);
    }
  }, []);

  const checkAuthentication = async () => {
    try {
      //check if user is authenticated
      const data = await getAuthentication();
      setAuthenticated(data.authenticated);
    } catch (err) {
      console.error("Failed to check authentication", err);
    }
  };

  const handleDislike = useCallback(
    async (showId: string) => {
      //dislike show and refresh recommendations
      await csrfAction(async () => {
        await dislikeShow(showId, csrfToken);
        await loadRecommendations();
      });
    },
    [csrfToken, loadRecommendations, csrfAction]
  );

  const handleResetDislikes = async () => {
    //remove all dislikes in the backend and refresh recommendations
    await csrfAction(async () => {
      await resetDislikes(csrfToken);
      await loadRecommendations();
    });
  };

  const handleLogout = async () => {
    //logout and reload page
    await csrfAction(async () => {
      await logout(csrfToken);
      window.location.reload();
    });
  };

  const handleCallback = useCallback(
    async (code: string) => {
      await csrfAction(async () => {
        //add the loading icon. refresh recommendations. acquire th
        setLoading(true);

        //remove spotify access code from URL
        window.history.replaceState({}, document.title, "/");

        //call on backend with code and token
        await spotifyCallback(code, csrfToken);

        //refresh recommendations
        await loadRecommendations();

        //acquire CSRF token
        await initCsrf();

        //remove loading icon
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

    //if we have a code, a token, and no recommendations... it's time to get some!
    if (code && csrfToken && recommendations.length === 0) {
      handleCallback(code);
    } else if (authenticated && recommendations.length === 0) {
      //if user profile already exists then no need to run the algorithm again
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
