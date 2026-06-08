"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { fireMatchConfetti } from "@/lib/hooks/use-confetti";

interface Props {
  username: string;
  onClose: () => void;
}

export function MatchCelebration({ username, onClose }: Props) {
  useEffect(() => {
    fireMatchConfetti();
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center"
        onClick={onClose}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Match card */}
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.3, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative z-10 mx-6 max-w-sm rounded-3xl bg-gradient-to-br from-violet-600 via-pink-500 to-orange-400 p-8 text-center shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Hearts */}
          <div className="mb-4 flex items-center justify-center gap-2">
            <motion.svg
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
              className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 24 24"
            >
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </motion.svg>
            <motion.svg
              initial={{ scale: 0, rotate: 15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.35, type: "spring", stiffness: 400 }}
              className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 24 24"
            >
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </motion.svg>
          </div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-extrabold text-white"
          >
            Match!
          </motion.h2>
          <motion.p
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-2 text-lg text-white/90"
          >
            Voce e <span className="font-bold">{username}</span> se curtiram
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 flex flex-col gap-2"
          >
            <Link
              href="/matches"
              className="rounded-xl bg-white px-6 py-3 font-semibold text-violet-600 shadow-lg transition hover:shadow-xl active:scale-95"
              onClick={onClose}
            >
              Ir para Matches
            </Link>
            <button
              onClick={onClose}
              className="rounded-xl px-6 py-2.5 text-sm font-medium text-white/80 transition hover:text-white"
            >
              Continuar descobrindo
            </button>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
