"use client";

import { useMemo, useState } from "react";
import { DemoHost } from "@/components/demos/demo-host";
import { ControlPanel } from "./control-panel";
import type { PreviewControl, PreviewValue } from "@/lib/registry/types";

/**
 * PREVIEW SANDBOX — the demo is the hero. A device frame, a live
 * component, and the two-to-four controls that genuinely matter.
 */
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
  const [values, setValues] = useState<Record<string, PreviewValue>>(defaults);
  const [device, setDevice] = useState<"desktop" | "mobile">(
    devices[0] ?? "desktop",
  );

  const dirty = useMemo(
    () => Object.keys(defaults).some((key) => values[key] !== defaults[key]),
    [values, defaults],
  );

  const setValue = (id: string, value: PreviewValue) => {
    setValues((current) => ({ ...current, [id]: value }));
  };

  return (
    <div className="preview-panel">
      <div className="preview-toolbar">
        <span className="preview-toolbar-title">
          <span className="preview-live-dot" aria-hidden="true" />
          Live preview
        </span>
        <div className="preview-toolbar-actions">
          {dirty ? (
            <button
              type="button"
              className="copy-btn"
              onClick={() => setValues(defaults)}
            >
              Reset
            </button>
          ) : null}
          {devices.length > 1 ? (
            <div className="device-switch" role="group" aria-label="Preview size">
              {devices.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={device === option}
                  onClick={() => setDevice(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="preview-workbench">
        <div className="preview-stage" data-device={device}>
          <div className="preview-stage-inner" id="demo-root">
            <DemoHost slug={slug} values={values} />
          </div>
        </div>
      </div>

      <ControlPanel
        controls={controls}
        values={values}
        onChange={setValue}
        hint={hint}
      />
    </div>
  );
}
