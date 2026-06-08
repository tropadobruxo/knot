import { computeTrustLevel, type TrustInput, type TrustLevel } from "@/lib/trust-safety";

const LEVEL_STYLES: Record<TrustLevel, string> = {
  0: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  1: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  2: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
  3: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
};

export function TrustBadge({ trust }: { trust: TrustInput }) {
  const { level, label, description } = computeTrustLevel(trust);

  return (
    <span
      title={description}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${LEVEL_STYLES[level]}`}
    >
      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.59 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.564 2 12.163 2 7c0-.538.035-1.069.104-1.589a.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.75z"
          clipRule="evenodd"
        />
      </svg>
      {label}
      <span className="ml-0.5 flex gap-0.5">
        {[1, 2, 3].map((dot) => (
          <span
            key={dot}
            className={`h-1 w-1 rounded-full ${dot <= level ? "bg-current" : "bg-current opacity-25"}`}
          />
        ))}
      </span>
    </span>
  );
}
