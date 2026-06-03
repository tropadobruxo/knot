"use client";

import { useEffect } from "react";

export function DiscreetMode() {
  useEffect(() => {
    const stored = localStorage.getItem("knot-discreet");
    if (stored === "true") {
      applyDiscreetMode();
    }

    // Check from API and cache
    fetch("/api/settings/privacy")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<{ discreetMode: boolean }>;
      })
      .then((data) => {
        localStorage.setItem("knot-discreet", String(data.discreetMode));
        if (data.discreetMode) {
          applyDiscreetMode();
        }
      })
      .catch(() => {});
  }, []);

  return null;
}

function applyDiscreetMode() {
  document.title = "Notes";
  // Change favicon to a generic one
  const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]') ?? document.createElement("link");
  link.rel = "icon";
  link.href = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236b7280'><path d='M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z'/></svg>";
  if (!link.parentElement) document.head.appendChild(link);
}
