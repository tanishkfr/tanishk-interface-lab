import {
  buildStateMap,
  formatDelay,
  formatDuration,
  shortUrl,
  summarizeRecording,
  type ACEvent,
  type Recording,
} from "@/lib/afterclick/schema";
import { evidenceLabel, mapConsequences, eventLabel, eventTone } from "@/lib/afterclick/view";

const WIDTH = 1680;
const MARGIN = 96;
const CONTENT = WIDTH - MARGIN * 2;

const COLORS = {
  ink: "#161813",
  paper: "#f3f1e8",
  paper2: "#e8e4d8",
  muted: "#60645a",
  faint: "#8a8d80",
  line: "rgba(22, 24, 19, 0.22)",
  acid: "#dce94b",
  coral: "#ef6649",
  amber: "#e2a23c",
  green: "#2f7a5c",
  bone: "#edeade",
};

type Ctx = CanvasRenderingContext2D;

function families(): { sans: string; mono: string } {
  if (typeof window === "undefined") {
    return { sans: "Arial, sans-serif", mono: "Consolas, monospace" };
  }
  const body = getComputedStyle(document.body).fontFamily;
  const rootStyle = getComputedStyle(document.documentElement);
  const mono =
    rootStyle.getPropertyValue("--lab-font-mono").trim() ||
    'ui-monospace, "Cascadia Mono", Consolas, monospace';
  return { sans: body || "Arial, sans-serif", mono };
}

function wrap(ctx: Ctx, text: string, maxWidth: number, maxLines = 3): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) break;
    } else {
      current = next;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (lines.length === maxLines) {
    let last = lines[maxLines - 1];
    while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 4) {
      last = last.slice(0, -1);
    }
    lines[maxLines - 1] = `${last}…`;
  }
  return lines;
}

function toneColor(tone: ReturnType<typeof eventTone>): string {
  if (tone === "error") return COLORS.coral;
  if (tone === "success") return COLORS.green;
  if (tone === "loading") return COLORS.amber;
  if (tone === "action") return COLORS.acid;
  if (tone === "navigation") return COLORS.ink;
  if (tone === "manual") return COLORS.paper;
  return COLORS.paper2;
}

function dashedRect(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  dashed: boolean,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  if (dashed) ctx.setLineDash([5, 4]);
  ctx.strokeRect(x + 0.5, y + 0.5, w, h);
  ctx.restore();
}

function annotationText(recording: Recording, eventId: string): string[] {
  return recording.annotations
    .filter((annotation) => annotation.eventId === eventId)
    .map((annotation) => annotation.text);
}

