import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import { serializeJsonLd } from "../json-ld";
import { validateAttachments } from "./attachments";
import { readBoundedFormData, RequestBodyError } from "./body";
import { quoteStoreConfig } from "./store-config";
import { isAllowedQuoteOrigin } from "./request-guards";
import {
  enforceQuoteRateLimits,
  enforceAttachmentUnlockRateLimits,
  runLimitChecks,
  isDuplicateSubmission,
  releaseDuplicateSubmission,
} from "./rate-limit";
import { getAttachmentSignSecret } from "./attachment-download";
import {
  createAttachmentSessionCookie,
  verifyAttachmentSessionCookie,
} from "./attachment-session";
import { POST as unlock } from "../../app/api/quote/attachments/download/route";
import { POST as submit } from "../../app/api/quote/route";
import { GET as download } from "../../app/api/quote/attachments/download/route";
import { quoteRecordPath, readQuoteRecord } from "./blob-store";

const saved = { ...process.env };
test("record identifiers cannot escape their namespace or expose contact information", async () => {
  const path = quoteRecordPath("../../person@example.com");
  assert.match(path, /^quotes\/records\/[a-f0-9]{64}\.json$/);
  assert.equal(path.includes("example.com"), false);
  assert.notEqual(path, quoteRecordPath("different"));
  await assert.rejects(() => readQuoteRecord("quotes/../../outside.json"));
});
test("quote JSON download requires an authenticated operator", async () => {
  process.env.QUOTE_ATTACHMENT_SECRET = "independent-test-secret-of-at-least-32-characters";
  const response = await download(new Request(`https://www.thrundesigns.com/api/quote/attachments/download?pathname=${quoteRecordPath("test")}`));
  assert.equal(response.status, 307);
  assert.equal(new URL(response.headers.get("location")!).pathname, "/quote-attachments");
});
afterEach(() => {
  for (const key of Object.keys(process.env))
    if (!(key in saved)) delete process.env[key];
  Object.assign(process.env, saved);
});
function localLimits() {
  Object.assign(process.env, { NODE_ENV: "test" });
  for (const key of [
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "KV_REST_API_URL",
    "KV_REST_API_TOKEN",
  ])
    delete process.env[key];
}
function unlockRequest(password: string, ip: string) {
  const form = new URLSearchParams({ password, pathname: "quotes/sample.pdf" });
  return new Request(
    "https://www.thrundesigns.com/api/quote/attachments/download",
    {
      method: "POST",
      headers: {
        origin: "https://www.thrundesigns.com",
        "x-forwarded-for": ip,
      },
      body: form,
    },
  );
}

