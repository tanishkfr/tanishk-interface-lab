"use client";

import { useState } from "react";
import { HoldToConfirm } from "@/components/lab/hold-to-confirm/hold-to-confirm";
import "./hold-to-confirm-demo.css";
import type { DemoProps } from "./demo-host";

/**
 * SAMPLE — a release console for a small product.
 *
 * Three consequential actions share one control: publish, deploy and
 * the snapshot overwrite that nobody should trigger by accident. The
 * status line records what actually happened, with a local clock.
 */

const ACTIONS = {
  publish: {
    tab: "Publish",
    label: "Publish release v2.4.0",
    detail: "Ships the current build to everyone on the stable channel.",
    log: "Release published",
  },
  deploy: {
    tab: "Deploy",
    label: "Deploy to production",
    detail: "Promotes the staging build and restarts the web tier.",
    log: "Deploy rolled out",
  },
  overwrite: {
    tab: "Overwrite",
    label: "Overwrite snapshot",
    detail: "Replaces the latest snapshot for this workspace. This cannot be undone.",
    log: "Snapshot overwritten",
  },
} as const;

type ActionKey = keyof typeof ACTIONS;
const ACTION_KEYS: ActionKey[] = ["publish", "deploy", "overwrite"];

function stamp() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HoldToConfirmDemo({ values }: DemoProps) {
  const preset = String(values.variant ?? "publish") as ActionKey;
  const duration = Number(values.duration ?? 900);
  const progress = String(values.fill ?? "fill") === "ring" ? "ring" : "fill";
  const reset = values.reset === undefined ? true : Boolean(values.reset);

  const [action, setAction] = useState<ActionKey>(preset);
  const [status, setStatus] = useState("Nothing has shipped yet.");

  const [lastPreset, setLastPreset] = useState(preset);
  if (preset !== lastPreset) {
    setLastPreset(preset);
    setAction(preset);
  }

  const entry = ACTIONS[action];

  const handleConfirm = () => {
    setStatus(`${entry.log} at ${stamp()}`);
  };

  return (
    <div className="dm-hc-root">
      <section className="dm-hc-console" aria-label="Release console">
        <header className="dm-hc-head">
          <div>
            <p className="dm-hc-eyebrow">Kestrel · release console</p>
            <h2 className="dm-hc-title">Ship release v2.4.0</h2>
          </div>
          <span className="dm-hc-version">v2.4.0</span>
        </header>

        <div className="dm-hc-facts">
          <span>7 changes since v2.3.1</span>
          <span aria-hidden="true">·</span>
          <span>Preflight checks green</span>
        </div>

        <div className="dm-hc-picker" role="group" aria-label="Choose an action">
          {ACTION_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className={`dm-hc-tab${key === action ? " dm-hc-tab--on" : ""}`}
              aria-pressed={key === action}
              onClick={() => setAction(key)}
            >
              {ACTIONS[key].tab}
            </button>
          ))}
        </div>

        <p className="dm-hc-detail">{entry.detail}</p>

        <div className="dm-hc-control">
          <HoldToConfirm
            key={action}
            label={entry.label}
            duration={duration}
            variant={action === "overwrite" ? "danger" : "accent"}
            progress={progress}
            resetAfterConfirm={reset}
            onConfirm={handleConfirm}
          />
        </div>

        <p className="dm-hc-status" role="status" aria-live="polite">
          <span className="dm-hc-status-dot" aria-hidden="true" />
          {status}
        </p>

        <p className="dm-hc-hint">
          Press and hold to commit — release early to cancel. Space works too.
        </p>
      </section>
    </div>
  );
}
