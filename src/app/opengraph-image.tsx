import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Thrun Design Co. — brand & web design for growing businesses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Branded social card: studio name + service phrase on a deep mountain-toned field. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background:
            "linear-gradient(145deg, #0c0d0c 0%, #171816 48%, #1a1f1a 100%)",
          color: "#f4f1e9",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 22,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#d4af6a",
          }}
        >
          Thrun Design Co.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              fontSize: 72,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              maxWidth: 920,
            }}
          >
            Brand & web design for growing businesses
          </div>
          <div
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 24,
              letterSpacing: "0.08em",
              color: "#c7c2b8",
              textTransform: "uppercase",
            }}
          >
            Brand systems · Websites · Audits · Campaign assets
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