export async function renderReportCanvas(recording: Recording): Promise<HTMLCanvasElement> {
  if (typeof document !== "undefined") {
    await document.fonts.ready;
  }
  const { sans, mono } = families();
  const map = buildStateMap(recording);
  const summary = summarizeRecording(recording);
  const groups = map.groups.slice(0, 9);
  const groupHeights = groups.map((group) => {
    if (!group.consequences.length) return 92;
    const visible = mapConsequences(group, 4).visible.length;
    return 60 + Math.max(1, visible) * 38;
  });
  const mapHeight = groupHeights.reduce((total, height) => total + height + 18, 0);
  const annotationEvents = recording.events
    .map((event) => ({ event, notes: annotationText(recording, event.id) }))
    .filter((entry) => entry.notes.length);
  const annotationLines = annotationEvents.reduce(
    (total, entry) =>
      total +
      entry.notes.reduce(
        (lines, note) => lines + Math.max(1, Math.ceil(note.length / 105)),
        0,
      ) +
      36,
    0,
  );
  const height = Math.max(
    1520,
    560 + mapHeight + (annotationEvents.length ? 160 + annotationLines : 120) + 220,
  );

  const canvas = document.createElement("canvas");
  const scale = 2;
  canvas.width = WIDTH * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable in this browser.");
  ctx.scale(scale, scale);
  ctx.textBaseline = "top";

  ctx.fillStyle = COLORS.paper;
  ctx.fillRect(0, 0, WIDTH, height);

  // Header
  const headerHeight = 314;
  ctx.fillStyle = COLORS.ink;
  ctx.fillRect(0, 0, WIDTH, headerHeight);
  ctx.fillStyle = COLORS.acid;
  ctx.fillRect(MARGIN, 52, 10, headerHeight - 104);
  ctx.fillStyle = COLORS.bone;
  ctx.font = `900 72px ${sans}`;
  ctx.fillText("AFTERCLICK", MARGIN + 40, 66);
  ctx.fillStyle = COLORS.acid;
  ctx.font = `500 14px ${mono}`;
  ctx.fillText("INTERACTION REPORT / v0.1.0", MARGIN + 42, 154);
  ctx.fillStyle = COLORS.bone;
  ctx.font = `600 30px ${sans}`;
  const titleLines = wrap(ctx, recording.title, CONTENT - 520, 2);
  titleLines.forEach((line, index) => ctx.fillText(line, MARGIN + 42, 190 + index * 34));
  ctx.fillStyle = "rgba(237, 234, 222, 0.66)";
  ctx.font = `400 13px ${mono}`;
  ctx.fillText(
    `${shortUrl(recording.source.url)}  ·  ${new Date(recording.startedAt).toLocaleString()}`,
    MARGIN + 42,
    266,
  );

  ctx.textAlign = "right";
  ctx.fillStyle = COLORS.bone;
  ctx.font = `600 18px ${mono}`;
  ctx.fillText(formatDuration(summary.durationMs), WIDTH - MARGIN, 76);
  ctx.fillStyle = "rgba(237, 234, 222, 0.56)";
  ctx.font = `400 11px ${mono}`;
  ctx.fillText("TOTAL WALL CLOCK", WIDTH - MARGIN, 103);
  ctx.fillText(
    `${recording.events.length} events · ${recording.annotations.length} annotations`,
    WIDTH - MARGIN,
    138,
  );
  ctx.textAlign = "left";

  // Summary strip
  let y = headerHeight + 34;
  ctx.strokeStyle = COLORS.line;
  ctx.lineWidth = 1;
  ctx.strokeRect(MARGIN, y, CONTENT, 92);
  const stats = [
    ["ACTIONS", String(summary.actions)],
    ["OBSERVED STATE EVENTS", String(summary.states)],
    ["ACTIONS WITH FEEDBACK", `${summary.observedFeedback} / ${summary.actions}`],
    ["NO OBSERVED CHANGE", String(summary.lostActions)],
    ["AVG. FIRST CHANGE", summary.firstFeedbackMs === null ? "—" : formatDelay(summary.firstFeedbackMs)],
  ];
  stats.forEach(([label, value], index) => {
    const x = MARGIN + 22 + index * (CONTENT / stats.length);
    if (index > 0) {
      ctx.strokeStyle = COLORS.line;
      ctx.beginPath();
      ctx.moveTo(x - 18, y + 18);
      ctx.lineTo(x - 18, y + 74);
      ctx.stroke();
    }
    ctx.fillStyle = COLORS.muted;
    ctx.font = `500 10px ${mono}`;
    ctx.fillText(label, x, y + 18);
    ctx.fillStyle = COLORS.ink;
    ctx.font = `700 27px ${sans}`;
    ctx.fillText(value, x, y + 44);
  });

  // Map
  y += 132;
  ctx.fillStyle = COLORS.ink;
  ctx.font = `500 11px ${mono}`;
  ctx.fillText("01 / CONSEQUENCE MAP", MARGIN, y);
  ctx.fillStyle = COLORS.muted;
  ctx.font = `400 13px ${sans}`;
  ctx.fillText(
    "Each action opens a measured observation window. Delay is time until the first observed interface change, not network latency.",
    MARGIN,
    y + 20,
  );
  y += 68;

  const timelineX = MARGIN + 336;
  const timelineWidth = CONTENT - 336 - 122;
  const window = recording.capture.observationWindowMs || 4000;

  groups.forEach((group, groupIndex) => {
    const rowHeight = groupHeights[groupIndex];
    ctx.strokeStyle = COLORS.line;
    ctx.beginPath();
    ctx.moveTo(MARGIN, y);
    ctx.lineTo(MARGIN + CONTENT, y);
    ctx.stroke();

    ctx.fillStyle = COLORS.ink;
    ctx.font = `600 12px ${mono}`;
    ctx.fillText(`A${String(groupIndex + 1).padStart(2, "0")}`, MARGIN, y + 16);
    ctx.fillStyle = COLORS.ink;
    ctx.font = `600 16px ${sans}`;
    const actionLines = wrap(ctx, group.action.title, 250, 2);
    actionLines.forEach((line, index) => ctx.fillText(line, MARGIN + 48, y + 14 + index * 18));
    ctx.fillStyle = COLORS.muted;
    ctx.font = `400 10px ${mono}`;
    ctx.fillText(
      `${formatDuration(group.action.t)} FROM START · ${group.consequences.length} STATE${group.consequences.length === 1 ? "" : "S"}`,
      MARGIN + 48,
      y + 14 + actionLines.length * 18 + 6,
    );

    const visible = mapConsequences(group, 4);
    if (!visible.visible.length) {
      const baseY = y + 52;
      ctx.save();
      ctx.strokeStyle = COLORS.coral;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(timelineX, baseY);
      ctx.lineTo(timelineX + timelineWidth, baseY);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = COLORS.coral;
      ctx.font = `600 11px ${mono}`;
      ctx.fillText(`NO OBSERVED DOM CHANGE · WATCHED ${Math.round(group.watchedMs / 100) / 10}s`, timelineX, baseY - 21);
      ctx.fillStyle = COLORS.muted;
      ctx.font = `400 10px ${mono}`;
      ctx.fillText("A measured absence, not proof that nothing happened.", timelineX, baseY + 9);
    } else {
      visible.visible.forEach((event, index) => {
        const chipY = y + 34 + index * 38;
        const delta = event.deltaMs ?? Math.max(0, event.t - group.action.t);
        const fraction = Math.max(0, Math.min(1, delta / window));
        const endX = timelineX + 152 + fraction * (timelineWidth - 200);
        ctx.strokeStyle = "rgba(22, 24, 19, 0.13)";
        ctx.beginPath();
        ctx.moveTo(timelineX, chipY + 14);
        ctx.lineTo(endX, chipY + 14);
        ctx.stroke();
        ctx.fillStyle = toneColor(eventTone(event));
        ctx.fillRect(timelineX + 152 - 1, chipY + 10, 8, 8);
        const chipX = endX + 2;
        const chipWidth = WIDTH - MARGIN - chipX;
        ctx.strokeStyle = event.evidence === "inferred" ? COLORS.coral : COLORS.ink;
        ctx.lineWidth = 1;
        if (event.evidence === "inferred") ctx.setLineDash([3, 3]);
        ctx.strokeRect(chipX, chipY + 1.5, chipWidth - 2, 26);
        ctx.setLineDash([]);
        ctx.fillStyle = COLORS.ink;
        ctx.font = `600 11px ${sans}`;
        const chipTitle = wrap(ctx, event.title, Math.max(100, chipWidth - 96), 1)[0];
        ctx.fillText(chipTitle, chipX + 9, chipY + 7);
        ctx.textAlign = "right";
        ctx.fillStyle = event.evidence === "inferred" ? COLORS.coral : COLORS.muted;
        ctx.font = `500 10px ${mono}`;
        ctx.fillText(formatDelay(delta), WIDTH - MARGIN - 8, chipY + 8);
        ctx.textAlign = "left";
      });
      if (visible.hidden) {
        ctx.fillStyle = COLORS.muted;
        ctx.font = `400 9px ${mono}`;
        ctx.fillText(
          `+${visible.hidden} more in the timeline`,
          timelineX + 164,
          y + 34 + visible.visible.length * 38 + 2,
        );
      }
    }
    y += rowHeight + 18;
  });

  // Annotations
  y += 30;
  ctx.fillStyle = COLORS.ink;
  ctx.font = `500 11px ${mono}`;
  ctx.fillText("02 / ANNOTATIONS", MARGIN, y);
  y += 30;
  if (!annotationEvents.length) {
    ctx.fillStyle = COLORS.muted;
    ctx.font = `400 14px ${sans}`;
    ctx.fillText("No annotations in this recording.", MARGIN, y);
    y += 50;
  } else {
    for (const { event, notes } of annotationEvents) {
      ctx.fillStyle = COLORS.ink;
      ctx.font = `600 13px ${sans}`;
      const notesLabel = `${formatDuration(event.t)} · ${event.title}`;
      ctx.fillText(wrap(ctx, notesLabel, CONTENT - 40, 1)[0], MARGIN, y);
      y += 20;
      for (const note of notes) {
        ctx.fillStyle = COLORS.muted;
        ctx.font = `400 12px ${sans}`;
        const noteLines = wrap(ctx, note, CONTENT - 60, 4);
        noteLines.forEach((line, index) => ctx.fillText(line, MARGIN + 18, y + index * 17));
        y += noteLines.length * 17 + 14;
      }
      y += 14;
    }
  }

  // Footer
  y = Math.max(y + 30, height - 190);
  ctx.strokeStyle = COLORS.line;
  ctx.beginPath();
  ctx.moveTo(MARGIN, y);
  ctx.lineTo(MARGIN + CONTENT, y);
  ctx.stroke();
  ctx.fillStyle = COLORS.ink;
  ctx.font = `500 10px ${mono}`;
  ctx.fillText("AFTERCLICK / INTERFACE FLIGHT RECORDER", MARGIN, y + 20);
  ctx.fillStyle = COLORS.muted;
  ctx.font = `400 11px ${sans}`;
  const footer = wrap(
    ctx,
    "Observed facts and inferred labels are marked separately. Delay is time until an observed DOM/ARIA change, not network or perceived latency. This report can contain page titles, paths, UI labels, and user-enabled feedback text. Review before sharing.",
    CONTENT,
    3,
  );
  footer.forEach((line, index) => ctx.fillText(line, MARGIN, y + 42 + index * 16));
  ctx.textAlign = "right";
  ctx.font = `400 10px ${mono}`;
  ctx.fillText(
    new Date().toISOString().slice(0, 10),
    MARGIN + CONTENT,
    y + 42,
  );
  ctx.textAlign = "left";

  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("The browser could not encode the PNG."));
    }, "image/png");
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function consequenceHtml(event: ACEvent, action: ACEvent): string {
  const delta = formatDelay(event.deltaMs ?? event.t - action.t);
  const changes = (event.changes ?? [])
    .map((change) => `<li>${escapeHtml(change.summary)}</li>`)
    .join("");
  const target = event.target?.label
    ? `<span class="target">${escapeHtml(event.target.label)}</span>`
    : "";
  return `<li class="consequence tone-${eventTone(event)}">
    <div class="consequence-head">
      <strong>${escapeHtml(event.title)}</strong>
      <span class="delay">${escapeHtml(delta)}</span>
    </div>
    <p class="meta"><span>${escapeHtml(eventLabel(event))}</span><span>${escapeHtml(evidenceLabel(event))}</span>${target}</p>
    ${changes ? `<ul class="changes">${changes}</ul>` : ""}
  </li>`;
}

