"use client";

import { useCallback, useEffect, useState } from "react";

export function useUnreadCount() {
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    fetch("/api/conversations/unread")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<{ count: number }>;
      })
      .then((d) => setCount(d.count))
      .catch(() => {
        // Demo mode or not authenticated — leave at 0
      });
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [refresh]);

  return count;
}
