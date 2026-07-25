import { cn } from "@/lib/utils";

export function ContourOverlay({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-full w-full text-gold/35", className)}
      viewBox="0 0 820 736"
      fill="none"
      aria-hidden
    >
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <ellipse
          key={i}
          cx="560"
          cy="250"
          rx={195 + i * 45}
          ry={75 + i * 22}
          stroke="currentColor"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}
