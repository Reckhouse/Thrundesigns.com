import { useCallback, useState } from "react";
import { set, unset, type ArrayOfPrimitivesInputProps } from "sanity";
import { Button, Card, Flex, Stack, Text, TextInput } from "@sanity/ui";

function siteUrl(): string {
  return (
    process.env.SANITY_STUDIO_SITE_URL ||
    "https://thrundesigns-com.vercel.app"
  ).replace(/\/$/, "");
}

function filenameFromPathname(pathname: string): string {
  const base = pathname.split("/").pop() || pathname;
  return base.replace(/^[0-9]+-/, "");
}

function downloadPageUrl(pathname: string): string {
  const url = new URL("/quote-attachments", siteUrl());
  url.searchParams.set("pathname", pathname);
  return url.toString();
}

export function AttachmentPathnamesInput(props: ArrayOfPrimitivesInputProps) {
  const value = Array.isArray(props.value)
    ? props.value.filter((item): item is string => typeof item === "string")
    : [];
  const [pending, setPending] = useState("");

  const onChange = props.onChange;

  const addPath = useCallback(() => {
    const next = pending.trim();
    if (!next) return;
    onChange(set([...value, next]));
    setPending("");
  }, [onChange, pending, value]);

  const removeAt = useCallback(
    (index: number) => {
      const next = value.filter((_pathname: string, i: number) => i !== index);
      onChange(next.length ? set(next) : unset());
    },
    [onChange, value],
  );

  return (
    <Stack space={3}>
      {value.length === 0 ? (
        <Card padding={3} tone="transparent" border>
          <Text size={1} muted>
            No attachments on this submission.
          </Text>
        </Card>
      ) : (
        <Stack space={2}>
          {value.map((pathname: string, index: number) => (
            <Card key={`${pathname}-${index}`} padding={3} border radius={2}>
              <Flex align="center" justify="space-between" gap={3}>
                <Stack space={2} style={{ minWidth: 0, flex: 1 }}>
                  <Text size={1} weight="semibold">
                    {filenameFromPathname(pathname)}
                  </Text>
                  <Text size={0} muted style={{ wordBreak: "break-all" }}>
                    {pathname}
                  </Text>
                </Stack>
                <Flex gap={2}>
                  <Button
                    text="Download"
                    mode="ghost"
                    as="a"
                    href={downloadPageUrl(pathname)}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                  {!props.readOnly ? (
                    <Button
                      text="Remove"
                      mode="bleed"
                      tone="critical"
                      onClick={() => removeAt(index)}
                    />
                  ) : null}
                </Flex>
              </Flex>
            </Card>
          ))}
        </Stack>
      )}

      {!props.readOnly ? (
        <Flex gap={2}>
          <TextInput
            value={pending}
            placeholder="quotes/…"
            onChange={(event) => setPending(event.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <Button text="Add" mode="ghost" onClick={addPath} />
        </Flex>
      ) : null}

      <Text size={1} muted>
        Download opens the site unlock page. Enter{" "}
        <code>QUOTE_ATTACHMENT_SECRET</code> once per browser session — the
        secret is never stored in Studio.
      </Text>
    </Stack>
  );
}
