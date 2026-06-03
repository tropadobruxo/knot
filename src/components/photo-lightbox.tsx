"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

interface Photo {
  id: string;
  url: string;
  verified: boolean;
  locked?: boolean;
}

interface Props {
  photos: Photo[];
}

export function PhotoLightbox({ photos }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [screenshotWarning, setScreenshotWarning] = useState(false);

  const close = useCallback(() => setOpenIndex(null), []);

  const prev = useCallback(() => {
    setOpenIndex((i) => (i !== null && i > 0 ? i - 1 : i));
  }, []);

  const next = useCallback(() => {
    setOpenIndex((i) => (i !== null && i < photos.length - 1 ? i + 1 : i));
  }, [photos.length]);

  useEffect(() => {
    if (openIndex === null) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }

    // Detect screenshot attempts (mobile visibility change)
    function onVisibilityChange() {
      if (document.visibilityState === "hidden" && openIndex !== null) {
        setScreenshotWarning(true);
        setTimeout(() => setScreenshotWarning(false), 3000);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.body.style.overflow = "";
    };
  }, [openIndex, close, prev, next]);

  return (
    <>
      {/* Thumbnail grid */}
      <div className="mt-2 grid grid-cols-3 gap-2">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => !photo.locked && setOpenIndex(i)}
            className={`relative aspect-square overflow-hidden rounded-xl bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500 ${photo.locked ? "cursor-default" : ""}`}
          >
            <Image
              src={photo.url}
              alt=""
              fill
              className={`object-cover transition ${photo.locked ? "blur-xl scale-110" : "hover:scale-105"}`}
              unoptimized
            />
            {photo.locked && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm">
                <svg className="h-6 w-6 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <span className="mt-1 text-[10px] font-medium text-white/80">Apos match</span>
              </div>
            )}
            {photo.verified && !photo.locked && (
              <span className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 rounded-full bg-green-600/90 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                verificada
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Screenshot warning toast */}
      {screenshotWarning && (
        <div className="fixed left-1/2 top-20 z-[80] -translate-x-1/2 rounded-xl bg-red-600 px-5 py-3 shadow-2xl" style={{ animation: "slide-up 0.3s ease-out" }}>
          <div className="flex items-center gap-2 text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <span className="text-sm font-medium">Screenshots de fotos nao sao permitidos</span>
          </div>
        </div>
      )}

      {/* Lightbox modal */}
      {openIndex !== null && photos[openIndex] && (
        <div
          className="fixed inset-0 z-[70] flex select-none items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={close}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Close button */}
          <button
            onClick={close}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Counter */}
          <div className="absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
            {openIndex + 1} / {photos.length}
          </div>

          {/* Previous */}
          {openIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}

          {/* Next */}
          {openIndex < photos.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}

          {/* Image */}
          <div
            className="relative mx-16 max-h-[85vh] max-w-[85vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[openIndex].url}
              alt=""
              width={800}
              height={800}
              className="pointer-events-none max-h-[85vh] w-auto rounded-lg object-contain"
              draggable={false}
              unoptimized
            />
            {/* Watermark overlay */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.08]">
              <p className="rotate-[-30deg] text-4xl font-bold tracking-widest text-white select-none">KNOT</p>
            </div>
            {photos[openIndex].verified && (
              <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-green-600/90 px-3 py-1 text-sm font-medium text-white backdrop-blur">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                Foto verificada
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
