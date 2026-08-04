"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { controlledChaosPersistenceAdapter } from "@/experiences/controlled-chaos/persistenceAdapter";
import { trackExperienceEvent } from "@/experiences/analytics";
import { controlledChaosManifest } from "@thrun-design/controlled-chaos/manifest";

export function DuplicateCreationButton({
  creationId,
}: {
  creationId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setPending(true);
          setError(null);
          void controlledChaosPersistenceAdapter
            .duplicate(creationId)
            .then((result) => {
              trackExperienceEvent("creation_duplicated", {
                experienceKey: controlledChaosManifest.experienceKey,
                mode: "replay",
              });
              router.push(result.url);
            })
            .catch((err: unknown) => {
              setError(
                err instanceof Error ? err.message : "Duplicate failed",
              );
              setPending(false);
            });
        }}
        className="inline-flex h-[44px] items-center border border-line px-4 font-mono text-[11px] uppercase tracking-[0.12em] text-fg transition-colors hover:border-gold hover:text-gold disabled:opacity-50"
      >
        {pending ? "Duplicating…" : "Duplicate this version"}
      </button>
      {error ? (
        <p role="alert" className="font-sans text-[13px] text-fg-muted">
          {error}
        </p>
      ) : null}
    </div>
  );
}
