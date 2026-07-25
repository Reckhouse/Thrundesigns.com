"use client";

import { useState, cloneElement, isValidElement } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import {
  SectionHeading,
} from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const quoteSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  company: z.string().optional(),
  projectType: z.string().min(1, "Select a project type"),
  budget: z.string().min(1, "Select a budget range"),
  timeline: z.string().min(1, "Select a timeline"),
  message: z.string().min(10, "Tell us a little more"),
});

type QuoteValues = z.infer<typeof quoteSchema>;

const steps = ["Contact", "Project", "Details"] as const;

export default function QuotePage() {
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<FileList | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">(
    "idle",
  );

  const form = useForm<QuoteValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      projectType: "",
      budget: "",
      timeline: "",
      message: "",
    },
    mode: "onTouched",
  });

  async function onSubmit(values: QuoteValues) {
    setStatus("submitting");
    try {
      const body = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value) body.append(key, value);
      });
      if (files) {
        Array.from(files)
          .slice(0, 5)
          .forEach((file) => body.append("files", file));
      }

      const res = await fetch("/api/quote", {
        method: "POST",
        body,
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  async function nextStep() {
    const fields: (keyof QuoteValues)[][] = [
      ["name", "email", "company"],
      ["projectType", "budget", "timeline"],
      ["message"],
    ];
    const valid = await form.trigger(fields[step]);
    if (valid) setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 pt-[80px] md:pt-[96px]">
        <section className="border-b border-line">
          <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-6 py-12 md:gap-12 md:px-10 md:py-16 lg:grid-cols-[1fr_1fr] lg:px-[74px]">
            <div>
              <SectionHeading className="text-balance">
                Tell us what you&apos;re building.
              </SectionHeading>
              <p className="mt-6 max-w-[42ch] text-pretty font-sans text-[15px] leading-7 text-fg-muted">
                A short brief is enough. We’ll reply within a few business days
                with scope options and next steps.
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
              className="border border-line bg-bg-raised p-5 md:p-8"
            >
              {status === "done" ? (
                <div>
                  <h2 className="font-display text-3xl text-fg text-balance">
                    Thanks — your brief is in.
                  </h2>
                  <p className="mt-4 max-w-[40ch] text-pretty font-sans text-fg-muted">
                    We’ll review it and reply within a few business days with
                    scope options and clear next steps. No need to resubmit
                    unless something changes.
                  </p>
                </div>
              ) : (
                <>
                  {step === 0 && (
                    <div className="space-y-5">
                      <Field
                        label="Name"
                        error={form.formState.errors.name?.message}
                      >
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
                          <option value="brand">Brand & system architecture</option>
                          <option value="website">Web design & maintenance</option>
                          <option value="audit">Business marketing audit</option>
                          <option value="print">Print & digital assets</option>
                          <option value="mixed">Mixed engagement</option>
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
                          <option value="5-15k">$5k–$15k</option>
                          <option value="15-40k">$15k–$40k</option>
                          <option value="40k+">$40k+</option>
                          <option value="unsure">Not sure yet</option>
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
                          <option value="asap">ASAP</option>
                          <option value="1-3">1–3 months</option>
                          <option value="3-6">3–6 months</option>
                          <option value="exploring">Exploring</option>
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
                        disabled={status === "submitting"}
                      >
                        {status === "submitting" ? "Sending…" : "Submit quote"}
                      </Button>
                    )}
                  </div>
                  {status === "error" && (
                    <p className="mt-4 font-sans text-sm text-red-300" role="alert">
                      We couldn’t send your brief. Check your connection and try
                      again — your answers on this step are still here.
                    </p>
                  )}
                </>
              )}
            </form>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
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
