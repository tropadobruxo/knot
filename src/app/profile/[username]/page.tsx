import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPublicProfile } from "@/lib/profile";
import Link from "next/link";

interface Props {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const session = await auth();
  const profile = await getPublicProfile(username, session?.user?.id);

  if (!profile) notFound();

  const isOwner = session?.user?.id === profile.id;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{profile.username}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
            {profile.ageVerified && (
              <span className="rounded bg-green-100 px-2 py-0.5 text-green-800">
                18+ verificado
              </span>
            )}
            {profile.roleType && (
              <span className="rounded bg-violet-100 px-2 py-0.5 text-violet-800">
                {profile.roleType}
              </span>
            )}
            {profile.city && <span>{profile.city}</span>}
          </div>
        </div>
        {isOwner && (
          <Link
            href="/profile/edit"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Editar perfil
          </Link>
        )}
      </div>

      {profile.bio && (
        <p className="mt-4 text-zinc-700">{profile.bio}</p>
      )}

      {profile.intent.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-zinc-500">Busca</h3>
          <div className="mt-1 flex flex-wrap gap-2">
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
          <h3 className="text-sm font-medium text-zinc-500">Fotos</h3>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {profile.photos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square overflow-hidden rounded-lg bg-zinc-200"
              >
                <img
                  src={photo.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {photo.verified && (
                  <span className="absolute bottom-1 right-1 rounded bg-green-600 px-1.5 py-0.5 text-xs text-white">
                    verificada
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {profile.interests.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-zinc-500">Interesses</h3>
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
          <h3 className="text-sm font-medium text-zinc-500">Limites</h3>
          <ul className="mt-2 space-y-1">
            {profile.limits.map((limit) => (
              <li key={limit.id} className="flex items-center gap-2 text-sm">
                <span className="text-red-500">✕</span>
                {limit.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
