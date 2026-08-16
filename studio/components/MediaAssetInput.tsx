"use client";

import { useEffect } from "react";
import { unset, type ObjectInputProps } from "sanity";

type MediaAssetValue = {
  image?: {
    asset?: {
      _ref?: string;
    } | null;
  } | null;
  blobUrl?: string | null;
};

function assetRefFromValue(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const image = (value as MediaAssetValue).image;
  const ref = image?.asset?._ref;
  return typeof ref === "string" && ref.length > 0 ? ref : undefined;
}

/**
 * When a Sanity CDN image is present, clear blobUrl so Presentation and the
 * site stop serving a leftover site/Blob path after an upload or replace.
 */
export function MediaAssetInput(props: ObjectInputProps) {
  const { value, onChange, renderDefault, readOnly } = props;
  const assetRef = assetRefFromValue(value);
  const blobUrl =
    value && typeof value === "object"
      ? (value as MediaAssetValue).blobUrl
      : undefined;

  useEffect(() => {
    if (readOnly) return;
    if (assetRef && blobUrl) {
      onChange(unset(["blobUrl"]));
    }
  }, [assetRef, blobUrl, onChange, readOnly]);

  return renderDefault(props);
}
