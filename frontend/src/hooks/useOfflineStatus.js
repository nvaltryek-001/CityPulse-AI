import {
  useEffect,
  useState
} from "react";

import {
  getPendingCount
} from "../services/offlineDb";

import {
  registerAutoSync
} from "../services/offlineSyncService";

export function useOfflineStatus() {

  const [
    online,
    setOnline
  ] = useState(
    typeof navigator ===
      "undefined"
      ? true
      : navigator.onLine
  );

  const [
    pendingCount,
    setPendingCount
  ] = useState(0);

  const [
    syncing,
    setSyncing
  ] = useState(false);

  useEffect(() => {

    let mounted = true;

    const refresh =
      async () => {
        try {
          const count =
            await getPendingCount();

          if (mounted) {
            setPendingCount(
              count
            );
          }
        } catch {
          // IndexedDB may be unavailable.
        }
      };

    const onlineHandler =
      () => {
        setOnline(true);
      };

    const offlineHandler =
      () => {
        setOnline(false);
      };

    window.addEventListener(
      "online",
      onlineHandler
    );

    window.addEventListener(
      "offline",
      offlineHandler
    );

    refresh();

    const cleanupSync =
      registerAutoSync(
        async () => {
          if (!mounted) {
            return;
          }

          setSyncing(true);

          await refresh();

          window.setTimeout(
            () => {
              if (mounted) {
                setSyncing(false);
              }
            },
            700
          );
        }
      );

    return () => {
      mounted = false;

      window.removeEventListener(
        "online",
        onlineHandler
      );

      window.removeEventListener(
        "offline",
        offlineHandler
      );

      cleanupSync?.();
    };

  }, []);

  return {
    online,
    pendingCount,
    syncing
  };
}