export function buildHtmlReport(recording: Recording): string {
  const map = buildStateMap(recording);
  const summary = summarizeRecording(recording);
  const groups = map.groups
    .map((group, index) => {
      const visible = mapConsequences(group, 6);
      const consequences = visible.visible
        .map((event) => consequenceHtml(event, group.action))
        .join("");
      const hidden = visible.hidden
        ? `<p class="more">+${visible.hidden} more consequence${visible.hidden === 1 ? "" : "s"} in the event table below.</p>`
        : "";
      return `<article class="action-row">
        <div class="action">
          <span class="action-no">A${String(index + 1).padStart(2, "0")}</span>
          <h3>${escapeHtml(group.action.title)}</h3>
          <p>${escapeHtml(formatDuration(group.action.t))} from start · ${group.consequences.length} observed state${group.consequences.length === 1 ? "" : "s"}</p>
          <p class="window">${group.firstDelta === null ? `No observed change in ${Math.round(group.watchedMs / 100) / 10}s watched` : `First observed change ${escapeHtml(formatDelay(group.firstDelta))}`}</p>
        </div>
        <div class="consequences">
          ${consequences ? `<ul>${consequences}</ul>` : `<p class="lost">No observed DOM change during the ${Math.round(group.watchedMs / 100) / 10}s observation window. This is a measured absence, not proof that nothing happened.</p>`}
          ${hidden}
        </div>
      </article>`;
    })
    .join("");

  const annotations = recording.annotations.length
    ? recording.annotations
        .map((annotation) => {
          const event = recording.events.find((item) => item.id === annotation.eventId);
          return `<li><p class="note-meta">${escapeHtml(event?.title ?? "Event removed")} · ${escapeHtml(formatDuration(event?.t ?? 0))}</p><p>${escapeHtml(annotation.text)}</p></li>`;
        })
        .join("")
    : "<li><p>No annotations in this recording.</p></li>";

  const eventRows = recording.events
    .map((event) => {
      const action = event.afterActionId
        ? recording.events.find((item) => item.id === event.afterActionId)
        : null;
      const notes = recording.annotations
        .filter((annotation) => annotation.eventId === event.id)
        .map((annotation) => annotation.text)
        .join(" · ");
      return `<tr>
        <td class="num">${String(event.seq + 1).padStart(2, "0")}</td>
        <td class="num">${escapeHtml(formatDuration(event.t))}</td>
        <td>${escapeHtml(eventLabel(event))}</td>
        <td>${escapeHtml(event.title)}</td>
        <td>${escapeHtml(evidenceLabel(event))}</td>
        <td class="num">${action ? escapeHtml(`${action.title} (${formatDelay(event.deltaMs)})`) : "—"}</td>
        <td>${escapeHtml(notes || "—")}</td>
      </tr>`;
    })
    .join("");

  const title = escapeHtml(recording.title);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} — AFTERCLICK report</title>
