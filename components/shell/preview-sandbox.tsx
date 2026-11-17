"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ControlPanel } from "./control-panel";
import { CopyButton } from "./copy-button";
import type { PreviewControl, PreviewValue } from "@/lib/registry/types";
export function PreviewSandbox({
  slug,
  controls,
  defaults,
  devices,
  hint,
}: {
  slug: string;
  controls: PreviewControl[];
  defaults: Record<string, PreviewValue>;
  devices: ("desktop" | "mobile")[];
  hint?: string;
}) {
  const [values, setValues] = useState(defaults),
    [device, setDevice] = useState<"desktop" | "mobile">(
      devices[0] ?? "desktop",
    ),
    [tab, setTab] = useState<"Preview" | "Configuration">("Preview");
  const frame = useRef<HTMLIFrameElement>(null),
    current = useRef(values);
  useEffect(() => {
    current.current = values;
    frame.current?.contentWindow?.postMessage(
      { type: "LAB_PREVIEW_CONFIG", slug, values },
      location.origin,
    );
  }, [values, slug]);
  useEffect(() => {
    function ready(e: MessageEvent) {
      if (
        e.origin === location.origin &&
        e.source === frame.current?.contentWindow &&
        e.data?.type === "LAB_PREVIEW_READY"
      )
        frame.current?.contentWindow?.postMessage(
          { type: "LAB_PREVIEW_CONFIG", slug, values: current.current },
          location.origin,
        );
    }
    window.addEventListener("message", ready);
    return () => window.removeEventListener("message", ready);
  }, [slug]);
  const dirty = useMemo(
    () => Object.keys(defaults).some((k) => values[k] !== defaults[k]),
    [values, defaults],
  );
  const code = JSON.stringify(values, null, 2);
  return (
    <section
      className="preview-panel"
      id="preview"
      aria-label="Interactive component workbench"
    >
      <div className="preview-toolbar">
        <div
          className="preview-tabs"
          role="tablist"
          aria-label="Workbench view"
        >
          {(["Preview", "Configuration"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              tabIndex={tab === t ? 0 : -1}
              aria-controls={`workbench-${t}`}
              id={`tab-${t}`}
              onClick={() => setTab(t)}
              onKeyDown={(e) => {
                if (
                  ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
                ) {
                  e.preventDefault();
                  const next =
                    e.key === "Home"
                      ? "Preview"
                      : e.key === "End"
                        ? "Configuration"
                        : tab === "Preview"
                          ? "Configuration"
                          : "Preview";
                  setTab(next);
                  document.getElementById(`tab-${next}`)?.focus();
                }
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="preview-toolbar-actions">
          {dirty && (
            <button className="copy-btn" onClick={() => setValues(defaults)}>
              Reset controls
            </button>
          )}
          {devices.length > 1 && (
            <div
              className="device-switch"
              role="group"
              aria-label="Preview size"
            >
              {devices.map((d) => (
                <button
                  key={d}
                  aria-pressed={device === d}
                  onClick={() => setDevice(d)}
                >
                  {d === "desktop" ? "Wide" : "Narrow"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div
        id="workbench-Preview"
        role="tabpanel"
        aria-labelledby="tab-Preview"
        hidden={tab !== "Preview"}
      >
        <div className="preview-workbench">
          <div className="preview-stage" data-device={device}>
            <iframe
              ref={frame}
              className="component-preview-frame"
              title={`${slug} interactive preview`}
              src={`/preview/${slug}`}
              onLoad={() =>
                frame.current?.contentWindow?.postMessage(
                  { type: "LAB_PREVIEW_CONFIG", slug, values: current.current },
                  location.origin,
                )
              }
            />
          </div>
        </div>
      </div>
      <div
        id="workbench-Configuration"
        className="preview-config"
        role="tabpanel"
        aria-labelledby="tab-Configuration"
        hidden={tab !== "Configuration"}
      >
        <div>
          <h2>Your preview settings</h2>
          <CopyButton
            text={code}
            label="Copy settings"
            title="preview settings"
          />
        </div>
        <pre tabIndex={0}>
          <code>{code}</code>
        </pre>
        <p>
          These are the exact settings driving this demo, including sample
          content and simulated states. For the installable component’s public
          API, see <a href="#usage-heading">Usage</a> and{" "}
          <a href="#props-heading">Props</a> below.
        </p>
      </div>
      <ControlPanel
        controls={controls}
        values={values}
        onChange={(id, value) => setValues((v) => ({ ...v, [id]: value }))}
        hint={hint}
      />
      <p className="preview-size-note">
        A real browser viewport. Scroll within the preview when the sample needs
        more space. Configuration stays in sync between sizes.
      </p>
    </section>
  );
}
