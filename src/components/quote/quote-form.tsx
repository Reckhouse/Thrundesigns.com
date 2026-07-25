"use client";

import { useEffect, useState, cloneElement, isValidElement } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Turnstile } from "@marsidev/react-turnstile";
import { SectionHeading } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  quoteClientSchema,
  type QuoteClientValues,
} from "@/lib/quote/schema";
import {
  BUDGET_RANGES,
  PROJECT_TYPES,
  TIMELINES,
} from "@/lib/quote/options";

const steps = ["Contact", "Project", "Details"] as const;

const projectLabels: Record<(typeof PROJECT_TYPES)[number], string> = {
  brand: "Brand & system architecture",
  website: "Web design & maintenance",
  audit: "Business marketing audit",
  print: "Print & digital assets",
  mixed: "Mixed engagement",
};

const budgetLabels: Record<(typeof BUDGET_RANGES)[number], string> = {
  "5-15k": "$5k–$15k",
  "15-40k": "$15k–$40k",
  "40k+": "$40k+",
  unsure: "Not sure yet",
};

const timelineLabels: Record<(typeof TIMELINES)[number], string> = {
  asap: "ASAP",
  "1-3": "1–3 months",
  "3-6": "3–6 months",
  exploring: "Exploring",
};

type BootstrapState = {
  formToken: string;
  turnstileRequired: boolean;
};

