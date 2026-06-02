"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h2>Algo deu errado</h2>
          <p style={{ color: "#666", marginTop: "0.5rem" }}>
            Ocorreu um erro inesperado. Tente novamente.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1.5rem",
              background: "#7c3aed",
              color: "#fff",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
