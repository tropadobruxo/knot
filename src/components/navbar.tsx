"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/discover", label: "Descobrir" },
  { href: "/matches", label: "Matches" },
  { href: "/groups", label: "Grupos" },
  { href: "/events", label: "Eventos" },
  { href: "/premium", label: "Plus" },
  { href: "/profile/edit", label: "Perfil" },
];

export function Navbar() {
  const pathname = usePathname();

  // Hide on welcome/verify/onboarding
  if (["/welcome", "/verify", "/onboarding"].includes(pathname)) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-2">
        <Link href="/discover" className="text-xl font-bold text-violet-600">
          Knot
        </Link>
        <div className="flex gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                pathname.startsWith(item.href)
                  ? "bg-violet-100 font-medium text-violet-800"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
