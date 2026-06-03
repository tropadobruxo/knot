"use client";

export default function OfflinePage() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="relative mx-auto h-28 w-28">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-200 to-zinc-200 opacity-50 blur-xl" />
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-zinc-100">
          <svg className="h-14 w-14 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
          </svg>
        </div>
      </div>
      <h1 className="mt-6 text-2xl font-bold text-zinc-700 dark:text-zinc-200">Sem conexao</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Voce esta offline. Verifique sua conexao e tente novamente.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
      >
        Tentar novamente
      </button>
    </main>
  );
}
