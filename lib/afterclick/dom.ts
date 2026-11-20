import {
  isSensitiveInputType,
  redactText,
  safeTarget,
  type TargetInfo,
} from "./schema.ts";
import { isDialogDescriptor, isLoadingDescriptor, looksLikeSecret } from "./classify.ts";

const INTERACTIVE =
  "a,button,input,select,textarea,summary,label,[role='button'],[role='link'],[role='tab'],[role='menuitem'],[role='menuitemcheckbox'],[role='menuitemradio'],[role='switch'],[role='checkbox'],[role='radio'],[role='option'],[role='combobox'],[role='textbox'],[onclick]";

export function isInteractive(element: Element | null): element is Element {
  return Boolean(element?.closest?.(INTERACTIVE));
}

export function isVisible(element: Element | null): boolean {
  if (!element) return false;
  if (!(element instanceof Element)) return false;
  if (element.hasAttribute("hidden")) return false;
  const rects = element.getClientRects();
  if (rects.length > 0) return true;
  const style = window.getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
}

function safeId(element: Element): string {
  const id = element.getAttribute("id");
  if (!id || id.length > 48) return "";
  if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(id)) return "";
  if (looksLikeSecret(id) || /\d{6,}/.test(id)) return "";
  return id;
}

/** A short structural path. No user-entered attributes, text, or classes. */
export function stableSelector(element: Element): string {
  const parts: string[] = [];
  let node: Element | null = element;
  let depth = 0;
  while (node && depth < 4 && node !== document.body) {
    const current: Element = node;
    const id = safeId(current);
    if (id) {
      parts.unshift(`#${id}`);
      break;
    }
    const tag = current.tagName.toLowerCase();
    const parent = current.parentElement;
    if (!parent) {
      parts.unshift(tag);
      break;
    }
    const sameTag = Array.from(parent.children).filter(
      (child: Element) => child.tagName === current.tagName,
    );
    const index = sameTag.indexOf(current) + 1;
    parts.unshift(sameTag.length > 1 ? `${tag}:nth-of-type(${index})` : tag);
    node = parent;
    depth += 1;
  }
  return parts.join(" > ").slice(0, 140);
}

export function accessibleLabel(element: Element | null): string {
  if (!element) return "";
  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy) {
    const labels = labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent ?? "")
      .join(" ");
    const clean = redactText(labels, 80);
    if (clean) return clean;
  }
  const aria = element.getAttribute("aria-label");
  if (aria) return redactText(aria, 80);
  const alt = element.getAttribute("alt");
  if (alt) return redactText(alt, 80);
  const title = element.getAttribute("title");
  if (title) return redactText(title, 80);
  const tag = element.tagName.toLowerCase();
  const formControl =
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement
      ? element
      : null;
  if (tag === "input") {
    const type = (element.getAttribute("type") || "text").toLowerCase();
    if (["button", "submit", "reset"].includes(type)) {
      return redactText((element as HTMLInputElement).value || type, 80);
    }
    const labelText = formControl?.labels?.[0]?.textContent ?? "";
    if (labelText.trim()) return redactText(labelText, 80);
    const placeholder = element.getAttribute("placeholder");
    return placeholder ? redactText(placeholder, 80) : "";
  }
  if (tag === "textarea" || tag === "select") {
    const labelText = formControl?.labels?.[0]?.textContent ?? "";
    return labelText.trim() ? redactText(labelText, 80) : "";
  }
  if (
    tag === "button" ||
    tag === "a" ||
    tag === "summary" ||
    tag === "label" ||
    /^(button|link|tab|menuitem|option|switch|checkbox|radio)$/.test(
      element.getAttribute("role") ?? "",
    )
  ) {
    return redactText((element.textContent ?? "").trim(), 80);
  }
  return "";
}

export function targetInfo(element: Element | null): TargetInfo | undefined {
  if (!element) return undefined;
  const tag = element.tagName.toLowerCase();
  const inputType =
    tag === "input" ? (element.getAttribute("type") || "text").toLowerCase() : undefined;
  const role = element.getAttribute("role") || undefined;
  const sensitive =
    isSensitiveInputType(inputType) ||
    element.getAttribute("autocomplete")?.toLowerCase().includes("password") === true ||
    element.getAttribute("data-afterclick-sensitive") !== null;
  const label = sensitive ? "[redacted]" : accessibleLabel(element);
  const disabled =
    element.hasAttribute("disabled") ||
    element.getAttribute("aria-disabled") === "true";
  return safeTarget({
    tag,
    role,
    inputType,
    label,
    selector: stableSelector(element),
    disabled,
    hidden: !isVisible(element),
    redacted: sensitive,
  });
}

export function normalizeText(value: string | null | undefined, max = 240): string {
  return redactText(value, max);
}

export function liveRegion(element: Element | null): boolean {
  if (!element) return false;
  const role = element.getAttribute("role");
  const live = element.getAttribute("aria-live");
  return (
    role === "alert" ||
    role === "status" ||
    role === "log" ||
    role === "alertdialog" ||
    (live !== null && live !== "off")
  );
}

export function feedbackRole(element: Element | null): string {
  if (!element) return "";
  return [element.getAttribute("role"), element.getAttribute("aria-live")]
    .filter(Boolean)
    .join(" ");
}

export function loadingSignature(element: Element | null): string {
  if (!element) return "";
  const bits = [
    element.getAttribute("role"),
    element.getAttribute("aria-label"),
    element.getAttribute("class"),
    element.getAttribute("id"),
    element.getAttribute("data-state"),
    element.getAttribute("data-loading"),
  ]
    .filter(Boolean)
    .join(" ");
  if (element.getAttribute("role") === "progressbar") return bits || "progressbar";
  if (element.getAttribute("aria-busy") === "true") return bits || "aria-busy";
  if (element.tagName.toLowerCase() === "progress") return bits || "progress";
  if (isLoadingDescriptor(bits)) return bits;
  return "";
}

export function dialogSignature(element: Element | null): string {
  if (!element) return "";
  const role = element.getAttribute("role");
  const tag = element.tagName.toLowerCase();
  if (tag === "dialog" || role === "dialog" || role === "alertdialog") {
    return [role || tag, element.getAttribute("aria-label")].filter(Boolean).join(" ");
  }
  if (isDialogDescriptor([element.getAttribute("class"), element.getAttribute("id")].join(" "))) {
    return [tag, element.getAttribute("class")].filter(Boolean).join(" ");
  }
  return "";
}

export function isDisabled(element: Element | null): boolean {
  if (!element) return false;
  return (
    element.hasAttribute("disabled") ||
    element.getAttribute("aria-disabled") === "true"
  );
}

export function visibleText(element: Element | null, max = 200): string {
  if (!element) return "";
  const tag = element.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return "";
  return normalizeText(element.textContent ?? "", max);
}
