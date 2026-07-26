import {
  PortableText,
  type PortableTextComponents,
} from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { cn } from "@/lib/utils";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="font-sans text-[15px] leading-7 text-fg-muted">{children}</p>
    ),
    h3: ({ children }) => (
      <h3 className="mt-10 font-display text-[clamp(1.35rem,2.4vw,1.85rem)] leading-tight tracking-[-0.02em] text-fg first:mt-0">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-8 font-display text-lg leading-snug tracking-[-0.01em] text-fg first:mt-0">
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-8 border-l border-gold pl-5 font-display text-xl leading-snug text-fg first:mt-0">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-4 list-disc space-y-2 pl-5 font-sans text-[15px] leading-7 text-fg-muted marker:text-gold">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mt-4 list-decimal space-y-2 pl-5 font-sans text-[15px] leading-7 text-fg-muted marker:text-gold">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-medium text-fg">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ children, value }) => {
      const href = typeof value?.href === "string" ? value.href : "#";
      const external = href.startsWith("http");
      return (
        <a
          href={href}
          className="text-gold underline decoration-gold/40 underline-offset-4 transition-colors hover:decoration-gold"
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
        </a>
      );
    },
  },
};

type ProjectPortableTextProps = {
  value?: PortableTextBlock[] | null;
  className?: string;
};

export function ProjectPortableText({
  value,
  className,
}: ProjectPortableTextProps) {
  if (!value?.length) return null;
  return (
    <div className={cn("space-y-4", className)}>
      <PortableText value={value} components={components} />
    </div>
  );
}
