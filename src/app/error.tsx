"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-20">
      <div className="relative mx-auto h-24 w-24">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-200 to-rose-200 opacity-50 blur-xl" />
        <div className="animate-float relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-rose-100">
          <svg className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
      </div>
      <h1 className="mt-6 text-xl font-bold text-zinc-800 dark:text-zinc-100">Algo deu errado</h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Ocorreu um erro inesperado. Tente novamente.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
      >
        Tentar novamente
      </button>
    </main>
  );
}
