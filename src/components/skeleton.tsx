"use client";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className = "", variant = "rectangular", width, height }: SkeletonProps) {
  const baseClass = "skeleton";
  const variantClass =
    variant === "circular" ? "rounded-full" :
    variant === "text" ? "rounded h-4 w-3/4" :
    "rounded-lg";

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return <div className={`${baseClass} ${variantClass} ${className}`} style={style} />;
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
      <Skeleton className="aspect-[3/4] w-full !rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton height={24} width="60%" />
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 flex-1" />
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={80} height={80} />
        <div className="flex-1 space-y-2">
          <Skeleton height={24} width="50%" />
          <Skeleton variant="text" width="30%" />
        </div>
      </div>
      <Skeleton height={80} />
      <div className="flex gap-2">
        <Skeleton height={32} width={80} />
        <Skeleton height={32} width={80} />
        <Skeleton height={32} width={80} />
      </div>
    </div>
  );
}

const CHAT_BUBBLE_WIDTHS = ["55%", "70%", "45%", "60%", "50%", "65%"];
const CHAT_BUBBLE_HEIGHTS = [40, 52, 44, 56, 48, 60];

export function ChatSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {CHAT_BUBBLE_WIDTHS.map((w, i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
          <Skeleton
            className={i % 2 === 0 ? "rounded-2xl rounded-bl-sm" : "rounded-2xl rounded-br-sm"}
            width={w}
            height={CHAT_BUBBLE_HEIGHTS[i]}
          />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
          <Skeleton variant="circular" width={48} height={48} />
          <div className="flex-1 space-y-2">
            <Skeleton height={16} width={`${50 + i * 5}%`} />
            <Skeleton variant="text" width={`${30 + i * 3}%`} />
          </div>
        </div>
      ))}
    </div>
  );
}
