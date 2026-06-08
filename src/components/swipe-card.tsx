"use client";

import { useRef } from "react";
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";

interface SwipeCardProps {
  children: React.ReactNode;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  cardKey: string;
}

const SWIPE_THRESHOLD = 100;

export function SwipeCard({ children, onSwipeRight, onSwipeLeft, cardKey }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
  const likeOpacity = useTransform(x, [0, 80], [0, 1]);
  const passOpacity = useTransform(x, [-80, 0], [1, 0]);
  const scale = useTransform(
    x,
    [-300, -100, 0, 100, 300],
    [0.95, 1, 1, 1, 0.95]
  );
  const exitedRef = useRef(false);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (exitedRef.current) return;
    if (info.offset.x > SWIPE_THRESHOLD) {
      exitedRef.current = true;
      onSwipeRight();
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      exitedRef.current = true;
      onSwipeLeft();
    }
  }

  return (
    <motion.div
      key={cardKey}
      style={{ x, rotate, scale }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: x.get() > 0 ? 300 : -300, rotate: x.get() > 0 ? 20 : -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="relative cursor-grab active:cursor-grabbing"
    >
      {/* CURTIR indicator */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="pointer-events-none absolute left-4 top-4 z-30 rounded-lg border-2 border-green-400 bg-green-400/20 px-3 py-1 text-lg font-bold text-green-400 backdrop-blur"
      >
        CURTIR
      </motion.div>
      {/* PASSAR indicator */}
      <motion.div
        style={{ opacity: passOpacity }}
        className="pointer-events-none absolute right-4 top-4 z-30 rounded-lg border-2 border-red-400 bg-red-400/20 px-3 py-1 text-lg font-bold text-red-400 backdrop-blur"
      >
        PASSAR
      </motion.div>
      {children}
    </motion.div>
  );
}
