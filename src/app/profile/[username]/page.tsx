import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPublicProfile } from "@/lib/profile";
import { prisma } from "@/lib/db";
import { scoreCandidateDetailed } from "@/lib/discovery/scoring";
import { TrustActions } from "@/components/trust-actions";
import { PhotoLightbox } from "@/components/photo-lightbox";
import { ShareProfile } from "@/components/share-profile";
import { CompatibilityCard } from "@/components/compatibility-card";
import { EndorsementSection } from "@/components/endorsement-section";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);

  if (!profile) return { title: "Perfil não encontrado — Knot" };

  const description = profile.bio
    ? profile.bio.slice(0, 160)
    : `Perfil de ${profile.username} no Knot`;

  const photoUrl = profile.photos[0]?.url;

  return {
    title: `${profile.username} — Knot`,
    description,
    openGraph: {
      title: `${profile.username} — Knot`,
      description,
      type: "profile",
      ...(photoUrl && { images: [{ url: photoUrl, width: 600, height: 600 }] }),
    },
    twitter: {
      card: photoUrl ? "summary_large_image" : "summary",
      title: `${profile.username} — Knot`,
      description,
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const session = await auth();
  const profile = await getPublicProfile(username, session?.user?.id);

  if (!profile) notFound();

  const isOwner = session?.user?.id === profile.id;

  // Compute compatibility
  let compatibility: { score: number; sharedInterests: number; complementaryRole: boolean; sameCity: boolean; sharedIntents: number } | null = null;
  if (session?.user?.id && !isOwner) {
    const viewer = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { city: true, roleType: true, intent: true, lastActive: true, interests: { select: { interestId: true, level: true } } },
    });
    if (viewer) {
      const target = await prisma.user.findUnique({
        where: { id: profile.id },
        select: { city: true, roleType: true, intent: true, lastActive: true, interests: { select: { interestId: true, level: true } } },
      });
      if (target) {
        const bd = scoreCandidateDetailed(viewer, target);
        compatibility = { score: bd.score, sharedInterests: bd.sharedInterests, complementaryRole: bd.complementaryRole, sameCity: bd.sameCity, sharedIntents: bd.sharedIntents };
      }
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-2xl font-bold text-white shadow-sm">
          {profile.username[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{profile.username}</h1>
            {profile.premiumTier === "plus" && (
              <span className="flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" />
                </svg>
                Plus
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {profile.emailVerified && (
              <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                Email verificado
              </span>
            )}
            {profile.ageVerified && (
              <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.403 12.652a3 3 0 010-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                18+ verificado
              </span>
            )}
            {profile.selfieVerified && (
              <span className="flex items-center gap-1 rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
                Selfie verificada
              </span>
            )}
            {profile.roleType && (
              <span className="rounded-full border border-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                {profile.roleType}
              </span>
            )}
            {profile.city && (
              <span className="flex items-center gap-1 text-sm text-zinc-500">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {profile.city}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ShareProfile username={profile.username} />
          {isOwner && (
            <Link
              href="/profile/edit"
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              Editar
            </Link>
          )}
        </div>
      </div>

      {profile.bio && (
        <p className="mt-5 text-zinc-600 leading-relaxed dark:text-zinc-300">{profile.bio}</p>
      )}

      {profile.intent.length > 0 && (
        <div className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Busca</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {profile.intent.map((i) => (
              <span
                key={i}
                className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm text-zinc-600 dark:border-zinc-700/70 dark:bg-zinc-800/60 dark:text-zinc-400"
              >
                {i}
              </span>
            ))}
          </div>
        </div>
      )}

      {profile.photos.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Fotos</h3>
            {profile.privatePhotoCount > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                {profile.privatePhotoCount} privada{profile.privatePhotoCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <PhotoLightbox photos={profile.photos.map((p) => ({ id: p.id, url: p.url, verified: p.verified, locked: p.locked }))} />
        </div>
      )}

      {compatibility && compatibility.score > 0 && (
        <CompatibilityCard compatibility={compatibility} />
      )}

      {profile.interests.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Interesses</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <span
                key={interest.id}
                className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm text-zinc-600 dark:border-zinc-700/70 dark:bg-zinc-800/60 dark:text-zinc-400"
              >
                {interest.name}
                {interest.level && (
                  <span className="ml-1 text-xs text-zinc-400 dark:text-zinc-500">
                    ({interest.level})
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {profile.endorsements && profile.endorsements.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Reputacao</h3>
          <EndorsementSection endorsements={profile.endorsements} targetId={profile.id} isOwner={isOwner} />
        </div>
      )}

      {!isOwner && session?.user && profile.endorsements !== undefined && (
        <EndorsementSection endorsements={profile.endorsements ?? []} targetId={profile.id} isOwner={false} showGiveButton />
      )}

      {profile.limits.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Limites</h3>
          <ul className="mt-2 space-y-2">
            {profile.limits.map((limit) => (
              <li key={limit.id} className="flex items-center gap-2 text-sm">
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                  <svg className="h-3 w-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                {limit.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isOwner && session?.user && (
        <TrustActions targetId={profile.id} targetType="user" />
      )}
    </main>
  );
}
