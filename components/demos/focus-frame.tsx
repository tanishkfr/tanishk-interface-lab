"use client";

import { useEffect, useRef, useState } from "react";
import { FocusFrame } from "@/components/lab/focus-frame/focus-frame";
import type { DemoProps } from "./demo-host";
import "./focus-frame-demo.css";

const INITIAL = {
  name: "Loom & Field",
  email: "studio@loomandfield.co",
  description: "",
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function FocusFrameDemo({ values }: DemoProps) {
  const validateOn = String(values.validate ?? "blur") === "submit" ? "submit" : "blur";
  const simulateError = Boolean(values.simulateError);
  const [form, setForm] = useState(INITIAL);
  const [touched, setTouched] = useState({ name: false, email: false });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [banner, setBanner] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const errors = {
    name:
      form.name.trim().length === 0
        ? "A workspace name is required."
        : form.name.trim().length < 2
          ? "Use at least two characters."
          : form.name.trim().length > 60
            ? "Keep the name under 60 characters."
            : "",
    email: !form.email.trim()
      ? "An email is required for account recovery."
      : !EMAIL.test(form.email.trim())
        ? "Enter a complete email, for example name@studio.com."
        : "",
  };

  const showError = (field: "name" | "email") =>
    (touched[field] || submitted) && errors[field] ? errors[field] : "";

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSaved(false);
  };

  const blur = (field: "name" | "email") => {
    if (validateOn === "blur") setTouched((current) => ({ ...current, [field]: true }));
  };

  const save = () => {
    setSubmitted(true);
    setTouched({ name: true, email: true });
    if (errors.name || errors.email) {
      setBanner({ tone: "error", text: "Check the marked fields before saving." });
      return;
    }
    setSaving(true);
    setBanner(null);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      setSaving(false);
      if (simulateError) {
        setBanner({
          tone: "error",
          text: "The workspace could not be saved. Your text is still here.",
        });
      } else {
        setSaved(true);
        setBanner({ tone: "ok", text: "Workspace profile saved just now." });
      }
    }, 900);
  };

  const reset = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    setForm(INITIAL);
    setTouched({ name: false, email: false });
    setSubmitted(false);
    setSaving(false);
    setSaved(false);
    setBanner({ tone: "ok", text: "Form reset to the saved values." });
  };

  return (
    <div className="dm-ff-root">
      <div className="dm-ff-shell">
        <aside className="dm-ff-nav" aria-label="Settings sections">
          <p className="dm-ff-brand">Loom &amp; Field</p>
          <ul>
            <li><span aria-current="page">Workspace</span></li>
            <li><span>Members</span></li>
            <li><span>Billing</span></li>
            <li><span>Security</span></li>
          </ul>
          <p className="dm-ff-nav-note">A fictional studio account. Every field is local.</p>
        </aside>

        <main className="dm-ff-main">
          <header className="dm-ff-head">
            <p className="dm-ff-kicker">ACCOUNT / WORKSPACE</p>
            <h1>Workspace profile</h1>
            <p>
              These details appear on shared links and invoices. Field-level
              validation is real; the save action is simulated.
            </p>
          </header>

          {banner ? (
            <p
              className="dm-ff-banner"
              data-tone={banner.tone}
              role={banner.tone === "error" ? "alert" : "status"}
            >
              <span aria-hidden="true">{banner.tone === "error" ? "!" : "✓"}</span>
              {banner.text}
            </p>
          ) : null}

          <form
            className="dm-ff-form"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              save();
            }}
          >
            <FocusFrame
              label="Workspace name"
              name="workspace-name"
              value={form.name}
              onChange={(value) => update("name", value)}
              onBlur={() => blur("name")}
              hint="Shown to everyone with access."
              error={showError("name")}
              maxLength={60}
              required
              showCount
              autoComplete="organization"
            />

            <FocusFrame
              label="Contact email"
              name="contact-email"
              type="email"
              value={form.email}
              onChange={(value) => update("email", value)}
              onBlur={() => blur("email")}
              hint="Used for account recovery and billing notices."
              error={showError("email")}
              required
              autoComplete="email"
            />

            <FocusFrame
              label="Description"
              name="description"
              multiline
              rows={3}
              value={form.description}
              onChange={(value) => update("description", value)}
              placeholder="What does this workspace make?"
              hint="Optional. One or two sentences is plenty."
              maxLength={140}
              showCount
            />

            <div className="dm-ff-divider" aria-hidden="true" />

            <div className="dm-ff-static">
              <FocusFrame
                label="Workspace ID"
                value="ws_8f32a1c4"
                onChange={() => {}}
                hint="Used in support requests. This value cannot be edited."
                readOnly
                size="compact"
              />
              <FocusFrame
                label="Billing contact"
                value="accounts@loomandfield.co"
                onChange={() => {}}
                hint="Managed by the account owner."
                disabled
                size="compact"
              />
            </div>

            <div className="dm-ff-actions">
              <button type="submit" className="dm-ff-save" disabled={saving}>
                {saving ? (
                  <>
                    <span className="dm-ff-spinner" aria-hidden="true" />
                    Saving…
                  </>
                ) : (
                  "Save changes"
                )}
              </button>
              <button
                type="button"
                className="dm-ff-reset"
                onClick={reset}
                disabled={saving}
              >
                Reset
              </button>
              <span className="dm-ff-action-note" role="status">
                {saved ? "All changes are saved in this preview." : "Nothing has been sent."}
              </span>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
