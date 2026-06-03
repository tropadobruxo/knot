interface Compatibility {
  score: number;
  sharedInterests: number;
  complementaryRole: boolean;
  sameCity: boolean;
  sharedIntents: number;
}

export function CompatibilityCard({ compatibility }: { compatibility: Compatibility }) {
  const items: { label: string; active: boolean }[] = [
    { label: "Roles complementares", active: compatibility.complementaryRole },
    { label: `${compatibility.sharedInterests} interesse${compatibility.sharedInterests > 1 ? "s" : ""} em comum`, active: compatibility.sharedInterests > 0 },
    { label: "Mesma cidade", active: compatibility.sameCity },
    { label: "Objetivos alinhados", active: compatibility.sharedIntents > 0 },
  ];

  const activeItems = items.filter((i) => i.active);
  if (activeItems.length === 0) return null;

  return (
    <div className="mt-6 rounded-xl border border-pink-200 bg-gradient-to-r from-pink-50 to-violet-50 p-4 dark:border-pink-800/30 dark:from-pink-950/20 dark:to-violet-950/20">
      <div className="flex items-center gap-2">
        <svg className="h-5 w-5 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.723.723 0 01-.692 0h-.002z" />
        </svg>
        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Compatibilidade</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {activeItems.map((item) => (
          <span
            key={item.label}
            className="flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-zinc-700 shadow-sm dark:bg-zinc-800/80 dark:text-zinc-300"
          >
            <svg className="h-3 w-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
