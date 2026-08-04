import { createHash, randomBytes } from "node:crypto";

const ID_PREFIX = "cc_";

/** Unguessable creation id: cc_ + 24 hex chars (96 bits). */
export function createCreationId(): string {
  return `${ID_PREFIX}${randomBytes(12).toString("hex")}`;
}

export function isValidCreationId(id: string): boolean {
  return /^cc_[a-f0-9]{24}$/.test(id);
}

export function hashCreationId(id: string): string {
  return createHash("sha256").update(id).digest("hex").slice(0, 16);
}
