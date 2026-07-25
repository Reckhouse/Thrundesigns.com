import { NextResponse } from "next/server";
import { issueFormToken } from "@/lib/quote/form-token";
import { isTurnstileConfigured } from "@/lib/quote/turnstile";

export async function GET() {
  const issued = issueFormToken();
  if (!issued) {
    return NextResponse.json(
      { error: "Form security is not configured" },
      { status: 503 },
    );
  }

  return NextResponse.json({
    formToken: issued.formToken,
    issuedAt: issued.issuedAt,
    turnstileRequired: isTurnstileConfigured(),
  });
}
