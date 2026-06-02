import Link from "next/link";

const FEATURES = [
  {
    href: "/discover",
    title: "Descobrir",
    desc: "Encontre pessoas compatíveis",
    icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-50",
  },
  {
    href: "/events",
    title: "Eventos",
    desc: "Munches, workshops e festas",
    icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
    color: "from-violet-500 to-purple-500",
    bg: "bg-violet-50",
  },
  {
    href: "/groups",
    title: "Grupos",
    desc: "Comunidades e discussões",
    icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
  },
  {
    href: "/matches",
    title: "Matches",
    desc: "Suas conexões e conversas",
    icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      {/* Hero */}
      <div className="text-center">
        <h1 className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent">
          Knot
        </h1>
        <p className="mt-3 text-lg text-zinc-600">
          Conexões autênticas, comunidade segura.
        </p>
        <p className="mt-1 text-sm text-zinc-400">
          Descubra pessoas, eventos e grupos que combinam com você.
        </p>
      </div>

      {/* Feature cards */}
      <div className="mt-10 grid grid-cols-2 gap-4">
        {FEATURES.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className={`group relative overflow-hidden rounded-2xl ${f.bg} p-5 transition hover:shadow-lg active:scale-[0.98]`}
          >
            <div className={`inline-flex rounded-xl bg-gradient-to-br ${f.color} p-2.5`}>
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
              </svg>
            </div>
            <h2 className="mt-3 text-lg font-bold text-zinc-900">{f.title}</h2>
            <p className="mt-1 text-sm text-zinc-600">{f.desc}</p>
          </Link>
        ))}
      </div>

      {/* Quick stats */}
      <div className="mt-10 flex justify-center gap-8 text-center">
        <div>
          <p className="text-2xl font-bold text-violet-600">100%</p>
          <p className="text-xs text-zinc-500">Seguro</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-violet-600">0</p>
          <p className="text-xs text-zinc-500">PII exposta</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-violet-600">BR</p>
          <p className="text-xs text-zinc-500">Comunidade local</p>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-10 text-center">
        <Link
          href="/discover"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-95"
        >
          Começar a explorar
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </main>
  );
}
