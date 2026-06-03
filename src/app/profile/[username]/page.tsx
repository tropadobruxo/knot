import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPublicProfile } from "@/lib/profile";
import { TrustActions } from "@/components/trust-actions";
import { PhotoLightbox } from "@/components/photo-lightbox";
import { ShareProfile } from "@/components/share-profile";
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

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 text-2xl font-bold text-white">
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
            {profile.roleType && (
              <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-800">
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
              className="flex items-center gap-1.5 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:border-violet-300 hover:bg-violet-50"
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
        <p className="mt-5 text-zinc-600 leading-relaxed">{profile.bio}</p>
      )}

      {profile.intent.length > 0 && (
        <div className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Busca</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {profile.intent.map((i) => (
              <span
                key={i}
                className="rounded-full bg-zinc-100 px-3 py-1 text-sm"
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
              <span className="flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700">
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

      {profile.interests.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Interesses</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <span
                key={interest.id}
                className="rounded-full bg-violet-100 px-3 py-1 text-sm text-violet-800"
              >
                {interest.name}
                {interest.level && (
                  <span className="ml-1 text-xs text-violet-500">
                    ({interest.level})
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
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
