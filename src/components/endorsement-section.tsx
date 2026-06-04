"use client";

import { useState } from "react";

interface EndorsementCount {
  tag: string;
  count: number;
}

const TAG_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  respectful: { label: "Respeitou limites", icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.286z", color: "bg-green-100 text-green-700" },
  communicative: { label: "Comunicativo(a)", icon: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z", color: "bg-blue-100 text-blue-700" },
  punctual: { label: "Pontual", icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z", color: "bg-amber-100 text-amber-700" },
  safe: { label: "Seguro(a)", icon: "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z", color: "bg-teal-100 text-teal-700" },
  fun: { label: "Divertido(a)", icon: "M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z", color: "bg-pink-100 text-pink-700" },
};

export function EndorsementSection({
  endorsements,
  targetId,
  isOwner,
  showGiveButton,
}: {
  endorsements: EndorsementCount[];
  targetId: string;
  isOwner: boolean;
  showGiveButton?: boolean;
}) {
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  async function giveEndorsement(tag: string) {
    setSending(true);
    const res = await fetch("/api/endorsements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: targetId, tag }),
    });
    if (res.ok) {
      setSent(tag);
      setShowForm(false);
    }
    setSending(false);
  }

  return (
    <div>
      {endorsements.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {endorsements.map((e) => {
            const meta = TAG_LABELS[e.tag];
            if (!meta) return null;
            return (
              <span key={e.tag} className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${meta.color}`}>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={meta.icon} />
                </svg>
                {meta.label}
                <span className="rounded-full bg-white/60 px-1.5 text-[10px] font-bold">{e.count}</span>
              </span>
            );
          })}
        </div>
      )}

      {showGiveButton && !isOwner && !sent && (
        <div className="mt-3">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="text-xs text-violet-600 hover:underline"
            >
              Endorsar esta pessoa
            </button>
          ) : (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
              <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Como foi sua experiencia?</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {Object.entries(TAG_LABELS).map(([tag, meta]) => (
                  <button
                    key={tag}
                    onClick={() => giveEndorsement(tag)}
                    disabled={sending}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition hover:shadow-sm disabled:opacity-50 ${meta.color}`}
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={meta.icon} />
                    </svg>
                    {meta.label}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowForm(false)} className="mt-2 text-[10px] text-zinc-400 hover:underline">
                Cancelar
              </button>
            </div>
          )}
        </div>
      )}

      {sent && (
        <p className="mt-2 text-xs text-green-600">Endorsement enviado!</p>
      )}
    </div>
  );
}
