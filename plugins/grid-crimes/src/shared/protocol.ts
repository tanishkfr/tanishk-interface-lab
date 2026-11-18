import type { UIRequest, UIRequestType } from "./types.ts";
import { sanitizeOverrides, sanitizeSettings, validRole } from "./settings.ts";

const REQUEST_TYPES: UIRequestType[] = [
  "ready",
  "request-selection",
  "try-sample",
  "set-role",
  "generate",
  "generate-again",
  "regenerate",
  "remove-batch",
  "remove-variation",
  "focus-variation",
  "focus-batch",
  "focus-source",
  "toggle-lock",
  "crossbreed",
  "load-batch",
  "request-thumbnails",
  "help",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requireString(
  payload: Record<string, unknown>,
  key: string,
): string | null {
  const value = payload[key];
  return typeof value === "string" && value.length > 0 && value.length < 200
    ? value
    : null;
}

/**
 * Parse untrusted UI messages. Returns null for malformed or unknown input;
 * never throws into the Figma controller.
 */
export function parseUIRequest(raw: unknown): UIRequest | null {
  if (!isRecord(raw)) return null;
  const type = raw.type;
  if (typeof type !== "string" || !REQUEST_TYPES.includes(type as UIRequestType)) {
    return null;
  }
  const payload = isRecord(raw.payload) ? raw.payload : {};
  const typed = type as UIRequestType;
  switch (typed) {
    case "ready": {
      const width = Number(payload.width);
      const height = Number(payload.height);
      return {
        type: "ready",
        payload: {
          width: Number.isFinite(width) ? Math.max(0, Math.min(4000, width)) : 0,
          height: Number.isFinite(height) ? Math.max(0, Math.min(4000, height)) : 0,
        },
      };
    }
    case "request-selection":
    case "try-sample":
    case "focus-source":
    case "help":
      return { type: typed, payload: {} } as UIRequest;
    case "set-role": {
      const id = requireString(payload, "id");
      if (!id || !validRole(payload.role)) return null;
      return { type: "set-role", payload: { id, role: payload.role } };
    }
    case "generate": {
      if (!isRecord(payload.settings)) return null;
      return {
        type: "generate",
        payload: {
          settings: sanitizeSettings(payload.settings),
          roleOverrides: sanitizeOverrides(payload.roleOverrides),
        },
      };
    }
    case "generate-again": {
      if (!isRecord(payload.settings)) return null;
      return {
        type: "generate-again",
        payload: {
          settings: sanitizeSettings(payload.settings),
          roleOverrides: sanitizeOverrides(payload.roleOverrides),
        },
      };
    }
    case "regenerate": {
      const variationId = requireString(payload, "variationId");
      if (!variationId) return null;
      return {
        type: "regenerate",
        payload: {
          variationId,
          settings: sanitizeSettings(payload.settings),
          roleOverrides: sanitizeOverrides(payload.roleOverrides),
        },
      };
    }
    case "remove-batch": {
      const batchId = requireString(payload, "batchId");
      if (!batchId) return null;
      return { type: "remove-batch", payload: { batchId } };
    }
    case "remove-variation": {
      const variationId = requireString(payload, "variationId");
      if (!variationId) return null;
      return { type: "remove-variation", payload: { variationId } };
    }
    case "focus-variation": {
      const variationId = requireString(payload, "variationId");
      if (!variationId) return null;
      return { type: "focus-variation", payload: { variationId } };
    }
    case "focus-batch": {
      const batchId = requireString(payload, "batchId");
      if (!batchId) return null;
      return { type: "focus-batch", payload: { batchId } };
    }
    case "toggle-lock": {
      const variationId = requireString(payload, "variationId");
      if (!variationId || typeof payload.locked !== "boolean") return null;
      return {
        type: "toggle-lock",
        payload: { variationId, locked: payload.locked },
      };
    }
    case "crossbreed": {
      const parentA = requireString(payload, "parentA");
      const parentB = requireString(payload, "parentB");
      if (!parentA || !parentB) return null;
      const inheritance = Math.max(
        0,
        Math.min(100, Number(payload.inheritance) || 50),
      );
      return {
        type: "crossbreed",
        payload: {
          parentA,
          parentB,
          inheritance,
          settings: sanitizeSettings(payload.settings),
          roleOverrides: sanitizeOverrides(payload.roleOverrides),
        },
      };
    }
    case "load-batch": {
      const batchId = requireString(payload, "batchId");
      if (!batchId) return null;
      return { type: "load-batch", payload: { batchId } };
    }
    case "request-thumbnails": {
      const batchId = requireString(payload, "batchId");
      if (!batchId) return null;
      return { type: "request-thumbnails", payload: { batchId } };
    }
    default:
      return null;
  }
  return null;
}

export function postToMain<T>(type: string, payload: T, requestId?: string) {
  const message = { pluginMessage: { type, payload, requestId } };
  // The Figma iframe API only guarantees this shape.
  (window as unknown as { parent: { postMessage: typeof window.postMessage } })
    .parent.postMessage(message, "*");
}
