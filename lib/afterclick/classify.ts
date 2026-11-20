/** Heuristics that turn observed UI text into a classification, not a fact. */

export type FeedbackType = "success" | "error" | "warning" | "loading" | "info";

const PATTERNS: Array<[FeedbackType, RegExp]> = [
  [
    "error",
    /\b(error|failed|failure|couldn['’]?t|could not|unable|invalid|try again|something went wrong|not saved|declined|denied|expired)\b/i,
  ],
  [
    "success",
    /\b(success|successful|saved|sent|complete|completed|confirmed|thanks|thank you|done|added|updated|created|submitted|order placed|payment received|on its way|receipt ready|download ready|invoice ready)\b/i,
  ],
  [ "warning", /\b(warning|careful|attention|expiring|expires soon|low stock|almost there)\b/i ],
  [
    "loading",
    /\b(loading|please wait|processing|saving|submitting|sending|working|one moment|just a moment)\b/i,
  ],
];

export function classifyFeedbackText(text: string | null | undefined): FeedbackType | null {
  if (!text) return null;
  const bounded = text.replace(/\s+/g, " ").slice(0, 400);
  for (const [type, pattern] of PATTERNS) {
    if (pattern.test(bounded)) return type;
  }
  return null;
}

const LOADING_PATTERN =
  /(loading|spinner|loader|skeleton|progress|busy|processing|please wait|submitting|saving)/i;

export function isLoadingDescriptor(text: string | null | undefined): boolean {
  return typeof text === "string" && LOADING_PATTERN.test(text);
}

const DIALOG_PATTERN = /(dialog|modal|drawer|sheet|alertdialog|alert-dialog|popover)/i;

export function isDialogDescriptor(text: string | null | undefined): boolean {
  return typeof text === "string" && DIALOG_PATTERN.test(text);
}

/** Shortcut labels only; printable characters are never collected. */
export function shortcutLabel(event: {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
}): string | null {
  const key = event.key;
  const modifier = event.ctrlKey || event.metaKey || event.altKey;
  if (!modifier && key !== "Escape") return null;
  if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) return null;
  const parts = [
    event.ctrlKey ? "Ctrl" : "",
    event.metaKey ? "Meta" : "",
    event.altKey ? "Alt" : "",
    event.shiftKey ? "Shift" : "",
    key.length === 1 ? key.toUpperCase() : key,
  ].filter(Boolean);
  return parts.join("+").slice(0, 40);
}

/** Reject obvious secrets in a UI label before it reaches storage. */
export function looksLikeSecret(text: string | null | undefined): boolean {
  if (!text) return false;
  return (
    /\b(password|passcode|one[- ]time code|otp|secret|token|api key)\b/i.test(text) ||
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text)
  );
}
