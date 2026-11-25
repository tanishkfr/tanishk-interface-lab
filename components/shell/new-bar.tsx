"use client";
import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/playground/icons";
import { latestAnnouncement } from "@/lib/whats-new";

/**
 * The release strip above the masthead. It reads the newest batch from
 * lib/whats-new.ts, so the announcement maintains itself: one addition is
 * named, several added together are counted by kind.
 *
 * Dismissal lives in component state rather than storage: the layout stays
 * mounted across client navigation, so clearing it holds for the visit and a
 * full reload brings the announcement back. No flash, no storage, no shift.
 */
export function NewBar() {
  const [dismissed, setDismissed] = useState(false);
  if (!latestAnnouncement || dismissed) return null;
  const { name, version, note, href, cta } = latestAnnouncement;
  return (
    <aside className="lab-new-bar" aria-label="Just added">
      <div className="lab-new-bar-inner">
        <span className="lab-new-bar-tag">
          <span className="lab-new-bar-mark" aria-hidden="true" />
          Just added
        </span>
        <span className="lab-new-bar-rule" aria-hidden="true" />
        <Link className="lab-new-bar-link" href={href}>
          <span className="lab-new-bar-name">{name}</span>{" "}
          {version ? (
            <span className="lab-new-bar-version">{version}</span>
          ) : null}{" "}
          {note ? <span className="lab-new-bar-note">{note}</span> : null}{" "}
          <span className="lab-new-bar-cta">
            {cta} <Icon name="arrow" width="12" height="12" />
          </span>
        </Link>
        <button
          type="button"
          className="lab-new-bar-dismiss"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss this announcement"
        >
          <Icon name="close" width="14" height="14" />
        </button>
      </div>
    </aside>
  );
}
