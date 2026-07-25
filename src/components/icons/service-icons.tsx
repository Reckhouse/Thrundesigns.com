import { cn } from "@/lib/utils";

type IconProps = { className?: string };

export function BrandIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 54 54"
      fill="none"
      className={cn(className)}
      aria-hidden
    >
      <circle cx="27" cy="27" r="20" stroke="currentColor" strokeWidth="1.5" />
      <path d="M27 12v30M12 27h30" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function WebIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 54 54"
      fill="none"
      className={cn(className)}
      aria-hidden
    >
      <rect
        x="10"
        y="14"
        width="34"
        height="26"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M10 22h34M18 14v8M36 14v8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function PrintIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 54 54"
      fill="none"
      className={cn(className)}
      aria-hidden
    >
      <path
        d="M16 18V12h22v6M14 28h26v14H14V28Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M14 34h26" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function AuditIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 54 54"
      fill="none"
      className={cn(className)}
      aria-hidden
    >
      <path
        d="M16 14h22v26H16V14Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M22 22h10M22 28h10M22 34h6"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="36" cy="36" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M41 41l4 4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
