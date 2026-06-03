export default function Loading() {
  return (
    <main className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
        <p className="text-sm text-zinc-500">Carregando...</p>
      </div>
    </main>
  );
}
