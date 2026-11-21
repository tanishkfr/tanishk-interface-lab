"use client";

import { useMemo, useState } from "react";
import {
  ContinuityTabs,
  type ContinuityTab,
} from "@/components/lab/continuity-tabs/continuity-tabs";
import type { DemoProps } from "./demo-host";
import "./continuity-tabs-demo.css";

const ACTIVITY = [
  { who: "Mira Chen", action: "moved Atlas brief to Review", when: "12 min ago", tone: "violet" },
  { who: "You", action: "changed the workspace icon", when: "48 min ago", tone: "ink" },
  { who: "Jon Bell", action: "invited 2 collaborators", when: "Yesterday", tone: "clay" },
  { who: "Ari Soto", action: "commented on Northstar grid", when: "Yesterday", tone: "moss" },
  { who: "You", action: "connected the archive drive", when: "Mon", tone: "ink" },
];

function Overview() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="dm-ct-panel">
      <div className="dm-ct-stats">
        <div>
          <span>Projects</span>
          <strong>14</strong>
          <small>3 in review</small>
        </div>
        <div>
          <span>Members</span>
          <strong>8</strong>
          <small>2 guests</small>
        </div>
        <div>
          <span>Storage</span>
          <strong>62%</strong>
          <small>124 GB of 200</small>
        </div>
      </div>
      <p className="dm-ct-lede">
        Northstar is the shared studio for the Harbor identity, the Atlas
        research programme, and everything that does not fit in either.
      </p>
      <div className="dm-ct-line">
        <span>Created 4 Feb 2021 · Owned by Tanishk</span>
        <button
          type="button"
          className="dm-ct-text-button"
          onClick={() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          }}
        >
          {copied ? "Link copied" : "Copy invite link"}
        </button>
      </div>
    </div>
  );
}

function Activity() {
  const [scope, setScope] = useState("all");
  const events = scope === "mine" ? ACTIVITY.filter((row) => row.who === "You") : ACTIVITY;
  return (
    <div className="dm-ct-panel">
      <div className="dm-ct-panel-head">
        <div>
          <h3>Recent activity</h3>
          <p>Everything that changed while you were away.</p>
        </div>
        <label className="dm-ct-select">
          <span className="sr-only">Activity scope</span>
          <select value={scope} onChange={(event) => setScope(event.target.value)}>
            <option value="all">All activity</option>
            <option value="mine">Only mine</option>
          </select>
        </label>
      </div>
      <ol className="dm-ct-feed">
        {events.map((row) => (
          <li key={`${row.who}-${row.action}`}>
            <span className="dm-ct-avatar" data-tone={row.tone}>
              {row.who === "You" ? "Y" : row.who.slice(0, 1)}
            </span>
            <p>
              <strong>{row.who}</strong> {row.action}
            </p>
            <time>{row.when}</time>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Preferences() {
  const [digest, setDigest] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [autosave, setAutosave] = useState(false);
  return (
    <div className="dm-ct-panel">
      <div className="dm-ct-panel-head">
        <div>
          <h3>Workspace preferences</h3>
          <p>Small defaults, applied to everyone in Northstar.</p>
        </div>
      </div>
      <div className="dm-ct-rows">
        {[
          {
            title: "Friday digest",
            body: "A short summary of the week, sent at 16:00.",
            on: digest,
            set: setDigest,
          },
          {
            title: "Mention alerts",
            body: "Notify me when a teammate writes my name.",
            on: mentions,
            set: setMentions,
          },
          {
            title: "Autosave versions",
            body: "Keep a restore point every ten minutes.",
            on: autosave,
            set: setAutosave,
          },
        ].map((row) => (
          <label className="dm-ct-toggle-row" key={row.title}>
            <span>
              <strong>{row.title}</strong>
              <small>{row.body}</small>
            </span>
            <input
              type="checkbox"
              checked={row.on}
              onChange={(event) => row.set(event.target.checked)}
            />
            <span className="dm-ct-switch" aria-hidden="true" />
          </label>
        ))}
      </div>
    </div>
  );
}

function Access() {
  const [members, setMembers] = useState([
    { name: "Tanishk R.", email: "tanishk@northstar.studio", role: "Owner", tone: "ink" },
    { name: "Mira Chen", email: "mira@northstar.studio", role: "Editor", tone: "violet" },
    { name: "Jon Bell", email: "jon@field-office.co", role: "Viewer", tone: "clay" },
  ]);
  return (
    <div className="dm-ct-panel">
      <div className="dm-ct-panel-head">
        <div>
          <h3>People with access</h3>
          <p>Guests can comment but cannot change shared settings.</p>
        </div>
        <span className="dm-ct-count">{members.length}</span>
      </div>
      <ul className="dm-ct-members">
        {members.map((member) => (
          <li key={member.email}>
            <span className="dm-ct-avatar" data-tone={member.tone}>
              {member.name.slice(0, 1)}
            </span>
            <span className="dm-ct-member-copy">
              <strong>{member.name}</strong>
              <small>{member.email}</small>
            </span>
            <select
              aria-label={`Role for ${member.name}`}
              value={member.role}
              onChange={(event) =>
                setMembers((rows) =>
                  rows.map((row) =>
                    row.email === member.email
                      ? { ...row, role: event.target.value }
                      : row,
                  ),
                )
              }
            >
              <option>Owner</option>
              <option>Editor</option>
              <option>Viewer</option>
            </select>
          </li>
        ))}
      </ul>
      <p className="dm-ct-foot">
        Role changes apply immediately in this preview. Nothing leaves the
        browser.
      </p>
    </div>
  );
}

export default function ContinuityTabsDemo({ values }: DemoProps) {
  const motion = String(values.motion ?? "spring") as
    | "spring"
    | "fade"
    | "none";
  const disableAccess = Boolean(values.disableAccess);
  const tabs = useMemo<ContinuityTab[]>(
    () => [
      { id: "overview", label: "Overview", content: <Overview /> },
      { id: "activity", label: "Activity", content: <Activity /> },
      { id: "preferences", label: "Preferences", content: <Preferences /> },
      {
        id: "access",
        label: "Access",
        content: <Access />,
        disabled: disableAccess,
      },
    ],
    [disableAccess],
  );

  return (
    <div className="dm-ct-root">
      <div className="dm-ct-shell">
        <header className="dm-ct-head">
          <div className="dm-ct-mark" aria-hidden="true">
            N
          </div>
          <div>
            <p>Northstar Studio · Workspace</p>
            <h2>Settings</h2>
          </div>
          <span className="dm-ct-badge">Private</span>
        </header>
        <ContinuityTabs
          tabs={tabs}
          defaultValue="overview"
          label="Workspace settings"
          motion={motion}
        />
        <p className="dm-ct-note">
          The selection surface and the panel height are measured from the live
          interface. Switch rapidly, or open Access after disabling it.
        </p>
      </div>
    </div>
  );
}
