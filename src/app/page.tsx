import Link from "next/link";

const FEATURES = [
  {
    href: "/discover",
    number: "01",
    title: "Descobrir",
    desc: "Encontre pessoas compatíveis",
    icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
  },
  {
    href: "/events",
    number: "02",
    title: "Eventos",
    desc: "Munches, workshops e festas",
    icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
  },
  {
    href: "/groups",
    number: "03",
    title: "Grupos",
    desc: "Comunidades e discussões",
    icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z",
  },
  {
    href: "/matches",
    number: "04",
    title: "Matches",
    desc: "Suas conexões e conversas",
    icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
  },
];

const STATS = [
  { value: "100%", label: "Seguro" },
  { value: "0",    label: "PII exposta" },
  { value: "BR",   label: "Comunidade" },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-lg px-6 py-14 sm:py-20">

      {/* Wordmark + tagline */}
      <header>
        <h1 className="text-[3.25rem] font-black leading-none tracking-[-0.04em] text-zinc-950 dark:text-zinc-50">
          Knot
        </h1>
        <p className="mt-4 max-w-xs text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
          Conexões autênticas para a comunidade kink e fetichista do Brasil.
        </p>
      </header>

      {/* Feature list */}
      <nav
        aria-label="Seções"
        className="mt-10 divide-y divide-zinc-100 dark:divide-zinc-800/50"
      >
        {FEATURES.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="group flex items-center gap-4 py-4 transition-all hover:pl-1 active:opacity-70"
          >
            {/* Number */}
            <span className="w-7 shrink-0 font-mono text-xs text-zinc-300 dark:text-zinc-700">
              {f.number}
            </span>

            {/* Icon */}
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700/60 dark:bg-zinc-800/80">
              <svg
                className="h-4.5 w-4.5 text-zinc-500 dark:text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
              </svg>
            </span>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p className="font-semibold leading-tight text-zinc-900 dark:text-zinc-100">
                {f.title}
              </p>
              <p className="mt-0.5 text-sm text-zinc-400 dark:text-zinc-500">
                {f.desc}
              </p>
            </div>

            {/* Arrow */}
            <svg
              className="h-4 w-4 shrink-0 text-zinc-300 transition-transform group-hover:translate-x-0.5 dark:text-zinc-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        ))}
      </nav>

      {/* CTA */}
      <div className="mt-8">
        <Link
          href="/discover"
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 active:scale-[0.97] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          Começar a explorar
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-10 flex gap-8 border-t border-zinc-100 pt-8 dark:border-zinc-800/50">
        {STATS.map((s) => (
          <div key={s.label}>
            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{s.value}</p>
            <p className="mt-0.5 text-xs text-zinc-400">{s.label}</p>
          </div>
        ))}
      </div>

    </main>
  );
}
