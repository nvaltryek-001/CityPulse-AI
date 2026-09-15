import { useCallback, useEffect, useState } from "react";

import {
  fetchNearbyIssues,
  fetchLiveReports
} from "../services/liveExploreApi.js";

import {
  normalizeExploreIssues
} from "../services/exploreIssueNormalizer.js";

export default function useLiveExplore({
  latitude = null,
  longitude = null,
  radius = 5000,
  category = "",
  status = ""
} = {}) {

  const [issues, setIssues] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [source, setSource] =
    useState("live");

  const load = useCallback(
    async () => {

      setLoading(true);
      setError("");

      try {

        let raw = [];

        if (
          Number.isFinite(Number(latitude)) &&
          Number.isFinite(Number(longitude))
        ) {

          raw =
            await fetchNearbyIssues(
              Number(latitude),
              Number(longitude),
              {
                radius,
                category,
                status,
                limit: 100
              }
            );

          setSource("nearby");

        } else {

          raw =
            await fetchLiveReports({
              category,
              status,
              limit: 100
            });

          setSource("live");
        }

        setIssues(
          normalizeExploreIssues(raw)
        );

      } catch (err) {

        setError(
          err?.message ||
          "Unable to load civic issues."
        );

        setIssues([]);

      } finally {

        setLoading(false);
      }

    },
    [
      latitude,
      longitude,
      radius,
      category,
      status
    ]
  );

  useEffect(() => {
    load();
  }, [load]);

  return {
    issues,
    loading,
    error,
    source,
    reload: load
  };
}
