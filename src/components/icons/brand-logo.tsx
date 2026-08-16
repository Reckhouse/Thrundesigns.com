import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  /** `light` = cream/white mark for dark surfaces; `dark` = black mark for light surfaces. */
  variant?: "light" | "dark";
};

/**
 * Site mark from `public/brand/logo-mark.png` (black artwork on transparent).
 * Header/footer sit on dark surfaces, so the default `light` variant inverts
 * the black mark to read as cream/white.
 */
export function BrandLogo({ className, variant = "light" }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static brand asset; height driven by className
    <img
      src="/brand/logo-mark.png"
      alt="Thrun Design Co."
      width={1000}
      height={1000}
      decoding="async"
      className={cn(
        "h-12 w-auto",
        variant === "light" && "brightness-0 invert",
        className,
      )}
    />
  );
}
