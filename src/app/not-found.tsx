import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-20">
      <div className="relative mx-auto h-24 w-24">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-200 to-indigo-200 opacity-50 blur-xl" />
        <div className="animate-float relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-indigo-100">
          <span className="text-4xl font-bold text-violet-400">404</span>
        </div>
      </div>
      <h1 className="mt-6 text-xl font-bold text-zinc-800 dark:text-zinc-100">Pagina nao encontrada</h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        A pagina que voce procura nao existe ou foi movida.
      </p>
      <Link
        href="/discover"
        className="mt-6 inline-flex rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
      >
        Voltar ao inicio
      </Link>
    </main>
  );
}
