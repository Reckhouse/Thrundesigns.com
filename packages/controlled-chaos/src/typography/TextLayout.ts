import type { PosterTypography } from "../serialization/posterCreation.schema";

export type LaidOutLine = {
  text: string;
  width: number;
};

export type TextLayoutResult = {
  lines: LaidOutLine[];
  displayText: string;
  lineCount: number;
};

export function applyCaseTransform(
  phrase: string,
  transform: PosterTypography["caseTransform"],
): string {
  if (transform === "uppercase") return phrase.toUpperCase();
  if (transform === "lowercase") return phrase.toLowerCase();
  return phrase;
}

/**
 * Split phrase into at most 5 lines and prepare for TextGeometry.
 * Manual newlines win; otherwise soft-wrap on spaces when estimated width exceeds maxWidth.
 */
export function layoutPhrase(
  typography: Pick<
    PosterTypography,
    "phrase" | "caseTransform" | "letterSpacing" | "maxWidth"
  >,
  estimateCharWidth = 0.085,
): TextLayoutResult {
  const displayText = applyCaseTransform(
    typography.phrase.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim(),
    typography.caseTransform,
  );

  const manual = displayText.split("\n").filter((line) => line.length > 0);
  const sourceLines =
    manual.length > 0 ? manual.slice(0, 5) : displayText ? [displayText] : [];

  const lines: LaidOutLine[] = [];
  for (const line of sourceLines) {
    const wrapped = softWrapLine(
      line,
      typography.maxWidth,
      typography.letterSpacing,
      estimateCharWidth,
    );
    for (const piece of wrapped) {
      if (lines.length >= 5) break;
      lines.push({
        text: piece,
        width: estimateLineWidth(piece, typography.letterSpacing, estimateCharWidth),
      });
    }
  }

  return {
    lines,
    displayText: lines.map((line) => line.text).join("\n"),
    lineCount: lines.length,
  };
}

function softWrapLine(
  line: string,
  maxWidth: number,
  letterSpacing: number,
  estimateCharWidth: number,
): string[] {
  if (estimateLineWidth(line, letterSpacing, estimateCharWidth) <= maxWidth) {
    return [line];
  }

  const words = line.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return [line.slice(0, 24)];

  const rows: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (
      estimateLineWidth(candidate, letterSpacing, estimateCharWidth) > maxWidth &&
      current
    ) {
      rows.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) rows.push(current);
  return rows.slice(0, 5);
}

function estimateLineWidth(
  text: string,
  letterSpacing: number,
  estimateCharWidth: number,
): number {
  if (!text) return 0;
  return (
    text.length * estimateCharWidth +
    Math.max(0, text.length - 1) * letterSpacing * estimateCharWidth
  );
}

export function lineOffsets(
  lineCount: number,
  lineHeight: number,
  size: number,
): number[] {
  if (lineCount <= 0) return [];
  const total = (lineCount - 1) * lineHeight * size;
  const start = total / 2;
  return Array.from({ length: lineCount }, (_, index) => start - index * lineHeight * size);
}