test("JSON-LD rejects HTML breakout while retaining the original JSON value", () => {
  const data = { title: '</script><script>alert("marker")</script>' };
  const serialized = serializeJsonLd(data);
  assert.equal(serialized.includes("<"), false);
  assert.deepEqual(JSON.parse(serialized), data);
});
test("quote store requires a dedicated token and never uses the public media token", () => {
  for (const env of [{}, {BLOB_READ_WRITE_TOKEN: "public"}, {QUOTE_READ_WRITE_TOKEN: "same", BLOB_READ_WRITE_TOKEN: "same"}]) {
    assert.throws(() => quoteStoreConfig(env));
  }
  assert.deepEqual(quoteStoreConfig({QUOTE_READ_WRITE_TOKEN: "private"}), {token: "private", access: "private"});
});
test("production quote intake fails closed without shared limits/private storage", async () => {
  localLimits();
  Object.assign(process.env, { NODE_ENV: "production" });
  const form = new FormData();
  form.set("name", "Test");
  const response = await submit(
    new Request("https://www.thrundesigns.com/api/quote", {
      method: "POST",
      headers: { origin: "https://www.thrundesigns.com" },
      body: form,
    }),
  );
  assert.equal(response.status, 503);
});
test("bounded reader stops an oversized body without Content-Length", async () => {
  let canceled = false;
  const body = new ReadableStream({
    pull(controller) {
      controller.enqueue(new Uint8Array(64));
    },
    cancel() {
      canceled = true;
    },
  });
  const request = new Request("https://example.test", {
    method: "POST",
    body,
    duplex: "half",
  } as RequestInit);
  await assert.rejects(
    readBoundedFormData(request, 128),
    (e: unknown) => e instanceof RequestBodyError && e.status === 413,
  );
  assert.equal(canceled, true);
});
test("bounded reader preserves normal multipart fields", async () => {
  const form = new FormData();
  form.set("name", "Example");
  assert.equal(
    (
      await readBoundedFormData(
        new Request("https://example.test", { method: "POST", body: form }),
        1024,
      )
    ).get("name"),
    "Example",
  );
});
test("attachment allowlist rejects MIME/extension conflicts and fake content", async () => {
  for (const file of [
    new File(["<html>example</html>"], "brief.pdf", { type: "text/html" }),
    new File(["not a PNG"], "brief.png", { type: "image/png" }),
    new File(["%PDF-1.7\nnot a PDF"], "brief.pdf", { type: "application/pdf" }),
    new File(["x"], "brief.exe", { type: "image/png" }),
  ]) {
    assert.equal((await validateAttachments([file])).ok, false);
  }
});
test("valid image attachments are decoded and re-encoded", async () => {
  const png = await sharp({
    create: { width: 2, height: 2, channels: 3, background: "red" },
  })
    .png()
    .toBuffer();
  const result = await validateAttachments([
    new File(
      [new Uint8Array(Buffer.concat([png, Buffer.from("trailing-marker")]))],
      "image.png",
      { type: "image/png" },
    ),
  ]);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.files[0].type, "image/png");
    assert.equal(
      Buffer.from(await result.files[0].arrayBuffer()).includes(
        Buffer.from("trailing-marker"),
      ),
      false,
    );
  }
});
test("valid PDF and file-count limit", async () => {
  const pdf = await PDFDocument.create();
  pdf.addPage();
  const file = new File([new Uint8Array(await pdf.save())], "brief.pdf", {
    type: "application/pdf",
  });
  assert.equal((await validateAttachments([file])).ok, true);
  assert.equal((await validateAttachments(Array(6).fill(file))).ok, false);
});
test("only exact configured origins are accepted", () => {
  Object.assign(process.env, { NODE_ENV: "production" });
  const request = (origin: string) =>
    new Request("https://www.thrundesigns.com", { headers: { origin } });
  assert.equal(
    isAllowedQuoteOrigin(request("https://attacker-thrundesigns.vercel.app")),
    false,
  );
  assert.equal(
    isAllowedQuoteOrigin(request("http://www.thrundesigns.com")),
    false,
  );
  assert.equal(
    isAllowedQuoteOrigin(request("https://www.thrundesigns.com:444")),
    false,
  );
  assert.equal(
    isAllowedQuoteOrigin(request("https://www.thrundesigns.com")),
    true,
  );
});
test("a denied early limit never invokes the global limiter", async () => {
  let globalCalls = 0;
  const result = await runLimitChecks([
    { name: "ip", check: async () => ({ success: false }) },
    {
      name: "global",
      check: async () => {
        globalCalls++;
        return { success: true };
      },
    },
  ]);
  assert.equal(result.limiter, "ip");
  assert.equal(globalCalls, 0);
});
test("150 rejected repeats no longer exhaust a new visitor's global quota", async () => {
  localLimits();
  for (let i = 0; i < 150; i++)
    await enforceQuoteRateLimits({
      ip: "192.0.2.11",
      email: "repeat@example.invalid",
    });
  assert.equal(
    (
      await enforceQuoteRateLimits({
        ip: "192.0.2.12",
        email: "new@example.invalid",
      })
    ).success,
    true,
  );
});
test("production unlock fails closed without Redis", async () => {
  localLimits();
  Object.assign(process.env, { NODE_ENV: "production" });
  assert.equal(
    (await enforceAttachmentUnlockRateLimits("192.0.2.13")).unavailable,
    true,
  );
});
test("sixth wrong password is throttled by the real handler", async () => {
  localLimits();
  process.env.QUOTE_ATTACHMENT_SECRET = "operator-fixture-".repeat(3);
  for (let i = 0; i < 5; i++)
    assert.equal(
      (await unlock(unlockRequest("wrong", "192.0.2.14"))).status,
      303,
    );
  const response = await unlock(unlockRequest("wrong", "192.0.2.14"));
  assert.equal(response.status, 429);
  assert.ok(response.headers.get("retry-after"));
});
test("unlock uses 303, private cookies, and an independent operator secret", async () => {
  localLimits();
  const password = "independent-operator-fixture-".repeat(2);
  process.env.QUOTE_FORM_SECRET = "form-fixture-".repeat(4);
  delete process.env.QUOTE_ATTACHMENT_SECRET;
  assert.equal(getAttachmentSignSecret(), null);
  process.env.QUOTE_ATTACHMENT_SECRET = process.env.QUOTE_FORM_SECRET;
  assert.equal(getAttachmentSignSecret(), null);
  process.env.QUOTE_ATTACHMENT_SECRET = password;
  const response = await unlock(unlockRequest(password, "192.0.2.15"));
  assert.equal(response.status, 303);
  assert.match(response.headers.get("set-cookie") || "", /HttpOnly/i);
  const session = createAttachmentSessionCookie()!;
  assert.equal(
    verifyAttachmentSessionCookie(`${session.name}=${session.value}`),
    true,
  );
  assert.equal(
    verifyAttachmentSessionCookie(`${session.name}=${session.value}x`),
    false,
  );
});
test("failed persistence can release duplicate reservation for retry", async () => {
  localLimits();
  const input = {
    email: "retry@example.invalid",
    message: "fixture",
    projectType: "brand",
  };
  assert.equal(await isDuplicateSubmission(input), false);
  assert.equal(await isDuplicateSubmission(input), true);
  await releaseDuplicateSubmission(input);
  assert.equal(await isDuplicateSubmission(input), false);
});