export function QuoteForm() {
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<FileList | null>(null);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "done" | "error" | "limited"
  >("idle");
  const [bootstrap, setBootstrap] = useState<BootstrapState | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [bootstrapError, setBootstrapError] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

  const form = useForm<QuoteClientValues>({
    resolver: zodResolver(quoteClientSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      projectType: undefined,
      budget: undefined,
      timeline: undefined,
      message: "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    let cancelled = false;
    async function loadBootstrap() {
      try {
        const res = await fetch("/api/quote/bootstrap", { method: "GET" });
        if (!res.ok) throw new Error("bootstrap failed");
        const data = (await res.json()) as BootstrapState;
        if (!cancelled) {
          setBootstrap(data);
          setBootstrapError(false);
        }
      } catch {
        if (!cancelled) setBootstrapError(true);
      }
    }
    void loadBootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(values: QuoteClientValues) {
    if (!bootstrap?.formToken) {
      setStatus("error");
      return;
    }
    if ((bootstrap.turnstileRequired || siteKey) && !turnstileToken) {
      setStatus("error");
      return;
    }

    setStatus("submitting");
    try {
      const body = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value) body.append(key, value);
      });
      body.append("formToken", bootstrap.formToken);
      body.append("website_confirm", "");
      if (turnstileToken) {
        body.append("cf-turnstile-response", turnstileToken);
        body.append("turnstileToken", turnstileToken);
      }
      if (files) {
        Array.from(files)
          .slice(0, 5)
          .forEach((file) => body.append("files", file));
      }

      const res = await fetch("/api/quote", {
        method: "POST",
        body,
      });

      if (res.status === 429) {
        setStatus("limited");
        return;
      }
      if (!res.ok) throw new Error("Failed");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  async function nextStep() {
    const fields: (keyof QuoteClientValues)[][] = [
      ["name", "email", "company"],
      ["projectType", "budget", "timeline"],
      ["message"],
    ];
    const valid = await form.trigger(fields[step]);
    if (valid) setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  return (
    <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-6 py-12 md:gap-12 md:px-10 md:py-16 lg:grid-cols-[1fr_1fr] lg:px-[74px]">
      <div>
        <SectionHeading className="text-balance">
          Tell us what you&apos;re building.
        </SectionHeading>
        <p className="mt-6 max-w-[42ch] text-pretty font-sans text-[15px] leading-7 text-fg-muted">
          A short brief is enough. We’ll reply within a few business days with
          scope options and next steps.
        </p>
        <ol className="mt-8 flex flex-wrap gap-x-4 gap-y-2 md:mt-10">
          {steps.map((label, index) => (
            <li
              key={label}
              className={`font-mono text-[11px] uppercase tracking-[0.14em] ${
                index === step ? "text-gold" : "text-fg-muted"
              }`}
            >
              0{index + 1} {label}
            </li>
          ))}
        </ol>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="relative border border-line bg-bg-raised p-5 md:p-8"
        autoComplete="on"
      >
        {/* Honeypot — visually hidden, not display:none, so bots still fill it */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
        >
          <label htmlFor="website_confirm">Company website</label>
          <input
            id="website_confirm"
            name="website_confirm"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </div>

        {status === "done" ? (
          <div>
            <h2 className="text-balance font-display text-3xl text-fg">
              Thanks — your brief is in.
            </h2>
            <p className="mt-4 max-w-[40ch] text-pretty font-sans text-fg-muted">
              We’ll review it and reply within a few business days with scope
              options and clear next steps. No need to resubmit unless something
              changes.
            </p>
          </div>
        ) : (
          <>
            {step === 0 && (
              <div className="space-y-5">
                <Field label="Name" error={form.formState.errors.name?.message}>
                  <Input
                    className="rounded-none border-line bg-bg"
                    {...form.register("name")}
                  />
                </Field>
                <Field
                  label="Email"
                  error={form.formState.errors.email?.message}
                >
                  <Input
                    type="email"
                    className="rounded-none border-line bg-bg"
                    {...form.register("email")}
                  />
                </Field>
                <Field label="Company">
                  <Input
                    className="rounded-none border-line bg-bg"
                    {...form.register("company")}
                  />
                </Field>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <Field
                  label="Project type"
                  error={form.formState.errors.projectType?.message}
                >
                  <select
                    className="flex h-9 w-full rounded-none border border-line bg-bg px-3 text-sm text-fg"
                    {...form.register("projectType")}
                  >
                    <option value="">Select</option>
                    {PROJECT_TYPES.map((value) => (
                      <option key={value} value={value}>
                        {projectLabels[value]}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field
                  label="Budget"
                  error={form.formState.errors.budget?.message}
                >
                  <select
                    className="flex h-9 w-full rounded-none border border-line bg-bg px-3 text-sm text-fg"
                    {...form.register("budget")}
                  >
                    <option value="">Select</option>
                    {BUDGET_RANGES.map((value) => (
                      <option key={value} value={value}>
                        {budgetLabels[value]}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field
                  label="Timeline"
                  error={form.formState.errors.timeline?.message}
                >
                  <select
                    className="flex h-9 w-full rounded-none border border-line bg-bg px-3 text-sm text-fg"
                    {...form.register("timeline")}
                  >
                    <option value="">Select</option>
                    {TIMELINES.map((value) => (
                      <option key={value} value={value}>
                        {timelineLabels[value]}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <Field
                  label="Project notes"
                  error={form.formState.errors.message?.message}
                >
                  <Textarea
                    rows={6}
                    className="rounded-none border-line bg-bg"
                    placeholder="Goals, audience, constraints, references…"
                    {...form.register("message")}
                  />
                </Field>
                <Field label="Attachments (optional)">
                  <Input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="rounded-none border-line bg-bg file:mr-3 file:border-0 file:bg-gold file:px-3 file:py-1 file:font-mono file:text-[10px] file:uppercase file:text-ink"
                    onChange={(event) => setFiles(event.target.files)}
                  />
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-fg-muted">
                    Up to 5 files · 8MB each · JPG, PNG, WEBP, PDF
                  </p>
                </Field>

                {siteKey ? (
                  <div className="pt-2">
                    <Turnstile
                      siteKey={siteKey}
                      onSuccess={setTurnstileToken}
                      onExpire={() => setTurnstileToken(null)}
                      onError={() => setTurnstileToken(null)}
                      options={{ theme: "dark", size: "flexible" }}
                    />
                  </div>
                ) : null}
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-none border-line"
                disabled={step === 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                Back
              </Button>
              {step < steps.length - 1 ? (
                <Button
                  type="button"
                  className="rounded-none bg-gold text-ink hover:bg-bronze hover:text-fg"
                  onClick={nextStep}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="rounded-none bg-gold text-ink hover:bg-bronze hover:text-fg"
                  disabled={
                    status === "submitting" ||
                    bootstrapError ||
                    !bootstrap?.formToken ||
                    (Boolean(siteKey) && !turnstileToken)
                  }
                >
                  {status === "submitting" ? "Sending…" : "Submit quote"}
                </Button>
              )}
            </div>

            {bootstrapError ? (
              <p className="mt-4 font-sans text-sm text-red-300" role="alert">
                The form couldn&apos;t start securely. Refresh the page and try
                again.
              </p>
            ) : null}
            {status === "limited" ? (
              <p className="mt-4 font-sans text-sm text-red-300" role="alert">
                Too many requests. Please wait a bit and try again.
              </p>
            ) : null}
            {status === "error" ? (
              <p className="mt-4 font-sans text-sm text-red-300" role="alert">
                We couldn&apos;t send your brief. Check your connection and try
                again — your answers on this step are still here.
              </p>
            ) : null}
          </>
        )}
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="font-mono text-[11px] uppercase tracking-[0.14em] text-gold"
      >
        {label}
      </Label>
      {isValidElement<{ id?: string }>(children)
        ? cloneElement(children, { id })
        : children}
      {error ? (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