<style>
  :root { color-scheme: light; --ink:#161813; --paper:#f3f1e8; --line:rgba(22,24,19,.2); --muted:#5f6359; --acid:#dce94b; --coral:#ef6649; --amber:#e2a23c; --green:#2f7a5c; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--paper); color:var(--ink); font:15px/1.55 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif; }
  .wrap { width:min(100% - 40px, 1160px); margin:0 auto; padding:32px 0 72px; }
  header { background:var(--ink); color:#edeade; padding:32px; display:flex; flex-wrap:wrap; justify-content:space-between; gap:24px; border-left:10px solid var(--acid); }
  .brand { font-size:clamp(34px,6vw,58px); font-weight:900; line-height:.9; letter-spacing:-.05em; margin:0; }
  .kicker,.mono { font-family:ui-monospace,"Cascadia Mono",Consolas,monospace; font-size:10px; letter-spacing:.1em; text-transform:uppercase; }
  .kicker { color:var(--acid); margin:0 0 12px; }
  header h2 { font-size:20px; font-weight:600; margin:0 0 4px; max-width:540px; }
  header p { margin:0; color:rgba(237,234,222,.64); font-size:12px; }
  .stats { display:grid; grid-template-columns:repeat(5,1fr); border:1px solid var(--line); margin:24px 0 36px; }
  .stat { padding:14px 16px; border-right:1px solid var(--line); }
  .stat:last-child { border-right:0; }
  .stat span { display:block; font-family:ui-monospace,Consolas,monospace; font-size:9px; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); }
  .stat strong { display:block; font-size:26px; line-height:1.1; margin-top:4px; }
  h3.section { font-family:ui-monospace,Consolas,monospace; font-size:10px; letter-spacing:.1em; text-transform:uppercase; border-top:2px solid var(--ink); padding-top:10px; margin:44px 0 20px; }
  .action-row { display:grid; grid-template-columns:260px 1fr; gap:28px; border-bottom:1px solid var(--line); padding:18px 0; break-inside:avoid; }
  .action-no { font-family:ui-monospace,Consolas,monospace; font-size:10px; color:var(--muted); }
  .action h3 { margin:4px 0 5px; font-size:19px; letter-spacing:-.02em; }
  .action p { margin:0; color:var(--muted); font-size:12px; }
  .action .window { margin-top:6px; color:var(--ink); font-weight:600; }
  .consequences ul { list-style:none; margin:0; padding:0; display:grid; gap:8px; }
  .consequence { border:1px solid var(--line); padding:10px 12px; background:#fbf9f2; }
  .consequence.tone-error { border-left:4px solid var(--coral); }
  .consequence.tone-success { border-left:4px solid var(--green); }
  .consequence.tone-loading { border-left:4px solid var(--amber); }
  .consequence.tone-action { border-left:4px solid var(--acid); }
  .consequence-head { display:flex; justify-content:space-between; gap:16px; align-items:baseline; }
  .consequence-head strong { font-size:13px; }
  .delay { font-family:ui-monospace,Consolas,monospace; font-size:11px; white-space:nowrap; }
  .meta { display:flex; flex-wrap:wrap; gap:4px 12px; margin:4px 0 0; color:var(--muted); font-family:ui-monospace,Consolas,monospace; font-size:9px; letter-spacing:.04em; text-transform:uppercase; }
  .changes { margin:6px 0 0; padding-left:16px; color:var(--muted); font-size:12px; }
  .lost { margin:0; padding:12px; border:1px dashed var(--coral); color:#7c3425; font-size:13px; }
  .more { margin:8px 0 0; font-family:ui-monospace,Consolas,monospace; font-size:9px; color:var(--muted); text-transform:uppercase; }
  ol.annotations { margin:0; padding:0; list-style:none; border-top:1px solid var(--line); }
  ol.annotations li { border-bottom:1px solid var(--line); padding:12px 0; break-inside:avoid; }
  ol.annotations p { margin:0; }
  .note-meta { font-family:ui-monospace,Consolas,monospace; font-size:9px; text-transform:uppercase; letter-spacing:.05em; color:var(--muted); margin-bottom:4px !important; }
  details { margin-top:28px; border-top:1px solid var(--line); padding-top:14px; }
  summary { cursor:pointer; font-family:ui-monospace,Consolas,monospace; font-size:10px; text-transform:uppercase; letter-spacing:.08em; }
  table { width:100%; border-collapse:collapse; margin-top:14px; font-size:11px; }
  th, td { text-align:left; border-bottom:1px solid var(--line); padding:7px 8px 7px 0; vertical-align:top; }
  th { font-family:ui-monospace,Consolas,monospace; font-size:8px; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); }
  td.num { font-family:ui-monospace,Consolas,monospace; font-size:9px; white-space:nowrap; }
  .privacy { border-left:4px solid var(--coral); background:#efe8dc; padding:14px 16px; margin-top:32px; font-size:12px; color:#4d4438; }
  footer { margin-top:40px; border-top:1px solid var(--line); padding-top:14px; display:flex; justify-content:space-between; gap:20px; flex-wrap:wrap; color:var(--muted); font-family:ui-monospace,Consolas,monospace; font-size:9px; letter-spacing:.05em; text-transform:uppercase; }
  @media (max-width:760px) { .stats{grid-template-columns:1fr 1fr} .stat:nth-child(2){border-right:0} .action-row{grid-template-columns:1fr;gap:10px} table{display:block;overflow-x:auto} }
  @media print { body{background:#fff} .wrap{width:100%;padding:0} header{background:#fff;color:#000;border-left-color:#000} }
</style>
</head>
<body>
<div class="wrap">
<header>
  <div><p class="kicker">AFTERCLICK / interaction report / v0.1.0</p><h1 class="brand">AFTERCLICK</h1><h2>${title}</h2><p>${escapeHtml(shortUrl(recording.source.url))} · ${escapeHtml(new Date(recording.startedAt).toLocaleString())}</p></div>
  <div><p class="kicker">Total wall clock</p><p style="font-family:ui-monospace,Consolas,monospace;font-size:26px;color:#edeade">${escapeHtml(formatDuration(summary.durationMs))}</p><p>${recording.events.length} events · ${recording.annotations.length} annotations</p></div>
</header>
<div class="stats">
  <div class="stat"><span>Actions</span><strong>${summary.actions}</strong></div>
  <div class="stat"><span>Observed states</span><strong>${summary.states}</strong></div>
  <div class="stat"><span>With feedback</span><strong>${summary.observedFeedback} / ${summary.actions}</strong></div>
  <div class="stat"><span>No observed change</span><strong>${summary.lostActions}</strong></div>
  <div class="stat"><span>Avg. first change</span><strong>${summary.firstFeedbackMs === null ? "—" : escapeHtml(formatDelay(summary.firstFeedbackMs))}</strong></div>
</div>
<h3 class="section">01 / Consequence map</h3>
${groups || `<p>No actions were captured.</p>`}
<h3 class="section">02 / Annotations</h3>
<ol class="annotations">${annotations}</ol>
<details>
  <summary>Full event table (${recording.events.length})</summary>
  <table>
    <thead><tr><th>#</th><th>Time</th><th>Kind</th><th>Event</th><th>Evidence</th><th>After action</th><th>Annotation</th></tr></thead>
    <tbody>${eventRows}</tbody>
  </table>
</details>
<div class="privacy"><strong>Review before sharing.</strong> This report contains the page path, page title, UI labels, event timing, annotations${recording.consent.textCollection ? ", and user-enabled feedback text" : ""}. It was generated locally in AFTERCLICK Studio and contains no remote resources.</div>
<footer><span>AFTERCLICK / what happened after you clicked?</span><span>${escapeHtml(new Date().toISOString().slice(0, 10))} · ${escapeHtml(shortUrl(recording.source.url))}</span></footer>
</div>
</body>
</html>`;
}
