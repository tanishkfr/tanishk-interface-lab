"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

  // src/shared/types.ts
  var GENERATOR_VERSION = "0.1.0";
  var META_KEY = "gridcrimes.meta";
  var ROLE_KEY = "gridcrimes.role";
  var BATCH_KEY = "gridcrimes.batch";
  var PRESET_IDS = [
    "brutalist",
    "swiss",
    "minimal",
    "maximal",
    "antigrid",
    "chaos"
  ];
  var ROLES = [
    "headline",
    "subhead",
    "body",
    "visual",
    "action",
    "label",
    "decoration",
    "module"
  ];

  // src/shared/presets.ts
  var LAB = {
    ink: "#23241f",
    paper: "#f3f1e8",
    acid: "#e5e94b",
    violet: "#5834d7",
    coral: "#ff795b",
    muted: "#62635a",
    white: "#fffdf5",
    night: "#161614"
  };
  var PRESETS = {
    brutalist: {
      id: "brutalist",
      index: "A",
      name: "BRUTALIST",
      philosophy: "Aggressive structure. No apologies.",
      description: "Monumental type, hard divisions and awkward, deliberate pressure.",
      defaults: { chaos: 74, density: 68, hierarchy: 92 },
      accent: LAB.acid,
      ink: LAB.ink,
      paper: LAB.paper,
      grammarIds: ["monument", "split", "stack", "stair"]
    },
    swiss: {
      id: "swiss",
      index: "B",
      name: "SWISS EDITORIAL",
      philosophy: "Precision with personality.",
      description: "A disciplined asymmetric column grid with editorial scale shifts.",
      defaults: { chaos: 18, density: 46, hierarchy: 72 },
      accent: LAB.violet,
      ink: LAB.ink,
      paper: LAB.paper,
      grammarIds: ["asymmetric-grid", "editorial-spread", "modular", "poster-column"]
    },
    minimal: {
      id: "minimal",
      index: "C",
      name: "RADICAL MINIMAL",
      philosophy: "As little as possible, as deliberately as possible.",
      description: "Negative space as material. One decisive focal point, quiet support.",
      defaults: { chaos: 20, density: 16, hierarchy: 64 },
      accent: LAB.violet,
      ink: LAB.ink,
      paper: LAB.white,
      grammarIds: ["focal-low", "horizon", "edge", "quiet-stack"]
    },
    maximal: {
      id: "maximal",
      index: "D",
      name: "MAXIMALIST",
      philosophy: "More, but with intention.",
      description: "Layered colour, compressed rhythm and a loud but legible focal hierarchy.",
      defaults: { chaos: 68, density: 88, hierarchy: 78 },
      accent: LAB.coral,
      ink: LAB.ink,
      paper: LAB.paper,
      grammarIds: ["collage", "spectacle", "type-wall", "layered-stack"]
    },
    antigrid: {
      id: "antigrid",
      index: "E",
      name: "ANTI-GRID",
      philosophy: "Rules are there to be broken.",
      description: "Coherent offsets, broken columns and tension produced by a system.",
      defaults: { chaos: 66, density: 44, hierarchy: 68 },
      accent: LAB.acid,
      ink: LAB.ink,
      paper: LAB.paper,
      grammarIds: ["broken-columns", "drift", "stagger", "orbit"]
    },
    chaos: {
      id: "chaos",
      index: "F",
      name: "CONTROLLED CHAOS",
      philosophy: "Surprise within a functioning system.",
      description: "Hybrid grammars, spatial fractures and unexpected focal points that still hold.",
      defaults: { chaos: 88, density: 60, hierarchy: 84 },
      accent: LAB.coral,
      ink: LAB.ink,
      paper: LAB.night,
      grammarIds: ["hybrid-split", "collision-field", "fracture", "anchor-field"]
    }
  };
  var PRESET_LIST = Object.values(PRESETS);
  var DEFAULT_SETTINGS = {
    preset: "brutalist",
    chaos: PRESETS.brutalist.defaults.chaos,
    density: PRESETS.brutalist.defaults.density,
    hierarchy: PRESETS.brutalist.defaults.hierarchy,
    seed: 2718,
    preserveColors: false,
    preserveTypography: true,
    allowOverlap: true,
    outputSize: "source"
  };
  var PRESET_GRAMMAR_NAMES = {
    monument: "Monument",
    split: "Hard split",
    stack: "Band stack",
    stair: "Stair tension",
    "asymmetric-grid": "Asymmetric grid",
    "editorial-spread": "Editorial spread",
    modular: "Modular field",
    "poster-column": "Poster column",
    "focal-low": "Low focal",
    horizon: "Horizon",
    edge: "Edge tension",
    "quiet-stack": "Quiet stack",
    collage: "Collage",
    spectacle: "Spectacle",
    "type-wall": "Type wall",
    "layered-stack": "Layered stack",
    "broken-columns": "Broken columns",
    drift: "Drift",
    stagger: "Stagger",
    orbit: "Orbit",
    "hybrid-split": "Hybrid split",
    "collision-field": "Collision field",
    fracture: "Fracture",
    "anchor-field": "Anchor field"
  };
  function presetName(id) {
    var _a, _b;
    return (_b = (_a = PRESETS[id]) == null ? void 0 : _a.name) != null ? _b : id.toUpperCase();
  }

  // src/shared/settings.ts
  function clampSetting(value, fallback) {
    const numeric = typeof value === "number" && Number.isFinite(value) ? Math.round(value) : fallback;
    return Math.max(0, Math.min(100, numeric));
  }
  function validSeed(value, fallback = DEFAULT_SETTINGS.seed) {
    const numeric = typeof value === "number" && Number.isFinite(value) ? Math.floor(value) : fallback;
    return Math.max(1, Math.min(9999999, numeric));
  }
  function validPreset(value) {
    return PRESET_IDS.includes(value) ? value : DEFAULT_SETTINGS.preset;
  }
  function validOutputSize(value) {
    return value === "source" || value === "square" || value === "portrait" || value === "landscape" ? value : "source";
  }
  function sanitizeSettings(input) {
    const source = input && typeof input === "object" ? input : {};
    const preset = validPreset(source.preset);
    const defaults = PRESETS[preset].defaults;
    return {
      preset,
      chaos: clampSetting(source.chaos, defaults.chaos),
      density: clampSetting(source.density, defaults.density),
      hierarchy: clampSetting(source.hierarchy, defaults.hierarchy),
      seed: validSeed(source.seed),
      preserveColors: source.preserveColors === true,
      preserveTypography: typeof source.preserveTypography === "boolean" ? source.preserveTypography : DEFAULT_SETTINGS.preserveTypography,
      allowOverlap: typeof source.allowOverlap === "boolean" ? source.allowOverlap : DEFAULT_SETTINGS.allowOverlap,
      outputSize: validOutputSize(source.outputSize)
    };
  }
  function validRole(value) {
    return typeof value === "string" && ROLES.includes(value);
  }
  function sanitizeOverrides(input) {
    if (!Array.isArray(input)) return [];
    const seen = /* @__PURE__ */ new Set();
    const result = [];
    for (const entry of input) {
      if (!entry || typeof entry !== "object") continue;
      const value = entry;
      if (typeof value.id !== "string" || !validRole(value.role)) continue;
      if (seen.has(value.id)) continue;
      seen.add(value.id);
      result.push({ id: value.id, role: value.role });
    }
    return result.slice(0, 100);
  }
  function applyRoleOverrides(snapshot, overrides) {
    if (!overrides.length) return snapshot;
    const map = new Map(overrides.map((entry) => [entry.id, entry.role]));
    const blocks = snapshot.blocks.map(
      (block) => map.has(block.id) ? __spreadProps(__spreadValues({}, block), { role: map.get(block.id) }) : block
    );
    const roleCounts = emptyRoleCounts();
    for (const block of blocks) roleCounts[block.role] += 1;
    return __spreadProps(__spreadValues({}, snapshot), { blocks, roleCounts });
  }
  function emptyRoleCounts() {
    return {
      headline: 0,
      subhead: 0,
      body: 0,
      visual: 0,
      action: 0,
      label: 0,
      decoration: 0,
      module: 0
    };
  }
  function outputDimensions(sourceWidth, sourceHeight, size) {
    const safeW = Math.max(64, Math.min(8192, Math.round(sourceWidth || 1200)));
    const safeH = Math.max(64, Math.min(8192, Math.round(sourceHeight || 800)));
    if (size === "source") return { width: safeW, height: safeH };
    const ratio = size === "square" ? 1 : size === "portrait" ? 4 / 5 : 16 / 9;
    const area2 = safeW * safeH;
    let width = Math.sqrt(area2 * ratio);
    let height = width / ratio;
    const long = Math.max(width, height);
    const cap = Math.max(960, Math.min(2400, Math.max(safeW, safeH)));
    if (long > cap) {
      const scale = cap / long;
      width *= scale;
      height *= scale;
    }
    const minLong = 640;
    if (long < minLong) {
      const scale = minLong / long;
      width *= scale;
      height *= scale;
    }
    return {
      width: Math.round(width),
      height: Math.round(height)
    };
  }

  // src/shared/meta.ts
  var META_VERSION = 1;
  function isRecord(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }
  function encodeMeta(meta) {
    return JSON.stringify(meta);
  }
  function decodeMeta(raw) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (!raw) return null;
    try {
      const value = JSON.parse(raw);
      if (!isRecord(value)) return null;
      if (value.v !== META_VERSION) return null;
      if (value.kind !== "variation") return null;
      if (typeof value.batchId !== "string") return null;
      if (typeof value.containerId !== "string") return null;
      if (typeof value.variationId !== "string") return null;
      if (typeof value.preset !== "string") return null;
      if (!PRESET_IDS.includes(value.preset)) return null;
      if (typeof value.sourceFingerprint !== "string") return null;
      if (!Array.isArray(value.sourceIds)) return null;
      if (!value.dna || typeof value.dna !== "object" || !isRecord(value.dna)) {
        return null;
      }
      return {
        v: 1,
        generator: String((_a = value.generator) != null ? _a : GENERATOR_VERSION),
        kind: "variation",
        batchId: value.batchId,
        containerId: value.containerId,
        variationId: value.variationId,
        index: Number(value.index) || 0,
        preset: value.preset,
        presetName: String(
          (_d = (_c = value.presetName) != null ? _c : (_b = PRESETS[value.preset]) == null ? void 0 : _b.name) != null ? _d : ""
        ),
        seed: Number(value.seed) || 1,
        settings: sanitizeSettings(value.settings),
        grammar: String((_e = value.grammar) != null ? _e : "unknown"),
        grammarName: String((_g = (_f = value.grammarName) != null ? _f : value.grammar) != null ? _g : "Unknown"),
        score: Number(value.score) || 0,
        sourceFingerprint: value.sourceFingerprint,
        sourceName: String((_h = value.sourceName) != null ? _h : ""),
        sourceIds: value.sourceIds.filter(
          (id) => typeof id === "string"
        ),
        dna: value.dna,
        createdAt: Number(value.createdAt) || 0,
        kept: value.kept === true,
        locked: value.locked === true,
        revision: Number(value.revision) || 0,
        crossbreed: isRecord(value.crossbreed) ? value.crossbreed : void 0
      };
    } catch (e) {
      return null;
    }
  }
  function makeVariationMeta(input) {
    return __spreadValues({
      v: 1,
      generator: GENERATOR_VERSION,
      kind: "variation"
    }, input);
  }
  function roleFromMeta(raw) {
    return validRole(raw) ? raw : null;
  }

  // src/shared/protocol.ts
  var REQUEST_TYPES = [
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
    "help"
  ];
  function isRecord2(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }
  function requireString(payload, key) {
    const value = payload[key];
    return typeof value === "string" && value.length > 0 && value.length < 200 ? value : null;
  }
  function parseUIRequest(raw) {
    if (!isRecord2(raw)) return null;
    const type = raw.type;
    if (typeof type !== "string" || !REQUEST_TYPES.includes(type)) {
      return null;
    }
    const payload = isRecord2(raw.payload) ? raw.payload : {};
    const typed = type;
    switch (typed) {
      case "ready": {
        const width = Number(payload.width);
        const height = Number(payload.height);
        return {
          type: "ready",
          payload: {
            width: Number.isFinite(width) ? Math.max(0, Math.min(4e3, width)) : 0,
            height: Number.isFinite(height) ? Math.max(0, Math.min(4e3, height)) : 0
          }
        };
      }
      case "request-selection":
      case "try-sample":
      case "focus-source":
      case "help":
        return { type: typed, payload: {} };
      case "set-role": {
        const id = requireString(payload, "id");
        if (!id || !validRole(payload.role)) return null;
        return { type: "set-role", payload: { id, role: payload.role } };
      }
      case "generate": {
        if (!isRecord2(payload.settings)) return null;
        return {
          type: "generate",
          payload: {
            settings: sanitizeSettings(payload.settings),
            roleOverrides: sanitizeOverrides(payload.roleOverrides)
          }
        };
      }
      case "generate-again": {
        if (!isRecord2(payload.settings)) return null;
        return {
          type: "generate-again",
          payload: {
            settings: sanitizeSettings(payload.settings),
            roleOverrides: sanitizeOverrides(payload.roleOverrides)
          }
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
            roleOverrides: sanitizeOverrides(payload.roleOverrides)
          }
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
          payload: { variationId, locked: payload.locked }
        };
      }
      case "crossbreed": {
        const parentA = requireString(payload, "parentA");
        const parentB = requireString(payload, "parentB");
        if (!parentA || !parentB) return null;
        const inheritance = Math.max(
          0,
          Math.min(100, Number(payload.inheritance) || 50)
        );
        return {
          type: "crossbreed",
          payload: {
            parentA,
            parentB,
            inheritance,
            settings: sanitizeSettings(payload.settings),
            roleOverrides: sanitizeOverrides(payload.roleOverrides)
          }
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

  // src/shared/random.ts
  function createRng(seed) {
    let a = seed >>> 0;
    return function next() {
      a |= 0;
      a = a + 1831565813 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function pick(rng, values) {
    return values[Math.min(values.length - 1, Math.floor(rng() * values.length))];
  }
  function chance(rng, probability) {
    return rng() < probability;
  }
  function hashString(input) {
    let hash = 2166136261;
    for (let i = 0; i < input.length; i += 1) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }
  function fingerprint(input) {
    return hashString(input).toString(36).padStart(7, "0");
  }
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  function lerp(a, b, t) {
    return a + (b - a) * clamp(t, 0, 1);
  }

  // src/engine/geometry.ts
  var round = (value, places = 2) => {
    const factor = 10 ** places;
    return Math.round(value * factor) / factor;
  };
  function area(r) {
    return Math.max(0, r.w) * Math.max(0, r.h);
  }
  function right(r) {
    return r.x + r.w;
  }
  function bottom(r) {
    return r.y + r.h;
  }
  function center(r) {
    return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
  }
  function inset(r, amount) {
    const dx = Math.min(amount, r.w / 2);
    const dy = Math.min(amount, r.h / 2);
    return { x: r.x + dx, y: r.y + dy, w: r.w - dx * 2, h: r.h - dy * 2 };
  }
  function intersection(a, b) {
    const x = Math.max(a.x, b.x);
    const y = Math.max(a.y, b.y);
    const w = Math.min(right(a), right(b)) - x;
    const h = Math.min(bottom(a), bottom(b)) - y;
    return { x, y, w: Math.max(0, w), h: Math.max(0, h) };
  }
  function overlapArea(a, b) {
    return area(intersection(a, b));
  }
  function overlapRatio(a, b) {
    const minArea = Math.max(1, Math.min(area(a), area(b)));
    return overlapArea(a, b) / minArea;
  }
  function splitRows(r, weights, gap = 0) {
    const total = weights.reduce((sum, n) => sum + Math.max(0, n), 0) || 1;
    const available = Math.max(0, r.h - gap * Math.max(0, weights.length - 1));
    let y = r.y;
    return weights.map((weight) => {
      const h = available * Math.max(0, weight) / total;
      const result = { x: r.x, y, w: r.w, h };
      y += h + gap;
      return result;
    });
  }
  function splitColumns(r, weights, gap = 0) {
    const total = weights.reduce((sum, n) => sum + Math.max(0, n), 0) || 1;
    const available = Math.max(0, r.w - gap * Math.max(0, weights.length - 1));
    let x = r.x;
    return weights.map((weight) => {
      const w = available * Math.max(0, weight) / total;
      const result = { x, y: r.y, w, h: r.h };
      x += w + gap;
      return result;
    });
  }
  function fitRect(slot, aspect, mode = "contain", align = "left", vertical = "top") {
    const safeAspect = Math.max(0.02, aspect || 1);
    const slotAspect = slot.w / Math.max(1, slot.h);
    let w = slot.w;
    let h = slot.h;
    if (mode === "contain") {
      if (slotAspect > safeAspect) w = slot.h * safeAspect;
      else h = slot.w / safeAspect;
    } else if (slotAspect > safeAspect) h = slot.w / safeAspect;
    else w = slot.h * safeAspect;
    const x = align === "left" ? slot.x : align === "right" ? slot.x + slot.w - w : slot.x + (slot.w - w) / 2;
    const y = vertical === "top" ? slot.y : vertical === "bottom" ? slot.y + slot.h - h : slot.y + (slot.h - h) / 2;
    return {
      rect: { x, y, w, h },
      scale: Math.max(0.01, Math.min(w / Math.max(1, slot.w), h / Math.max(1, slot.h))),
      mode
    };
  }
  function clampRectToFrame(r, frame, bleed = 0) {
    const minX = frame.x - bleed;
    const minY = frame.y - bleed;
    const maxX = frame.x + frame.w + bleed;
    const maxY = frame.y + frame.h + bleed;
    const w = Math.min(r.w, maxX - minX);
    const h = Math.min(r.h, maxY - minY);
    const x = clamp(r.x, minX, maxX - w);
    const y = clamp(r.y, minY, maxY - h);
    return { x, y, w, h };
  }
  function isInside(inner, outer, tolerance = 0.5) {
    return inner.x >= outer.x - tolerance && inner.y >= outer.y - tolerance && right(inner) <= right(outer) + tolerance && bottom(inner) <= bottom(outer) + tolerance;
  }
  function rotatedBounds(r, degrees) {
    const radians = Math.abs(degrees) * Math.PI / 180;
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    const w = r.w * c + r.h * s;
    const h = r.w * s + r.h * c;
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    return { x: cx - w / 2, y: cy - h / 2, w, h };
  }

  // src/shared/color.ts
  function normalizeHex(input) {
    if (!input) return null;
    const value = input.trim().toLowerCase();
    if (/^#[0-9a-f]{6}$/.test(value)) return value;
    if (/^#[0-9a-f]{3}$/.test(value)) {
      return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
    }
    return null;
  }
  function hexToRgb(hex) {
    var _a;
    const normalized = (_a = normalizeHex(hex)) != null ? _a : "#000000";
    return {
      r: parseInt(normalized.slice(1, 3), 16),
      g: parseInt(normalized.slice(3, 5), 16),
      b: parseInt(normalized.slice(5, 7), 16)
    };
  }
  function rgbToHex({ r, g, b }) {
    const clamp2 = (n) => Math.max(0, Math.min(255, Math.round(n)));
    return `#${[clamp2(r), clamp2(g), clamp2(b)].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
  }
  function figmaColorToHex(color) {
    return rgbToHex({ r: color.r * 255, g: color.g * 255, b: color.b * 255 });
  }
  function hexToFigmaColor(hex) {
    const { r, g, b } = hexToRgb(hex);
    return { r: r / 255, g: g / 255, b: b / 255 };
  }
  function relativeLuminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    const channel = (value) => {
      const v = value / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  }
  function contrastRatio(a, b) {
    const l1 = relativeLuminance(a);
    const l2 = relativeLuminance(b);
    const light = Math.max(l1, l2);
    const dark = Math.min(l1, l2);
    return (light + 0.05) / (dark + 0.05);
  }
  function readableOn(background, candidates) {
    var _a;
    let best = (_a = candidates[0]) != null ? _a : "#23241f";
    let bestRatio = -1;
    for (const candidate of candidates) {
      const ratio = contrastRatio(candidate, background);
      if (ratio > bestRatio) {
        best = candidate;
        bestRatio = ratio;
      }
    }
    return best;
  }
  function mixHex(a, b, t) {
    const amount = Math.max(0, Math.min(1, t));
    const ca = hexToRgb(a);
    const cb = hexToRgb(b);
    return rgbToHex({
      r: ca.r + (cb.r - ca.r) * amount,
      g: ca.g + (cb.g - ca.g) * amount,
      b: ca.b + (cb.b - ca.b) * amount
    });
  }
  function isNearWhite(hex) {
    return relativeLuminance(hex) > 0.82;
  }
  function isNearBlack(hex) {
    return relativeLuminance(hex) < 0.035;
  }
  function saturatedEnough(hex) {
    const { r, g, b } = hexToRgb(hex);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    return max - min > 36;
  }
  function uniquePalette(colors, limit = 8) {
    const result = [];
    for (const color of colors) {
      const normalized = normalizeHex(color);
      if (!normalized) continue;
      if (result.some((existing) => {
        const a = hexToRgb(existing);
        const b = hexToRgb(normalized);
        return Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b) < 18;
      })) {
        continue;
      }
      result.push(normalized);
      if (result.length >= limit) break;
    }
    return result;
  }

  // src/engine/style.ts
  var BASE = {
    brutalist: {
      margin: 0.05,
      columns: 6,
      gutter: 0.018,
      asymmetry: 0.3,
      rotation: 4,
      scaleContrast: 0.92,
      decorative: 0.55,
      occupancy: 0.72,
      alignment: "left",
      split: 0.58,
      backgroundMode: "paper",
      colorStrategy: "bold"
    },
    swiss: {
      margin: 0.085,
      columns: 12,
      gutter: 0.016,
      asymmetry: 0.26,
      rotation: 0.5,
      scaleContrast: 0.55,
      decorative: 0.22,
      occupancy: 0.5,
      alignment: "left",
      split: 0.56,
      backgroundMode: "paper",
      colorStrategy: "restrained"
    },
    minimal: {
      margin: 0.13,
      columns: 12,
      gutter: 0.024,
      asymmetry: -0.18,
      rotation: 0.2,
      scaleContrast: 0.7,
      decorative: 0.06,
      occupancy: 0.2,
      alignment: "mixed",
      split: 0.5,
      backgroundMode: "paper",
      colorStrategy: "mono"
    },
    maximal: {
      margin: 0.042,
      columns: 8,
      gutter: 0.012,
      asymmetry: 0.4,
      rotation: 7,
      scaleContrast: 0.85,
      decorative: 0.92,
      occupancy: 0.92,
      alignment: "mixed",
      split: 0.5,
      backgroundMode: "accent",
      colorStrategy: "layered"
    },
    antigrid: {
      margin: 0.065,
      columns: 7,
      gutter: 0.02,
      asymmetry: 0.55,
      rotation: 5,
      scaleContrast: 0.7,
      decorative: 0.45,
      occupancy: 0.62,
      alignment: "broken",
      split: 0.62,
      backgroundMode: "paper",
      colorStrategy: "bold"
    },
    chaos: {
      margin: 0.048,
      columns: 9,
      gutter: 0.014,
      asymmetry: 0.5,
      rotation: 11,
      scaleContrast: 0.96,
      decorative: 0.85,
      occupancy: 0.8,
      alignment: "mixed",
      split: 0.5,
      backgroundMode: "ink",
      colorStrategy: "layered"
    }
  };
  function deriveDna(preset, settings, rng) {
    const base = BASE[preset];
    const chaos = settings.chaos / 100;
    const density = settings.density / 100;
    const hierarchy = settings.hierarchy / 100;
    const margin = clamp(
      base.margin * lerp(1.5, 0.62, density) * (1 - chaos * 0.12),
      0.018,
      0.26
    );
    return {
      margin,
      columns: Math.max(
        3,
        Math.round(base.columns + (rng() > 0.5 ? 1 : -1) * chaos * 2)
      ),
      gutter: clamp(base.gutter * lerp(1.35, 0.72, density), 6e-3, 0.05),
      asymmetry: clamp(base.asymmetry + (chaos - 0.45) * 0.25, -0.8, 0.9),
      rotation: Math.min(16, base.rotation * (0.18 + chaos * 1.3)),
      scaleContrast: clamp(base.scaleContrast * 0.55 + hierarchy * 0.62, 0.2, 1),
      decorative: clamp(
        base.decorative * (0.55 + density * 0.65) * (0.7 + chaos * 0.5),
        0.02,
        1
      ),
      occupancy: clamp(base.occupancy * (0.78 + density * 0.34), 0.15, 0.96),
      alignment: base.alignment,
      split: clamp(base.split + (rng() - 0.5) * chaos * 0.12, 0.34, 0.7),
      backgroundMode: base.backgroundMode,
      colorStrategy: base.colorStrategy
    };
  }
  function sourceAccent(snapshot) {
    var _a;
    const candidates = snapshot.palette.filter(
      (color) => !isNearWhite(color) && !isNearBlack(color) && saturatedEnough(color)
    );
    return (_a = candidates[0]) != null ? _a : null;
  }
  function buildPalette(snapshot, preset, settings, dna, rng) {
    const fallbackAccent = {
      brutalist: LAB.acid,
      swiss: LAB.violet,
      minimal: LAB.violet,
      maximal: LAB.coral,
      antigrid: LAB.acid,
      chaos: LAB.coral
    };
    const foundAccent = sourceAccent(snapshot);
    const accent = !settings.preserveColors && chance(rng, 0.12) ? pick(rng, [LAB.acid, LAB.violet, LAB.coral]) : foundAccent && chance(rng, preset === "minimal" ? 0.25 : 0.45) ? foundAccent : fallbackAccent[preset];
    let background = snapshot.background || LAB.paper;
    if (!settings.preserveColors) {
      switch (dna.backgroundMode) {
        case "ink":
          background = chance(rng, 0.7) ? LAB.ink : LAB.night;
          break;
        case "accent":
          background = preset === "maximal" ? pick(rng, [LAB.ink, LAB.violet, mixHex(LAB.coral, LAB.ink, 0.12)]) : accent;
          break;
        case "source":
          background = snapshot.background || LAB.paper;
          break;
        default:
          background = preset === "minimal" ? LAB.white : preset === "brutalist" && chance(rng, 0.24) ? LAB.ink : LAB.paper;
      }
    }
    const ink = readableOn(background, [LAB.ink, LAB.paper, LAB.white]);
    const accentInk = readableOn(accent, [LAB.ink, LAB.paper, LAB.white]);
    const altCandidates = {
      brutalist: [LAB.coral, LAB.violet, LAB.acid],
      swiss: [LAB.violet, LAB.coral, LAB.acid],
      minimal: [LAB.violet, LAB.coral],
      maximal: [LAB.coral, LAB.violet, LAB.acid],
      antigrid: [LAB.violet, LAB.coral, LAB.acid],
      chaos: [LAB.acid, LAB.violet, LAB.coral]
    };
    const alt = pick(rng, altCandidates[preset]);
    const altInk = readableOn(alt, [LAB.ink, LAB.paper, LAB.white]);
    const block = preset === "maximal" || preset === "chaos" ? pick(rng, [LAB.acid, LAB.violet, LAB.coral, LAB.paper]) : preset === "minimal" ? mixHex(background, ink, 0.06) : pick(rng, [LAB.ink, accent, LAB.coral]);
    const blockInk = readableOn(block, [LAB.ink, LAB.paper, LAB.white]);
    const textOptions = [LAB.ink, LAB.paper, LAB.white].filter(
      (color) => contrastRatio(color, background) >= 3.6
    );
    const all = uniquePalette(
      [
        background,
        ink,
        accent,
        alt,
        block,
        ...snapshot.palette,
        ...textOptions
      ],
      9
    );
    return {
      background,
      ink,
      paper: LAB.paper,
      accent,
      accentInk,
      alt,
      altInk,
      block,
      blockInk,
      sourceAccent: foundAccent,
      all
    };
  }
  function textColorFor(background, palette, prefer = "ink") {
    const preferred = prefer === "paper" ? palette.paper : prefer === "accent" ? palette.accent : palette.ink;
    if (contrastRatio(preferred, background) >= 4.5) return preferred;
    return readableOn(background, [palette.ink, palette.paper, palette.accentInk]);
  }

  // src/engine/compose.ts
  function buildInventory(blocks) {
    var _a, _b, _c, _d;
    const reading = [...blocks].sort(
      (a, b) => a.bounds.y - b.bounds.y || a.bounds.x - b.bounds.x || a.name.localeCompare(b.name)
    );
    const byRole = {
      headline: [],
      subhead: [],
      body: [],
      visual: [],
      action: [],
      label: [],
      decoration: [],
      module: []
    };
    for (const block of blocks) byRole[block.role].push(block);
    const focal = (_d = (_c = (_b = (_a = [...byRole.headline].sort((a, b) => area(b.bounds) - area(a.bounds))[0]) != null ? _a : [...byRole.visual].sort((a, b) => area(b.bounds) - area(a.bounds))[0]) != null ? _b : [...byRole.subhead].sort((a, b) => area(b.bounds) - area(a.bounds))[0]) != null ? _c : [...blocks].sort((a, b) => area(b.bounds) - area(a.bounds))[0]) != null ? _d : null;
    return {
      all: blocks,
      reading,
      byRole,
      focal,
      visuals: byRole.visual,
      bodies: byRole.body,
      actions: byRole.action,
      labels: byRole.label,
      modules: byRole.module,
      decorations: byRole.decoration
    };
  }
  var Composer = class {
    constructor(snapshot, settings, dna, palette, rng, width, height) {
      this.placed = [];
      this.decorations = [];
      this.warnings = [];
      this.placedIds = /* @__PURE__ */ new Set();
      this.decorationCount = 0;
      this.snapshot = snapshot;
      this.settings = settings;
      this.dna = dna;
      this.palette = palette;
      this.rng = rng;
      this.width = width;
      this.height = height;
      this.frame = { x: 0, y: 0, w: width, h: height };
      this.marginPx = Math.round(dna.margin * Math.min(width, height));
      this.gutterPx = Math.round(dna.gutter * Math.min(width, height));
      this.scale = Math.min(
        width / Math.max(1, snapshot.width),
        height / Math.max(1, snapshot.height)
      );
      this.content = inset(this.frame, this.marginPx);
      this.inventory = buildInventory(snapshot.blocks);
    }
    get focal() {
      return this.inventory.focal;
    }
    get remaining() {
      return this.inventory.reading.filter((block) => !this.placedIds.has(block.id));
    }
    get hasHeadline() {
      return Boolean(this.inventory.byRole.headline[0]);
    }
    primary(limit = 3) {
      var _a;
      const inv = this.inventory;
      const result = [];
      const push = (block) => {
        if (block && !result.includes(block)) result.push(block);
      };
      push((_a = inv.focal) != null ? _a : void 0);
      push(inv.byRole.headline[1]);
      push(inv.visuals[0]);
      push(inv.byRole.subhead[0]);
      push(inv.actions[0]);
      push(inv.bodies[0]);
      return result.slice(0, limit);
    }
    mark(block) {
      this.placedIds.add(block.id);
    }
    isPlaced(block) {
      return this.placedIds.has(block.id);
    }
    place(block, slot, options = {}) {
      var _a, _b, _c, _d;
      const role = block.role;
      const fitMode = (_a = options.fit) != null ? _a : role === "visual" && (this.dna.colorStrategy === "layered" || this.dna.occupancy > 0.82) ? "fill" : "contain";
      let target;
      if (block.text) {
        target = {
          x: slot.x,
          y: slot.y,
          w: Math.max(8, slot.w),
          h: Math.max(8, slot.h)
        };
      } else if (role === "visual" && fitMode === "fill" && block.hasImage) {
        target = {
          x: slot.x,
          y: slot.y,
          w: Math.max(8, slot.w),
          h: Math.max(8, slot.h)
        };
      } else {
        const aspect = block.bounds.w / Math.max(1, block.bounds.h);
        const fitted = fitRect(
          slot,
          aspect,
          "contain",
          options.align === "RIGHT" ? "right" : options.align === "CENTER" ? "center" : "left",
          role === "visual" ? "center" : "top"
        );
        target = fitted.rect;
      }
      const rotation3 = this.safeRotation(block, (_b = options.rotation) != null ? _b : 0);
      const text = block.text ? this.makeTextPlan(block, target, options) : null;
      const backdrop = (_c = options.backdrop) != null ? _c : this.palette.background;
      const color = options.color !== void 0 ? options.color : block.text ? this.settings.preserveColors ? null : textColorFor(backdrop, this.palette, "ink") : this.colorForShape(block, backdrop);
      const z = (_d = options.z) != null ? _d : role === "visual" ? 8 : role === "module" ? 20 : block.text ? 30 : 24;
      const planned = {
        sourceId: block.id,
        role,
        name: block.name,
        rect: {
          x: round(target.x),
          y: round(target.y),
          w: round(target.w),
          h: round(target.h)
        },
        rotation: round(rotation3, 1),
        z,
        opacity: 1,
        color,
        text,
        underlay: role === "visual"
      };
      this.placedIds.add(block.id);
      this.placed.push(planned);
      return planned;
    }
    colorForShape(block, backdrop) {
      if (this.settings.preserveColors) return null;
      if (!block.canColorize || block.hasImage || block.hasVector) return null;
      if (block.role === "action" || block.role === "module") return null;
      if (block.role === "visual") {
        return this.dna.colorStrategy === "restrained" ? this.palette.block : this.palette.accent;
      }
      if (block.role === "decoration") return this.palette.alt;
      if (this.dna.colorStrategy === "layered") {
        return this.rng() > 0.5 ? this.palette.accent : this.palette.block;
      }
      return this.palette.block;
    }
    safeRotation(block, requested) {
      if (!block.canRotate || Math.abs(requested) < 0.05) return 0;
      const limit = block.text ? block.role === "headline" || block.role === "label" ? 3.5 : 0 : 8;
      return clamp(requested, -limit, limit);
    }
    makeTextPlan(block, target, options) {
      var _a, _b;
      const meta = block.text;
      const hierarchy = this.settings.hierarchy / 100;
      const role = block.role;
      const roleFactor = role === "headline" ? 1.15 + hierarchy * 1.45 : role === "subhead" ? 0.92 + hierarchy * 0.38 : role === "body" ? 1 - hierarchy * 0.12 : role === "action" ? 0.96 + hierarchy * 0.12 : role === "label" ? 0.95 - hierarchy * 0.18 : 1;
      const presetFactor = this.settings.preset === "brutalist" ? 1.18 : this.settings.preset === "maximal" ? 1.14 : this.settings.preset === "chaos" ? 1.16 : this.settings.preset === "minimal" ? 0.96 : 1;
      const jitter = 0.94 + this.rng() * 0.12;
      const base = Math.max(1, meta.fontSize || 16) * this.scale;
      const emphasis = roleFactor * presetFactor * jitter * ((_a = options.emphasis) != null ? _a : 1);
      let desired = clamp(base * emphasis, 6, 420);
      const length = Math.max(1, meta.length || meta.characters.length || 1);
      const maxChars = role === "headline" ? 16 : role === "subhead" ? 26 : role === "body" ? 58 : role === "label" ? 34 : 30;
      const estimatedLines = clamp(Math.ceil(length / maxChars), 1, role === "headline" ? 4 : 7);
      const averageGlyph = role === "headline" ? 0.56 : 0.51;
      const widthCap = target.w / Math.max(1, Math.min(length, maxChars) * averageGlyph);
      const multiplier = role === "headline" ? 0.94 : role === "body" ? 1.46 : role === "label" ? 1.22 : 1.12;
      const heightCap = target.h / Math.max(1, estimatedLines * multiplier);
      const minimum = role === "headline" ? 26 : role === "body" ? 9 : role === "label" ? 8 : 10;
      desired = clamp(
        Math.min(desired, Math.max(minimum, widthCap), Math.max(minimum, heightCap)),
        minimum,
        420
      );
      const align = (_b = options.align) != null ? _b : this.dna.alignment === "right" ? "RIGHT" : this.dna.alignment === "center" ? "CENTER" : this.dna.alignment === "broken" && this.rng() > 0.72 ? "RIGHT" : "LEFT";
      return {
        fontSize: Math.round(desired * 10) / 10,
        lineHeight: this.settings.preserveTypography ? null : role === "headline" ? 0.9 : role === "subhead" ? 1.02 : role === "label" ? 1.2 : 1.42,
        letterSpacing: this.settings.preserveTypography ? null : role === "headline" ? -0.028 : role === "label" ? 0.085 : role === "body" ? 0 : -0.01,
        align,
        emphasis: Math.round(emphasis * 100) / 100
      };
    }
    placeSupport(slot, options = {}) {
      var _a, _b;
      const blocks = this.remaining.filter(
        (block) => {
          var _a2;
          return block.id !== ((_a2 = this.focal) == null ? void 0 : _a2.id) || !this.isPlaced(block);
        }
      );
      if (!blocks.length) return [];
      const gap = (_a = options.gap) != null ? _a : this.gutterPx;
      if (options.direction === "row") {
        const weights = blocks.map((block) => {
          const roleWeight = block.role === "action" ? 0.8 : block.role === "body" ? 1.25 : block.role === "module" ? 1.2 : 0.9;
          return Math.max(0.35, block.areaShare * 9 + roleWeight);
        });
        const cells = splitColumns(slot, weights, gap);
        return blocks.map(
          (block, index) => this.place(block, cells[index], {
            z: options.z,
            align: options.align === "CENTER" ? "CENTER" : "LEFT",
            backdrop: this.palette.background,
            emphasis: options.emphasis,
            fit: options.fill === false ? "contain" : "contain"
          })
        );
      }
      if (options.direction === "column") {
        const weights = blocks.map((block) => {
          const roleWeight = block.role === "body" ? 1.6 : block.role === "action" ? 0.8 : block.role === "label" ? 0.55 : 1;
          return Math.max(0.4, roleWeight * (0.7 + block.areaShare * 3));
        });
        const cells = splitRows(slot, weights, gap);
        return blocks.map(
          (block, index) => this.place(block, cells[index], {
            z: options.z,
            align: options.align,
            backdrop: this.palette.background,
            emphasis: options.emphasis
          })
        );
      }
      const ratio = slot.w / Math.max(1, slot.h);
      const defaultCols = clamp(Math.round(Math.sqrt(blocks.length * ratio)), 1, 5);
      const cols = Math.max(1, Math.min(blocks.length, (_b = options.columns) != null ? _b : defaultCols));
      const rows = Math.ceil(blocks.length / cols);
      const cellW = (slot.w - gap * (cols - 1)) / cols;
      const cellH = (slot.h - gap * (rows - 1)) / rows;
      const result = [];
      blocks.forEach((block, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const cell = {
          x: slot.x + col * (cellW + gap),
          y: slot.y + row * (cellH + gap),
          w: cellW,
          h: cellH
        };
        result.push(
          this.place(block, cell, {
            z: options.z,
            align: options.align,
            backdrop: this.palette.background,
            emphasis: options.emphasis
          })
        );
      });
      return result;
    }
    supportBlockCount() {
      return this.remaining.length;
    }
    decor(kind, rect, color, options = {}) {
      var _a, _b, _c, _d;
      const decoration = {
        id: `d${++this.decorationCount}_${kind}`,
        kind,
        rect: {
          x: round(rect.x),
          y: round(rect.y),
          w: round(rect.w),
          h: round(rect.h)
        },
        color,
        rotation: round((_a = options.rotation) != null ? _a : 0, 1),
        z: (_b = options.z) != null ? _b : 4,
        opacity: (_c = options.opacity) != null ? _c : 1,
        label: options.label,
        backing: (_d = options.backing) != null ? _d : false
      };
      this.decorations.push(decoration);
      return decoration;
    }
    rule(orientation, position, options = {}) {
      var _a, _b, _c, _d, _e;
      const thickness = (_a = options.thickness) != null ? _a : Math.max(2, Math.round(Math.min(this.width, this.height) * 3e-3));
      const start = (_b = options.start) != null ? _b : orientation === "h" ? 0 : 0;
      const end = (_c = options.end) != null ? _c : orientation === "h" ? this.width : this.height;
      return this.decor(
        "rule",
        orientation === "h" ? { x: start, y: position - thickness / 2, w: end - start, h: thickness } : { x: position - thickness / 2, y: start, w: thickness, h: end - start },
        (_d = options.color) != null ? _d : this.palette.ink,
        { z: (_e = options.z) != null ? _e : 16 }
      );
    }
    indexLabel(text, x, y, color) {
      return this.decor(
        "index",
        { x, y, w: Math.max(48, Math.round(this.width * 0.08)), h: Math.round(this.height * 0.024) },
        color != null ? color : this.palette.ink,
        { label: text, z: 45, opacity: 0.82 }
      );
    }
    finish(meta, score = 0, scoreParts = {}) {
      const missing = this.remaining;
      if (missing.length) {
        this.warnings.push(
          `${missing.length} supporting element${missing.length === 1 ? " was" : "s were"} folded into the composition edge.`
        );
        const zone = {
          x: this.content.x,
          y: bottom(this.content) - Math.round(this.height * 0.09),
          w: this.content.w,
          h: Math.round(this.height * 0.09)
        };
        this.placeSupport(zone, { columns: Math.min(4, missing.length), z: 26, emphasis: 0.72 });
      }
      return {
        version: 1,
        preset: this.settings.preset,
        presetName: presetName(this.settings.preset),
        grammarId: meta.grammarId,
        grammarName: meta.grammarName || PRESET_GRAMMAR_NAMES[meta.grammarId] || meta.grammarId,
        seed: meta.seed,
        settings: __spreadValues({}, this.settings),
        width: this.width,
        height: this.height,
        background: this.palette.background,
        ink: this.palette.ink,
        accent: this.palette.accent,
        blocks: this.placed.sort((a, b) => a.z - b.z),
        decorations: this.decorations.sort((a, b) => a.z - b.z),
        dna: __spreadValues({}, this.dna),
        score,
        scoreParts,
        warnings: this.warnings,
        createdAt: 0
      };
    }
    bleed(rect, amount = 0) {
      return clampRectToFrame(rect, this.frame, amount);
    }
  };

  // src/engine/scoring/score.ts
  var TEXT_ROLES = /* @__PURE__ */ new Set(["headline", "subhead", "body", "action", "label"]);
  function blockBounds(block) {
    return block.rotation ? rotatedBounds(block.rect, block.rotation) : block.rect;
  }
  function countCharsPerLine(block) {
    if (!block.text) return null;
    const snapText = block.text;
    return block.rect.w / Math.max(1, snapText.fontSize * 0.52);
  }
  function weightOf(block) {
    switch (block.role) {
      case "headline":
        return 5;
      case "visual":
        return 3.5;
      case "subhead":
        return 2.5;
      case "action":
        return 2;
      case "body":
        return 1.5;
      case "module":
        return 1.4;
      case "label":
        return 1;
      default:
        return 0.5;
    }
  }
  function backedBy(plan, rect) {
    const textArea = Math.max(1, area(rect));
    return plan.decorations.some((decoration) => {
      if (!decoration.backing) return false;
      const overlap = Math.max(0, Math.min(right(rect), right(decoration.rect)) - Math.max(rect.x, decoration.rect.x)) * Math.max(0, Math.min(bottom(rect), bottom(decoration.rect)) - Math.max(rect.y, decoration.rect.y));
      return overlap / textArea >= 0.88;
    });
  }
  function backingColor(plan, rect) {
    var _a;
    const found = plan.decorations.find((decoration) => {
      if (!decoration.backing) return false;
      return decoration.rect.x <= rect.x + 2 && decoration.rect.y <= rect.y + 2 && right(decoration.rect) >= right(rect) - 2 && bottom(decoration.rect) >= bottom(rect) - 2;
    });
    return (_a = found == null ? void 0 : found.color) != null ? _a : null;
  }
  function scorePlan(plan, snapshot) {
    var _a, _b, _c, _d;
    const issues = [];
    const hard = [];
    const parts = {};
    const frame = { x: 0, y: 0, w: plan.width, h: plan.height };
    const texts = plan.blocks.filter((block) => TEXT_ROLES.has(block.role) && block.text);
    const visualBlocks = plan.blocks.filter((block) => block.role === "visual");
    const allContent = plan.blocks;
    let contained = 0;
    for (const block of allContent) {
      const bounds = blockBounds(block);
      if (block.text || block.role === "action" || block.role === "module") {
        const tolerance = block.text ? 3 : 10;
        if (isInside(bounds, frame, tolerance)) contained += 1;
        else {
          contained += 0.25;
          if (block.text) {
            hard.push(`${block.name} leaves the frame`);
          }
        }
      } else {
        const bleedW = Math.min(plan.width, plan.height) * 0.08;
        if (bounds.x >= -bleedW && bounds.y >= -bleedW && right(bounds) <= plan.width + bleedW && bottom(bounds) <= plan.height + bleedW) {
          contained += 1;
        } else {
          contained += 0.4;
        }
      }
    }
    parts.containment = allContent.length ? contained / allContent.length : 1;
    let collisions = 0;
    let collisionChecks = 0;
    for (let i = 0; i < texts.length; i += 1) {
      const a = texts[i];
      const aRect = blockBounds(a);
      for (let j = i + 1; j < texts.length; j += 1) {
        const b = texts[j];
        collisionChecks += 1;
        const ratio = overlapRatio(aRect, blockBounds(b));
        if (ratio > 0.02) {
          collisions += 1;
          hard.push(`Text collision: ${a.name} \xD7 ${b.name}`);
        }
      }
      for (const other of allContent) {
        if (other.sourceId === a.sourceId || other.text) continue;
        collisionChecks += 1;
        const ratio = overlapRatio(aRect, blockBounds(other));
        if (ratio > 0.04 && !backedBy(plan, aRect)) {
          collisions += 1;
          if (a.role !== "label" || ratio > 0.2) {
            hard.push(`Unbacked text overlap: ${a.name} over ${other.name}`);
          }
        } else if (ratio > 0.04 && backedBy(plan, aRect)) {
          collisions += 0.15;
        }
      }
      for (const decoration of plan.decorations) {
        if (decoration.z > ((_a = a.z) != null ? _a : 30) + 2 && decoration.opacity > 0.25 && !decoration.backing) {
          const ratio = overlapRatio(aRect, decoration.rect);
          if (ratio > 0.08) {
            collisions += 0.3;
            issues.push(`A foreground rule crosses ${a.name}`);
          }
        }
      }
    }
    parts.collisions = collisionChecks ? clamp(1 - collisions / Math.max(1, collisionChecks * 0.9), 0, 1) : 1;
    let legible = 0;
    let legibleChecks = 0;
    for (const block of texts) {
      legibleChecks += 1;
      const size = block.text.fontSize;
      const min = block.role === "headline" ? 18 : block.role === "body" ? 9 : 7.5;
      if (size >= min && block.rect.w >= 32 && block.rect.h >= 12) legible += 1;
      else {
        legible += 0.2;
        issues.push(`${block.name} is smaller than the readable minimum`);
        if (block.role === "body" || block.role === "action") {
          hard.push(`${block.name} is too small to read`);
        }
      }
      const lineHeight = (_b = block.text.lineHeight) != null ? _b : 1.25;
      if (block.rect.h < size * lineHeight * 0.82) {
        legible -= 0.25;
        issues.push(`${block.name} has more text than its box can hold`);
        if (block.role === "body" || block.role === "action") {
          hard.push(`${block.name} is squeezed into too little height`);
        }
      }
      const cpl = countCharsPerLine(block);
      if (cpl && cpl < 3 && (block.role === "body" || block.role === "headline")) {
        legible -= 0.2;
      }
    }
    parts.legibility = legibleChecks ? clamp(legible / legibleChecks, 0, 1) : 1;
    let contrastScore = 1;
    let contrastChecks = 0;
    for (const block of texts) {
      if (!block.color) continue;
      contrastChecks += 1;
      const backdrop = (_c = backingColor(plan, blockBounds(block))) != null ? _c : plan.background;
      const ratio = contrastRatio(block.color, backdrop);
      if (ratio >= 4.5) contrastScore += 0;
      else if (ratio >= 3) contrastScore -= 0.3;
      else {
        contrastScore -= 0.6;
        issues.push(`Low contrast on ${block.name}`);
        if (block.role === "body" || block.role === "action") {
          hard.push(`Unreadable contrast on ${block.name}`);
        }
      }
    }
    parts.contrast = clamp(contrastChecks ? contrastScore / contrastChecks : 1, 0, 1);
    const headline2 = plan.blocks.find((block) => block.role === "headline" && block.text);
    const bodySizes = plan.blocks.filter((block) => block.role === "body" && block.text).map((block) => block.text.fontSize).sort((a, b) => a - b);
    const medianBody = bodySizes.length ? bodySizes[Math.floor(bodySizes.length / 2)] : 14;
    const scaleRatio = (headline2 == null ? void 0 : headline2.text) ? headline2.text.fontSize / Math.max(1, medianBody) : 1;
    const targetRatio = 1.4 + plan.settings.hierarchy / 100 * 3;
    parts.hierarchy = clamp(1 - Math.abs(scaleRatio - targetRatio) / (targetRatio + 1.6), 0, 1);
    const covered = allContent.reduce((sum, block) => sum + area(blockBounds(block)), 0);
    const normalizedCoverage = covered / Math.max(1, plan.width * plan.height);
    const target = plan.dna.occupancy;
    parts.density = clamp(1 - Math.abs(normalizedCoverage - target) * 1.7, 0, 1);
    if (normalizedCoverage > 1.25) issues.push("The composition is overfilled");
    let weight = 0;
    let cx = 0;
    let cy = 0;
    for (const block of allContent) {
      const w = weightOf(block);
      const c = center(blockBounds(block));
      weight += w;
      cx += c.x * w;
      cy += c.y * w;
    }
    if (weight > 0) {
      const nx = cx / weight / plan.width;
      const ny = cy / weight / plan.height;
      const desiredX = 0.5 + plan.dna.asymmetry * 0.1;
      const balance = 1 - (Math.abs(nx - desiredX) * 0.9 + Math.abs(ny - 0.5) * 0.8);
      parts.balance = clamp(balance, 0, 1);
    } else parts.balance = 0;
    const sorted = [...allContent].sort((a, b) => blockBounds(a).y - blockBounds(b).y);
    const gaps = [];
    for (let i = 1; i < sorted.length; i += 1) {
      const previous = blockBounds(sorted[i - 1]);
      const current = blockBounds(sorted[i]);
      gaps.push(Math.max(0, current.y - bottom(previous)));
    }
    let rhythm = 1;
    if (gaps.length >= 3) {
      const mean = gaps.reduce((sum, n) => sum + n, 0) / gaps.length;
      const variance = gaps.reduce((sum, n) => sum + (n - mean) ** 2, 0) / gaps.length;
      const cv = Math.sqrt(variance) / Math.max(1, mean);
      const tolerance = plan.preset === "chaos" || plan.preset === "antigrid" ? 1.6 : 0.9;
      rhythm = clamp(1 - Math.max(0, cv - tolerance) * 0.5, 0, 1);
    }
    parts.rhythm = rhythm;
    let displacement = 0;
    let displacementChecks = 0;
    for (const planned of allContent) {
      const source = snapshot.blocks.find((block) => block.id === planned.sourceId);
      if (!source) continue;
      displacementChecks += 1;
      const sourceCx = (source.bounds.x + source.bounds.w / 2) / Math.max(1, snapshot.width);
      const sourceCy = (source.bounds.y + source.bounds.h / 2) / Math.max(1, snapshot.height);
      const c = center(blockBounds(planned));
      displacement += Math.hypot(c.x / plan.width - sourceCx, c.y / plan.height - sourceCy);
    }
    const averageDisplacement = displacementChecks ? displacement / displacementChecks : 0;
    parts.difference = clamp(averageDisplacement / 0.22, 0, 1);
    const rotations = allContent.filter((block) => Math.abs(block.rotation) > 1).length;
    const decorationCount = plan.decorations.length;
    const alignmentSpread = new Set(
      texts.map((block) => Math.round(block.rect.x / Math.max(1, plan.width * 0.02)))
    ).size;
    let fit = 0.5;
    switch (plan.preset) {
      case "brutalist":
        fit = 0.3 * clamp((scaleRatio - 1) / 2.5, 0, 1) + 0.25 * clamp(decorationCount / 8, 0, 1) + 0.25 * clamp(normalizedCoverage / 0.7, 0, 1) + 0.2 * clamp(rotations / 4, 0, 1);
        break;
      case "swiss":
        fit = 0.3 * clamp(1 - alignmentSpread / 12, 0, 1) + 0.25 * clamp((0.85 - normalizedCoverage) / 0.5, 0, 1) + 0.2 * clamp(scaleRatio / 3, 0, 1) + 0.25 * clamp(1 - rotations / 3, 0, 1);
        break;
      case "minimal":
        fit = 0.45 * clamp((0.5 - normalizedCoverage) / 0.4, 0, 1) + 0.25 * clamp(1 - decorationCount / 9, 0, 1) + 0.2 * clamp((scaleRatio - 1) / 2, 0, 1) + 0.1 * clamp(1 - rotations / 2, 0, 1);
        break;
      case "maximal":
        fit = 0.35 * clamp(normalizedCoverage / 0.9, 0, 1) + 0.3 * clamp(decorationCount / 10, 0, 1) + 0.2 * clamp(rotations / 5, 0, 1) + 0.15 * clamp(scaleRatio / 4, 0, 1);
        break;
      case "antigrid":
        fit = 0.3 * clamp((alignmentSpread - 2) / 6, 0, 1) + 0.25 * clamp(rotations / 4, 0, 1) + 0.2 * clamp(1 - Math.abs(normalizedCoverage - 0.5) / 0.5, 0, 1) + 0.25 * clamp(decorationCount / 9, 0, 1);
        break;
      case "chaos":
        fit = 0.25 * clamp(decorationCount / 10, 0, 1) + 0.2 * clamp(rotations / 5, 0, 1) + 0.25 * clamp(normalizedCoverage / 0.8, 0, 1) + 0.3 * clamp((alignmentSpread - 1) / 6, 0, 1);
        break;
    }
    parts.presetFit = clamp(fit, 0, 1);
    const headlineBlock = plan.blocks.find((block) => block.role === "headline");
    const bodyBlocks = plan.blocks.filter((block) => block.role === "body");
    let reading = 1;
    if (headlineBlock && bodyBlocks.length && plan.preset !== "antigrid" && plan.preset !== "chaos") {
      const hY = center(blockBounds(headlineBlock)).y;
      const bodyAbove = bodyBlocks.filter((block) => center(blockBounds(block)).y < hY - plan.height * 0.08);
      reading = clamp(1 - bodyAbove.length / bodyBlocks.length, 0, 1);
    }
    parts.readingOrder = reading;
    const weights = {
      containment: 0.17,
      collisions: 0.19,
      legibility: 0.12,
      contrast: 0.1,
      hierarchy: 0.12,
      density: 0.08,
      balance: 0.06,
      rhythm: 0.04,
      difference: 0.05,
      presetFit: 0.04,
      readingOrder: 0.03
    };
    let total = 0;
    for (const [key, weight2] of Object.entries(weights)) {
      total += ((_d = parts[key]) != null ? _d : 0) * weight2;
    }
    total = clamp(total * 100, 0, 100);
    total = clamp(total - hard.length * 8, 0, 100);
    return {
      total: Math.round(total * 10) / 10,
      parts: Object.fromEntries(
        Object.entries(parts).map(([key, value]) => [key, Math.round(value * 100) / 100])
      ),
      issues: [...new Set(issues)].slice(0, 12),
      hard: [...new Set(hard)].slice(0, 12),
      valid: hard.length === 0 && total >= 48
    };
  }
  function planSignature(plan) {
    return plan.blocks.filter((block) => block.role !== "decoration").sort((a, b) => a.sourceId.localeCompare(b.sourceId)).flatMap((block) => [
      block.rect.x / Math.max(1, plan.width),
      block.rect.y / Math.max(1, plan.height),
      block.rect.w / Math.max(1, plan.width),
      block.rect.h / Math.max(1, plan.height)
    ]);
  }
  function layoutDistance(a, b) {
    const aSig = planSignature(a);
    const bSig = planSignature(b);
    if (!aSig.length || aSig.length !== bSig.length) return 1;
    let total = 0;
    for (let i = 0; i < aSig.length; i += 1) total += Math.abs(aSig[i] - bSig[i]);
    return total / aSig.length;
  }

  // src/engine/grammars/helpers.ts
  function rotation(c, factor = 1) {
    return (c.rng() - 0.5) * 2 * c.dna.rotation * factor;
  }
  function headline(c) {
    return c.inventory.byRole.headline[0];
  }
  function visual(c, index = 0) {
    return c.inventory.visuals[index];
  }
  function action(c) {
    return c.inventory.actions[0];
  }
  function addIndex(c, corner, text) {
    const pad = Math.round(c.marginPx * 0.55);
    const size = Math.max(9, Math.round(Math.min(c.width, c.height) * 0.014));
    const w = Math.max(60, Math.round(c.width * 0.16));
    const h = size * 2.2;
    const x = corner.endsWith("l") ? c.marginPx + pad : right(c.content) - w - pad;
    const y = corner.startsWith("t") ? c.marginPx - pad : bottom(c.content) - h;
    c.decor(
      "index",
      { x, y, w, h },
      c.palette.ink,
      { label: text, z: 46, opacity: 0.72 }
    );
  }
  function addStamp(c, x, y, text, color) {
    const w = Math.max(58, Math.round(c.width * 0.13));
    const h = Math.max(24, Math.round(c.height * 0.045));
    const stamp = c.decor(
      "stamp",
      { x, y, w, h },
      color != null ? color : c.palette.accent,
      { z: 42, rotation: rotation(c, 0.45), label: text }
    );
    c.decor("rule", { x: stamp.rect.x, y: stamp.rect.y, w: stamp.rect.w, h: 2 }, c.palette.ink, {
      z: 43
    });
  }
  function addRuleGrid(c, divisions = 2) {
    for (let index = 1; index <= divisions; index += 1) {
      const x = c.width * (index / (divisions + 1));
      c.rule("v", x, {
        start: c.marginPx,
        end: c.height - c.marginPx,
        color: c.palette.ink,
        thickness: Math.max(1, Math.round(c.width * 15e-4)),
        z: 6
      });
    }
  }
  function addEdgeTicks(c) {
    const tick = Math.max(14, Math.round(c.width * 0.022));
    const weight = Math.max(2, Math.round(c.width * 25e-4));
    const color = c.palette.ink;
    c.decor("rule", { x: c.marginPx, y: c.marginPx, w: tick, h: weight }, color, { z: 44 });
    c.decor(
      "rule",
      { x: right(c.content) - tick, y: c.marginPx, w: tick, h: weight },
      color,
      { z: 44 }
    );
    c.decor(
      "rule",
      { x: c.marginPx, y: bottom(c.content) - weight, w: tick, h: weight },
      color,
      { z: 44 }
    );
    c.decor(
      "rule",
      { x: right(c.content) - tick, y: bottom(c.content) - weight, w: tick, h: weight },
      color,
      { z: 44 }
    );
    c.decor("cross", { x: c.marginPx, y: c.marginPx, w: tick * 0.8, h: tick * 0.8 }, color, {
      z: 44
    });
  }
  function bspLeaves(rect, depth, rng, gap) {
    if (depth <= 0 || rect.w < 160 || rect.h < 140) {
      return [inset(rect, gap / 2)];
    }
    const horizontal = rect.w > rect.h ? rng() > 0.3 : rng() > 0.7;
    const ratio = 0.34 + rng() * 0.32;
    if (horizontal) {
      const split3 = rect.w * ratio;
      return [
        ...bspLeaves({ x: rect.x, y: rect.y, w: split3 - gap / 2, h: rect.h }, depth - 1, rng, gap),
        ...bspLeaves(
          { x: rect.x + split3 + gap / 2, y: rect.y, w: rect.w - split3 - gap / 2, h: rect.h },
          depth - 1,
          rng,
          gap
        )
      ];
    }
    const split2 = rect.h * ratio;
    return [
      ...bspLeaves({ x: rect.x, y: rect.y, w: rect.w, h: split2 - gap / 2 }, depth - 1, rng, gap),
      ...bspLeaves(
        { x: rect.x, y: rect.y + split2 + gap / 2, w: rect.w, h: rect.h - split2 - gap / 2 },
        depth - 1,
        rng,
        gap
      )
    ];
  }
  function ensureCoveringBacking(c, rect, color, pad) {
    const padding = pad != null ? pad : Math.max(10, Math.round(Math.min(c.width, c.height) * 0.014));
    const backing = inset(
      { x: rect.x - padding, y: rect.y - padding, w: rect.w + padding * 2, h: rect.h + padding * 2 },
      0
    );
    c.decor("block", backing, color, { z: 12, backing: true });
    return backing;
  }

  // src/engine/grammars/brutalist.ts
  var monument = {
    id: "monument",
    name: "Monument",
    build(c) {
      const h = headline(c);
      const v = visual(c);
      const a = action(c);
      const pad = c.marginPx;
      const content = c.content;
      if (h) {
        c.place(
          h,
          {
            x: content.x,
            y: content.y + content.h * 0.015,
            w: content.w * 0.92,
            h: content.h * 0.38
          },
          { rotation: rotation(c, 0.18), emphasis: 1.16, z: 31 }
        );
      } else if (v) {
        c.place(
          v,
          {
            x: content.x,
            y: content.y,
            w: content.w * 0.9,
            h: content.h * 0.48
          },
          { emphasis: 1.05, z: 31 }
        );
      }
      if (v && !c.isPlaced(v)) {
        c.place(
          v,
          {
            x: content.x + content.w * 0.47,
            y: content.y + content.h * 0.45,
            w: content.w * 0.55,
            h: content.h * 0.3
          },
          { rotation: rotation(c, 0.22), z: 8, fit: "fill" }
        );
      }
      if (a) {
        c.place(
          a,
          {
            x: content.x + content.w * 0.42,
            y: content.y + content.h * 0.8,
            w: content.w * 0.22,
            h: content.h * 0.075
          },
          { z: 34, rotation: rotation(c, 0.3) }
        );
      }
      c.placeSupport(
        {
          x: content.x,
          y: content.y + content.h * 0.47,
          w: content.w * 0.36,
          h: content.h * 0.32
        },
        { columns: 2, z: 27, emphasis: 0.9 }
      );
      c.decor(
        "bar",
        {
          x: 0,
          y: 0,
          w: Math.max(28, c.width * 0.018),
          h: c.height * 0.42
        },
        c.palette.accent,
        { z: 2 }
      );
      c.decor(
        "block",
        {
          x: content.x + content.w * 0.78,
          y: 0,
          w: c.width * 0.22,
          h: Math.max(10, c.height * 0.018)
        },
        c.palette.alt,
        { z: 3 }
      );
      c.rule("h", content.y + content.h * 0.43, { thickness: Math.max(2, c.height * 6e-3) });
      c.rule("v", content.x + content.w * 0.41, {
        start: content.y + content.h * 0.43,
        end: content.y + content.h * 0.9,
        thickness: Math.max(2, c.width * 25e-4)
      });
      c.rule("h", content.y + content.h * 0.92, {
        thickness: Math.max(1, c.height * 25e-4),
        color: c.palette.ink
      });
      addIndex(c, "tr", `MONUMENT / ${String(c.settings.seed).slice(-3)}`);
      addEdgeTicks(c);
      addStamp(c, content.x, content.y + content.h * 0.93, "NO APOLOGIES", c.palette.accent);
      void pad;
    }
  };
  var split = {
    id: "split",
    name: "Hard split",
    build(c) {
      const h = headline(c);
      const v = visual(c);
      const a = action(c);
      const content = c.content;
      if (v) {
        c.place(
          v,
          {
            x: 0,
            y: 0,
            w: c.width * (0.42 + c.rng() * 0.05),
            h: c.height * 0.82
          },
          { fit: "fill", z: 6 }
        );
      }
      if (h) {
        c.place(
          h,
          {
            x: content.x + content.w * 0.5,
            y: content.y + content.h * 0.06,
            w: content.w * 0.5,
            h: content.h * 0.42
          },
          { emphasis: 1.18, rotation: rotation(c, 0.12), z: 31 }
        );
      } else if (c.focal && !c.isPlaced(c.focal)) {
        const focalRect = {
          x: content.x + content.w * 0.5,
          y: content.y + content.h * 0.08,
          w: content.w * 0.5,
          h: content.h * 0.38
        };
        c.place(c.focal, focalRect, { emphasis: 1.05, z: 31 });
      }
      if (a) {
        c.place(
          a,
          {
            x: content.x + content.w * 0.5,
            y: content.y + content.h * 0.84,
            w: content.w * 0.26,
            h: content.h * 0.075
          },
          { z: 34, rotation: rotation(c, 0.2) }
        );
      }
      c.placeSupport(
        {
          x: content.x + content.w * 0.5,
          y: content.y + content.h * 0.54,
          w: content.w * 0.45,
          h: content.h * 0.25
        },
        { columns: 2, emphasis: 0.92, z: 27 }
      );
      c.decor(
        "bar",
        {
          x: c.width * 0.42,
          y: content.y + content.h * 0.11,
          w: Math.max(16, c.width * 0.01),
          h: content.h * 0.6
        },
        c.palette.accent,
        { z: 9 }
      );
      c.rule("h", content.y + content.h * 0.92, {
        start: content.x + content.w * 0.5,
        end: c.width,
        thickness: Math.max(2, c.height * 4e-3)
      });
      addIndex(c, "br", `HARD SPLIT / ${String(c.settings.seed).slice(-3)}`);
      addEdgeTicks(c);
    }
  };
  var stack = {
    id: "stack",
    name: "Band stack",
    build(c) {
      const h = headline(c);
      const v = visual(c);
      const a = action(c);
      const content = c.content;
      const topH = content.h * 0.32;
      const midH = content.h * 0.4;
      if (!c.settings.preserveColors) {
        c.decor(
          "block",
          { x: 0, y: 0, w: c.width, h: content.y + topH },
          c.palette.ink,
          { z: 1, backing: true }
        );
      }
      if (h) {
        c.place(
          h,
          {
            x: content.x,
            y: content.y,
            w: content.w * 0.85,
            h: topH
          },
          {
            emphasis: 1.22,
            z: 31,
            backdrop: c.settings.preserveColors ? c.palette.background : c.palette.ink,
            color: c.settings.preserveColors ? null : c.palette.accent
          }
        );
      } else if (c.focal) {
        c.place(
          c.focal,
          { x: content.x, y: content.y, w: content.w * 0.8, h: topH },
          { emphasis: 1.04, z: 31 }
        );
      }
      if (v && !c.isPlaced(v)) {
        c.place(
          v,
          {
            x: content.x,
            y: content.y + topH + content.h * 0.035,
            w: content.w * 0.72,
            h: midH
          },
          { fit: "fill", z: 8 }
        );
      }
      if (a) {
        c.place(
          a,
          {
            x: content.x + content.w * 0.76,
            y: content.y + topH + content.h * 0.04,
            w: content.w * 0.22,
            h: content.h * 0.1
          },
          { z: 34, rotation: rotation(c, 0.3) }
        );
      }
      c.placeSupport(
        {
          x: content.x,
          y: content.y + topH + midH + content.h * 0.09,
          w: content.w,
          h: content.h * 0.15
        },
        { direction: "row", emphasis: 0.9, z: 27, gap: c.gutterPx }
      );
      c.rule("h", content.y + topH + content.h * 0.01, {
        thickness: Math.max(3, c.height * 8e-3),
        color: c.palette.accent
      });
      c.rule("h", content.y + content.h * 0.94, {
        thickness: Math.max(2, c.height * 4e-3)
      });
      addIndex(c, "tr", `BAND STACK / ${String(c.settings.seed).slice(-3)}`);
      addStamp(c, content.x + content.w * 0.78, content.y + content.h * 0.95, "STRUCTURE");
    }
  };
  var stair = {
    id: "stair",
    name: "Stair tension",
    build(c) {
      const h = headline(c);
      const v = visual(c);
      const a = action(c);
      const content = c.content;
      if (h) {
        c.place(
          h,
          {
            x: content.x + content.w * 0.035,
            y: content.y + content.h * 0.06,
            w: content.w * 0.8,
            h: content.h * 0.31
          },
          { emphasis: 1.2, rotation: rotation(c, 0.35), z: 31 }
        );
      } else if (c.focal) {
        c.place(
          c.focal,
          {
            x: content.x + content.w * 0.035,
            y: content.y + content.h * 0.05,
            w: content.w * 0.76,
            h: content.h * 0.34
          },
          { z: 31, emphasis: 1.05 }
        );
      }
      if (v && !c.isPlaced(v)) {
        c.place(
          v,
          {
            x: content.x + content.w * 0.48,
            y: content.y + content.h * 0.47,
            w: content.w * 0.52,
            h: content.h * 0.33
          },
          { fit: "fill", rotation: rotation(c, 0.5), z: 8 }
        );
      }
      if (a) {
        c.place(
          a,
          {
            x: content.x + content.w * 0.56,
            y: content.y + content.h * 0.86,
            w: content.w * 0.2,
            h: content.h * 0.07
          },
          { z: 34, rotation: rotation(c, 0.6) }
        );
      }
      c.placeSupport(
        {
          x: content.x,
          y: content.y + content.h * 0.5,
          w: content.w * 0.3,
          h: content.h * 0.35
        },
        { direction: "column", emphasis: 0.94, z: 27 }
      );
      for (let index = 0; index < 4; index += 1) {
        c.decor(
          "rule",
          {
            x: content.x + index * content.w * 0.02,
            y: content.y + content.h * (0.4 + index * 0.055),
            w: content.w * (0.66 - index * 0.06),
            h: Math.max(2, c.height * 35e-4)
          },
          index === 1 ? c.palette.accent : c.palette.ink,
          { z: 12 + index }
        );
      }
      c.decor(
        "bar",
        { x: 0, y: c.height * 0.88, w: c.width * 0.34, h: c.height * 0.018 },
        c.palette.alt,
        { z: 3 }
      );
      addIndex(c, "tl", `STAIR / ${String(c.settings.seed).slice(-3)}`);
      addEdgeTicks(c);
    }
  };
  var brutalistGrammars = [
    monument,
    split,
    stack,
    stair
  ];

  // src/engine/grammars/swiss.ts
  function columnsFor(c) {
    const columns = Math.max(4, c.dna.columns);
    const gutter = Math.max(8, Math.round(c.dna.gutter * Math.min(c.content.w, c.content.h)));
    const colW = (c.content.w - gutter * (columns - 1)) / columns;
    return {
      columns,
      gutter,
      rect: (start, span, y, h) => ({
        x: c.content.x + start * (colW + gutter),
        y,
        w: colW * span + gutter * Math.max(0, span - 1),
        h
      })
    };
  }
  var asymmetricGrid = {
    id: "asymmetric-grid",
    name: "Asymmetric grid",
    build(c) {
      const content = c.content;
      const grid = columnsFor(c);
      const h = headline(c);
      const v = visual(c);
      const a = action(c);
      if (h) {
        c.place(
          h,
          grid.rect(0, 7, content.y, content.h * 0.32),
          { emphasis: 1.1, z: 31 }
        );
      } else if (c.focal) {
        c.place(c.focal, grid.rect(0, 7, content.y, content.h * 0.32), { z: 31 });
      }
      if (v && !c.isPlaced(v)) {
        c.place(
          v,
          grid.rect(7, 5, content.y + content.h * 0.06, content.h * 0.5),
          { fit: "fill", z: 8 }
        );
      }
      if (a) {
        c.place(
          a,
          grid.rect(0, 3, content.y + content.h * 0.78, content.h * 0.08),
          { z: 34 }
        );
      }
      c.placeSupport(
        {
          x: grid.rect(4, 8, 0, 0).x,
          y: content.y + content.h * 0.62,
          w: grid.rect(4, 8, 0, 0).w,
          h: content.h * 0.26
        },
        { columns: 3, emphasis: 0.92, z: 27 }
      );
      c.rule("h", content.y + content.h * 0.52, {
        start: content.x,
        end: content.x + grid.rect(0, 4, 0, 0).w,
        thickness: Math.max(1, c.height * 2e-3),
        z: 18
      });
      c.rule("h", content.y + content.h * 0.9, {
        thickness: Math.max(2, c.height * 4e-3),
        z: 18
      });
      c.decor(
        "block",
        {
          x: content.x,
          y: content.y + content.h * 0.36,
          w: Math.max(20, grid.rect(0, 1, 0, 0).w * 0.6),
          h: Math.max(2, c.height * 4e-3)
        },
        c.palette.accent,
        { z: 20 }
      );
      addIndex(c, "tr", `SWISS / ${String(c.settings.seed).slice(-3)} / ${grid.columns} COL`);
    }
  };
  var editorialSpread = {
    id: "editorial-spread",
    name: "Editorial spread",
    build(c) {
      const content = c.content;
      const h = headline(c);
      const v = visual(c);
      const a = action(c);
      if (v) {
        c.place(
          v,
          {
            x: c.width * 0.56,
            y: 0,
            w: c.width * 0.44,
            h: c.height * 0.7
          },
          { fit: "fill", z: 8 }
        );
      }
      if (h) {
        c.place(
          h,
          {
            x: content.x,
            y: content.y + content.h * 0.02,
            w: content.w * 0.48,
            h: content.h * 0.35
          },
          { emphasis: 1.08, z: 31 }
        );
      } else if (c.focal) {
        c.place(
          c.focal,
          { x: content.x, y: content.y, w: content.w * 0.5, h: content.h * 0.34 },
          { z: 31 }
        );
      }
      if (a) {
        c.place(
          a,
          {
            x: content.x,
            y: content.y + content.h * 0.82,
            w: content.w * 0.2,
            h: content.h * 0.065
          },
          { z: 34 }
        );
      }
      c.placeSupport(
        {
          x: content.x,
          y: content.y + content.h * 0.47,
          w: content.w * 0.46,
          h: content.h * 0.28
        },
        { columns: 2, emphasis: 0.94, z: 27 }
      );
      c.rule("h", content.y + content.h * 0.1, {
        thickness: Math.max(1, c.height * 25e-4),
        z: 19
      });
      c.rule("h", content.y + content.h * 0.93, {
        thickness: Math.max(1, c.height * 25e-4),
        z: 19
      });
      c.rule("v", content.x + content.w * 0.51, {
        start: content.y + content.h * 0.1,
        end: content.y + content.h * 0.78,
        thickness: Math.max(1, c.width * 12e-4),
        z: 19
      });
      addIndex(c, "tr", `EDITORIAL / ${String(c.settings.seed).slice(-3)}`);
    }
  };
  var modular = {
    id: "modular",
    name: "Modular field",
    build(c) {
      const content = c.content;
      const h = headline(c);
      const v = visual(c);
      const a = action(c);
      const grid = columnsFor(c);
      const cellW = grid.rect(0, 1, 0, 0).w;
      const gap = grid.gutter;
      const cols = 3;
      const rows = 3;
      const cellH = (content.h - gap * 2) / rows;
      if (h) {
        c.place(
          h,
          grid.rect(0, 2, content.y, cellH),
          { emphasis: 1.06, z: 31 }
        );
      } else if (c.focal) {
        c.place(c.focal, grid.rect(0, 2, content.y, cellH), { z: 31 });
      }
      if (v && !c.isPlaced(v)) {
        c.place(
          v,
          {
            x: content.x + (cellW + gap) * 2,
            y: content.y,
            w: cellW,
            h: cellH + gap + cellH
          },
          { fit: "fill", z: 8 }
        );
      }
      if (a) {
        c.place(
          a,
          {
            x: content.x + cellW * 2 + gap,
            y: content.y + cellH * 2 + gap + cellH * 0.04,
            w: cellW,
            h: cellH * 0.26
          },
          { z: 34 }
        );
      }
      c.placeSupport(
        {
          x: content.x,
          y: content.y + cellH + gap,
          w: cellW * 2 + gap,
          h: cellH * 2 + gap
        },
        { columns: 2, emphasis: 0.9, z: 27 }
      );
      for (let index = 1; index < cols; index += 1) {
        c.rule("v", content.x + index * (cellW + gap) - gap / 2, {
          start: content.y,
          end: content.y + content.h,
          thickness: Math.max(1, c.width * 12e-4),
          z: 18
        });
      }
      for (let index = 1; index < rows; index += 1) {
        c.rule("h", content.y + index * (cellH + gap) - gap / 2, {
          start: content.x,
          end: content.x + content.w,
          thickness: Math.max(1, c.height * 12e-4),
          z: 18
        });
      }
      c.decor(
        "block",
        {
          x: content.x + cellW * 2 + gap,
          y: content.y + cellH * 2 + gap * 2,
          w: cellW,
          h: Math.max(10, cellH * 0.16)
        },
        c.palette.accent,
        { z: 14, backing: true }
      );
      addIndex(c, "br", `MODULAR / ${String(c.settings.seed).slice(-3)}`);
    }
  };
  var posterColumn = {
    id: "poster-column",
    name: "Poster column",
    build(c) {
      const content = c.content;
      const h = headline(c);
      const v = visual(c);
      const a = action(c);
      const leftW = content.w * 0.34;
      const rightX = content.x + content.w * 0.41;
      if (v) {
        c.place(
          v,
          {
            x: rightX,
            y: content.y + content.h * 0.03,
            w: content.w * 0.57,
            h: content.h * 0.62
          },
          { fit: "fill", z: 8 }
        );
      }
      if (h) {
        c.place(
          h,
          {
            x: content.x,
            y: content.y,
            w: leftW,
            h: content.h * 0.38
          },
          { emphasis: 1.14, z: 31 }
        );
      } else if (c.focal) {
        c.place(c.focal, { x: content.x, y: content.y, w: leftW, h: content.h * 0.36 }, { z: 31 });
      }
      if (a) {
        c.place(
          a,
          {
            x: content.x,
            y: content.y + content.h * 0.4,
            w: leftW * 0.85,
            h: content.h * 0.075
          },
          { z: 34 }
        );
      }
      c.placeSupport(
        {
          x: content.x,
          y: content.y + content.h * 0.5,
          w: leftW,
          h: content.h * 0.36
        },
        { direction: "column", emphasis: 0.94, z: 27 }
      );
      c.rule("v", content.x + content.w * 0.38, {
        start: content.y,
        end: content.y + content.h,
        thickness: Math.max(2, c.width * 2e-3),
        z: 17
      });
      c.rule("h", content.y + content.h * 0.7, {
        start: rightX,
        end: content.x + content.w,
        thickness: Math.max(1, c.height * 2e-3),
        z: 17
      });
      c.decor(
        "bar",
        {
          x: rightX,
          y: content.y + content.h * 0.66,
          w: content.w * 0.15,
          h: Math.max(10, c.height * 0.016)
        },
        c.palette.accent,
        { z: 15 }
      );
      addIndex(c, "bl", `POSTER / ${String(c.settings.seed).slice(-3)}`);
      addRuleGrid(c, 1);
    }
  };
  var swissGrammars = [
    asymmetricGrid,
    editorialSpread,
    modular,
    posterColumn
  ];

  // src/engine/grammars/minimal.ts
  var focalLow = {
    id: "focal-low",
    name: "Low focal",
    build(c) {
      const content = c.content;
      const h = headline(c);
      const v = visual(c);
      const a = action(c);
      if (h) {
        c.place(
          h,
          {
            x: content.x,
            y: content.y + content.h * 0.47,
            w: content.w * 0.62,
            h: content.h * 0.2
          },
          { emphasis: 1.14, z: 31 }
        );
      } else if (c.focal) {
        c.place(
          c.focal,
          {
            x: content.x,
            y: content.y + content.h * 0.46,
            w: content.w * 0.58,
            h: content.h * 0.22
          },
          { emphasis: 1.04, z: 31 }
        );
      }
      if (v && !c.isPlaced(v)) {
        c.place(
          v,
          {
            x: content.x + content.w * 0.66,
            y: content.y + content.h * 0.15,
            w: content.w * 0.22,
            h: content.h * 0.24
          },
          { z: 8 }
        );
      }
      if (a) {
        c.place(
          a,
          {
            x: content.x,
            y: content.y + content.h * 0.73,
            w: content.w * 0.22,
            h: content.h * 0.06
          },
          { z: 34 }
        );
      }
      c.placeSupport(
        {
          x: content.x + content.w * 0.47,
          y: content.y + content.h * 0.72,
          w: content.w * 0.42,
          h: content.h * 0.18
        },
        { columns: 2, emphasis: 0.78, z: 27 }
      );
      c.decor(
        "dot",
        {
          x: content.x,
          y: content.y + content.h * 0.02,
          w: Math.max(10, c.width * 8e-3),
          h: Math.max(10, c.width * 8e-3)
        },
        c.palette.accent,
        { z: 22 }
      );
      c.rule("h", content.y + content.h * 0.9, {
        start: content.x,
        end: content.x + content.w * 0.5,
        thickness: Math.max(1, c.height * 18e-4),
        z: 18
      });
      addIndex(c, "tl", `RADICAL / ${String(c.settings.seed).slice(-3)}`);
    }
  };
  var horizon = {
    id: "horizon",
    name: "Horizon",
    build(c) {
      const content = c.content;
      const h = headline(c);
      const v = visual(c);
      const a = action(c);
      if (v) {
        c.place(
          v,
          {
            x: content.x + content.w * 0.4,
            y: content.y + content.h * 0.14,
            w: content.w * 0.2,
            h: content.h * 0.2
          },
          { z: 8 }
        );
      }
      if (h) {
        c.place(
          h,
          {
            x: content.x + content.w * 0.14,
            y: content.y + content.h * 0.48,
            w: content.w * 0.72,
            h: content.h * 0.17
          },
          { emphasis: 1.12, align: "CENTER", z: 31 }
        );
      } else if (c.focal) {
        c.place(
          c.focal,
          {
            x: content.x + content.w * 0.18,
            y: content.y + content.h * 0.46,
            w: content.w * 0.64,
            h: content.h * 0.18
          },
          { align: "CENTER", z: 31, emphasis: 1.03 }
        );
      }
      if (a) {
        c.place(
          a,
          {
            x: content.x + content.w * 0.38,
            y: content.y + content.h * 0.68,
            w: content.w * 0.24,
            h: content.h * 0.055
          },
          { z: 34, align: "CENTER" }
        );
      }
      c.placeSupport(
        {
          x: content.x + content.w * 0.16,
          y: content.y + content.h * 0.8,
          w: content.w * 0.68,
          h: content.h * 0.11
        },
        { direction: "row", emphasis: 0.76, z: 27, align: "CENTER" }
      );
      c.decor(
        "rule",
        {
          x: content.x + content.w * 0.2,
          y: content.y + content.h * 0.7,
          w: content.w * 0.6,
          h: Math.max(1, c.height * 15e-4)
        },
        c.palette.ink,
        { z: 18 }
      );
      c.decor(
        "ring",
        {
          x: content.x + content.w * 0.46,
          y: content.y + content.h * 0.86,
          w: Math.max(8, c.width * 7e-3),
          h: Math.max(8, c.width * 7e-3)
        },
        c.palette.accent,
        { z: 22 }
      );
      addIndex(c, "tr", `HORIZON / ${String(c.settings.seed).slice(-3)}`);
    }
  };
  var edge = {
    id: "edge",
    name: "Edge tension",
    build(c) {
      const content = c.content;
      const h = headline(c);
      const v = visual(c);
      const a = action(c);
      if (v) {
        c.place(
          v,
          {
            x: c.width * 0.72,
            y: content.y + content.h * 0.08,
            w: c.width * 0.28,
            h: content.h * 0.32
          },
          { fit: "fill", z: 8 }
        );
      }
      if (h) {
        c.place(
          h,
          {
            x: content.x * 0.45,
            y: content.y + content.h * 0.26,
            w: content.w * 0.65,
            h: content.h * 0.28
          },
          { emphasis: 1.16, z: 31, align: "LEFT" }
        );
      } else if (c.focal) {
        c.place(
          c.focal,
          {
            x: content.x * 0.45,
            y: content.y + content.h * 0.24,
            w: content.w * 0.6,
            h: content.h * 0.26
          },
          { z: 31 }
        );
      }
      if (a) {
        c.place(
          a,
          {
            x: content.x + content.w * 0.53,
            y: content.y + content.h * 0.63,
            w: content.w * 0.2,
            h: content.h * 0.055
          },
          { z: 34 }
        );
      }
      c.placeSupport(
        {
          x: content.x,
          y: content.y + content.h * 0.63,
          w: content.w * 0.46,
          h: content.h * 0.24
        },
        { columns: 2, emphasis: 0.8, z: 27 }
      );
      c.rule("v", c.width * 0.69, {
        start: 0,
        end: c.height,
        thickness: Math.max(1, c.width * 12e-4),
        z: 18
      });
      c.decor(
        "index",
        {
          x: content.x,
          y: content.y + content.h * 0.08,
          w: Math.max(50, c.width * 0.1),
          h: Math.max(14, c.height * 0.024)
        },
        c.palette.accent,
        { label: "EDGE / 01", z: 44 }
      );
      addIndex(c, "bl", `RADICAL / ${String(c.settings.seed).slice(-3)}`);
    }
  };
  var quietStack = {
    id: "quiet-stack",
    name: "Quiet stack",
    build(c) {
      const content = c.content;
      const h = headline(c);
      const v = visual(c);
      const a = action(c);
      const columnX = content.x;
      const columnW = content.w * 0.46;
      if (v) {
        c.place(
          v,
          {
            x: content.x + content.w * 0.62,
            y: content.y + content.h * 0.1,
            w: content.w * 0.26,
            h: content.h * 0.3
          },
          { z: 8 }
        );
      }
      if (h) {
        c.place(
          h,
          {
            x: columnX,
            y: content.y + content.h * 0.5,
            w: columnW,
            h: content.h * 0.14
          },
          { emphasis: 1.08, z: 31 }
        );
      } else if (c.focal) {
        c.place(
          c.focal,
          {
            x: columnX,
            y: content.y + content.h * 0.46,
            w: columnW,
            h: content.h * 0.18
          },
          { z: 31 }
        );
      }
      if (a) {
        c.place(
          a,
          {
            x: columnX,
            y: content.y + content.h * 0.88,
            w: columnW * 0.55,
            h: content.h * 0.05
          },
          { z: 34 }
        );
      }
      c.placeSupport(
        {
          x: columnX,
          y: content.y + content.h * 0.64,
          w: columnW,
          h: content.h * 0.23
        },
        { columns: 2, emphasis: 0.8, z: 27 }
      );
      c.decor(
        "bar",
        {
          x: content.x + content.w * 0.58,
          y: content.y + content.h * 0.46,
          w: Math.max(2, c.width * 25e-4),
          h: content.h * 0.28
        },
        c.palette.ink,
        { z: 18 }
      );
      c.decor(
        "block",
        {
          x: content.x + content.w * 0.62,
          y: content.y + content.h * 0.44,
          w: Math.max(12, c.width * 0.04),
          h: Math.max(12, c.width * 0.04)
        },
        c.palette.accent,
        { z: 16 }
      );
      addIndex(c, "tr", `QUIET / ${String(c.settings.seed).slice(-3)}`);
      void rotation;
    }
  };
  var minimalGrammars = [
    focalLow,
    horizon,
    edge,
    quietStack
  ];

  // src/engine/grammars/maximal.ts
  function contrastInk(background) {
    return readableOn(background, [LAB.ink, LAB.paper, LAB.white]);
  }
  var collage = {
    id: "collage",
    name: "Collage",
    build(c) {
      const content = c.content;
      const h = headline(c);
      const v = visual(c);
      const a = action(c);
      c.decor(
        "block",
        { x: 0, y: 0, w: c.width * 0.26, h: c.height },
        mixHex(c.palette.background, c.palette.ink, 0.12),
        { z: 1 }
      );
      c.decor(
        "ring",
        {
          x: c.width * 0.06,
          y: c.height * 0.08,
          w: c.width * 0.2,
          h: c.width * 0.2
        },
        c.palette.accent,
        { z: 2, opacity: 0.9 }
      );
      if (v) {
        c.place(
          v,
          {
            x: c.width * 0.3,
            y: c.height * 0.09,
            w: c.width * 0.64,
            h: c.height * 0.48
          },
          { fit: "fill", z: 8, rotation: rotation(c, 0.25) }
        );
      }
      if (h) {
        const rect = {
          x: content.x + content.w * 0.02,
          y: content.y + content.h * 0.28,
          w: content.w * 0.58,
          h: content.h * 0.26
        };
        const backing = ensureCoveringBacking(c, rect, c.palette.accent, Math.round(c.width * 0.018));
        c.place(h, rect, {
          emphasis: 1.22,
          z: 31,
          backdrop: c.palette.accent,
          color: contrastInk(c.palette.accent),
          rotation: rotation(c, 0.35)
        });
        void backing;
      } else if (c.focal && !c.isPlaced(c.focal)) {
        c.place(
          c.focal,
          {
            x: content.x,
            y: content.y + content.h * 0.3,
            w: content.w * 0.55,
            h: content.h * 0.24
          },
          { z: 31 }
        );
      }
      if (a) {
        c.place(
          a,
          {
            x: content.x + content.w * 0.72,
            y: content.y + content.h * 0.78,
            w: content.w * 0.2,
            h: content.h * 0.075
          },
          { z: 34, rotation: rotation(c, 0.6) }
        );
      }
      c.placeSupport(
        {
          x: content.x,
          y: content.y + content.h * 0.66,
          w: content.w * 0.66,
          h: content.h * 0.24
        },
        { columns: 3, emphasis: 0.9, z: 27 }
      );
      c.decor(
        "frame",
        {
          x: c.width * 0.55,
          y: c.height * 0.61,
          w: c.width * 0.4,
          h: c.height * 0.3
        },
        c.palette.accent,
        { z: 16, rotation: rotation(c, 0.3) }
      );
      c.decor(
        "bar",
        {
          x: 0,
          y: c.height * 0.95,
          w: c.width,
          h: c.height * 0.018
        },
        c.palette.accent,
        { z: 18 }
      );
      c.decor(
        "dot",
        {
          x: c.width * 0.86,
          y: c.height * 0.12,
          w: c.width * 0.05,
          h: c.width * 0.05
        },
        c.palette.alt,
        { z: 15 }
      );
      addIndex(c, "tl", `COLLAGE / ${String(c.settings.seed).slice(-3)}`);
      addStamp(c, c.width * 0.06, c.height * 0.9, "MORE / MORE", c.palette.accent);
    }
  };
  var spectacle = {
    id: "spectacle",
    name: "Spectacle",
    build(c) {
      const content = c.content;
      const h = headline(c);
      const v = visual(c);
      const a = action(c);
      if (v) {
        c.place(
          v,
          {
            x: 0,
            y: 0,
            w: c.width,
            h: c.height * 0.58
          },
          { fit: "fill", z: 6 }
        );
      }
      if (h) {
        const rect = {
          x: content.x,
          y: content.y + content.h * 0.38,
          w: content.w * 0.72,
          h: content.h * 0.22
        };
        const panel = c.palette.background === c.palette.accent ? c.palette.ink : c.palette.accent;
        ensureCoveringBacking(c, rect, panel, Math.round(c.width * 0.012));
        c.place(h, rect, {
          emphasis: 1.25,
          z: 31,
          backdrop: panel,
          color: contrastInk(panel),
          rotation: rotation(c, 0.2)
        });
      } else if (c.focal && !c.isPlaced(c.focal)) {
        c.place(
          c.focal,
          {
            x: content.x,
            y: content.y + content.h * 0.4,
            w: content.w * 0.7,
            h: content.h * 0.2
          },
          { z: 31 }
        );
      }
      c.decor(
        "block",
        {
          x: 0,
          y: c.height * 0.62,
          w: c.width,
          h: c.height * 0.38
        },
        c.palette.background,
        { z: 10, backing: true }
      );
      if (a) {
        c.place(
          a,
          {
            x: content.x,
            y: content.y + content.h * 0.84,
            w: content.w * 0.2,
            h: content.h * 0.075
          },
          { z: 34, rotation: rotation(c, 0.4) }
        );
      }
      c.placeSupport(
        {
          x: content.x + content.w * 0.24,
          y: content.y + content.h * 0.67,
          w: content.w * 0.76,
          h: content.h * 0.2
        },
        { columns: 3, emphasis: 0.94, z: 27 }
      );
      c.decor(
        "bar",
        {
          x: content.x + content.w * 0.2,
          y: content.y + content.h * 0.63,
          w: Math.max(2, c.width * 25e-4),
          h: content.h * 0.26
        },
        c.palette.accent,
        { z: 16 }
      );
      c.decor(
        "frame",
        {
          x: c.width * 0.03,
          y: c.height * 0.05,
          w: c.width * 0.94,
          h: c.height * 0.9
        },
        c.palette.accent,
        { z: 14, opacity: 0.7 }
      );
      addIndex(c, "tr", `SPECTACLE / ${String(c.settings.seed).slice(-3)}`);
    }
  };
  var typeWall = {
    id: "type-wall",
    name: "Type wall",
    build(c) {
      const content = c.content;
      const h = headline(c);
      const v = visual(c);
      const a = action(c);
      if (h) {
        const rect = {
          x: content.x - content.w * 0.02,
          y: content.y + content.h * 0.14,
          w: content.w * 1.04,
          h: content.h * 0.36
        };
        const panel = c.dna.backgroundMode === "ink" ? c.palette.accent : c.palette.ink;
        ensureCoveringBacking(c, rect, panel, Math.round(c.width * 8e-3));
        c.place(h, rect, {
          emphasis: 1.3,
          z: 31,
          color: contrastInk(panel),
          backdrop: panel,
          align: "CENTER",
          rotation: rotation(c, 0.18)
        });
      } else if (c.focal) {
        c.place(
          c.focal,
          {
            x: content.x,
            y: content.y + content.h * 0.16,
            w: content.w,
            h: content.h * 0.32
          },
          { z: 31, align: "CENTER" }
        );
      }
      if (v && !c.isPlaced(v)) {
        c.place(
          v,
          {
            x: 0,
            y: content.y + content.h * 0.58,
            w: c.width * 0.28,
            h: content.h * 0.2
          },
          { fit: "fill", z: 8 }
        );
      }
      if (a) {
        c.place(
          a,
          {
            x: content.x + content.w * 0.72,
            y: content.y + content.h * 0.58,
            w: content.w * 0.24,
            h: content.h * 0.08
          },
          { z: 34, rotation: rotation(c, 0.6) }
        );
      }
      c.placeSupport(
        {
          x: content.x + content.w * 0.3,
          y: content.y + content.h * 0.58,
          w: content.w * 0.38,
          h: content.h * 0.2
        },
        { direction: "column", emphasis: 0.88, z: 27 }
      );
      c.decor(
        "block",
        {
          x: 0,
          y: c.height * 0.8,
          w: c.width,
          h: c.height * 0.2
        },
        mixHex(c.palette.background, c.palette.ink, 0.07),
        { z: 1 }
      );
      c.decor(
        "bar",
        {
          x: content.x,
          y: content.y + content.h * 0.53,
          w: content.w,
          h: Math.max(4, c.height * 8e-3)
        },
        c.palette.accent,
        { z: 17 }
      );
      c.decor(
        "index",
        {
          x: content.x,
          y: content.y,
          w: content.w * 0.18,
          h: c.height * 0.03
        },
        c.palette.accent,
        { label: "TYPE IS THE IMAGE", z: 45 }
      );
      addIndex(c, "br", `WALL / ${String(c.settings.seed).slice(-3)}`);
    }
  };
  var layeredStack = {
    id: "layered-stack",
    name: "Layered stack",
    build(c) {
      const content = c.content;
      const h = headline(c);
      const v = visual(c);
      const a = action(c);
      c.decor(
        "block",
        {
          x: 0,
          y: 0,
          w: c.width,
          h: c.height * 0.3
        },
        c.palette.ink,
        { z: 1, backing: true }
      );
      c.decor(
        "block",
        {
          x: c.width * 0.08,
          y: c.height * 0.26,
          w: c.width * 0.84,
          h: c.height * 0.035
        },
        c.palette.accent,
        { z: 12 }
      );
      if (h) {
        c.place(
          h,
          {
            x: content.x,
            y: content.y,
            w: content.w * 0.78,
            h: content.h * 0.2
          },
          {
            emphasis: 1.24,
            z: 31,
            backdrop: c.palette.ink,
            color: c.palette.accent,
            rotation: rotation(c, 0.2)
          }
        );
      } else if (c.focal) {
        c.place(c.focal, { x: content.x, y: content.y, w: content.w * 0.76, h: content.h * 0.2 }, { z: 31 });
      }
      if (v) {
        c.place(
          v,
          {
            x: content.x + content.w * 0.12,
            y: content.y + content.h * 0.28,
            w: content.w * 0.86,
            h: content.h * 0.36
          },
          { fit: "fill", z: 8, rotation: rotation(c, 0.12) }
        );
      }
      if (a) {
        c.place(
          a,
          {
            x: content.x + content.w * 0.7,
            y: content.y + content.h * 0.77,
            w: content.w * 0.24,
            h: content.h * 0.08
          },
          { z: 34, rotation: rotation(c, 0.55) }
        );
      }
      c.placeSupport(
        {
          x: content.x,
          y: content.y + content.h * 0.71,
          w: content.w * 0.66,
          h: content.h * 0.17
        },
        { columns: 3, emphasis: 0.9, z: 27 }
      );
      c.decor(
        "frame",
        {
          x: c.width * 0.03,
          y: c.height * 0.33,
          w: c.width * 0.9,
          h: c.height * 0.56
        },
        c.palette.accent,
        { z: 16 }
      );
      c.decor(
        "bar",
        {
          x: 0,
          y: c.height * 0.9,
          w: c.width * 0.42,
          h: c.height * 0.02
        },
        c.palette.alt,
        { z: 18 }
      );
      addIndex(c, "tr", `LAYERS / ${String(c.settings.seed).slice(-3)}`);
      addStamp(c, content.x, content.y + content.h * 0.92, "TOO MUCH / JUST ENOUGH");
    }
  };
  var maximalGrammars = [
    collage,
    spectacle,
    typeWall,
    layeredStack
  ];

  // src/engine/grammars/antigrid.ts
  var brokenColumns = {
    id: "broken-columns",
    name: "Broken columns",
    build(c) {
      const content = c.content;
      const h = headline(c);
      const v = visual(c);
      const a = action(c);
      if (h) {
        c.place(
          h,
          {
            x: content.x + content.w * 0.03,
            y: content.y + content.h * 0.1,
            w: content.w * 0.76,
            h: content.h * 0.28
          },
          { emphasis: 1.16, z: 31, rotation: rotation(c, 0.4) }
        );
      } else if (c.focal) {
        c.place(
          c.focal,
          {
            x: content.x + content.w * 0.03,
            y: content.y + content.h * 0.1,
            w: content.w * 0.72,
            h: content.h * 0.28
          },
          { z: 31, rotation: rotation(c, 0.4) }
        );
      }
      if (v && !c.isPlaced(v)) {
        c.place(
          v,
          {
            x: content.x + content.w * 0.47,
            y: content.y + content.h * 0.47,
            w: content.w * 0.56,
            h: content.h * 0.29
          },
          { fit: "fill", z: 8, rotation: rotation(c, 0.5) }
        );
      }
      if (a) {
        c.place(
          a,
          {
            x: content.x + content.w * 0.07,
            y: content.y + content.h * 0.85,
            w: content.w * 0.22,
            h: content.h * 0.06
          },
          { z: 34, rotation: rotation(c, 0.8) }
        );
      }
      c.placeSupport(
        {
          x: content.x + content.w * 0.04,
          y: content.y + content.h * 0.49,
          w: content.w * 0.32,
          h: content.h * 0.29
        },
        { columns: 2, emphasis: 0.88, z: 27 }
      );
      c.rule("v", content.x + content.w * 0.42, {
        start: content.y + content.h * 0.4,
        end: content.y + content.h * 0.88,
        thickness: Math.max(2, c.width * 2e-3),
        z: 17
      });
      c.rule("h", content.y + content.h * 0.44, {
        start: content.x,
        end: content.x + content.w * 0.34,
        thickness: Math.max(1, c.height * 18e-4),
        z: 17
      });
      c.decor(
        "bar",
        {
          x: content.x + content.w * 0.58,
          y: content.y + content.h * 0.05,
          w: content.w * 0.24,
          h: Math.max(10, c.height * 0.014)
        },
        c.palette.accent,
        { z: 15, rotation: rotation(c, 0.3) }
      );
      addIndex(c, "br", `OFFSET / ${String(c.settings.seed).slice(-3)}`);
      addStamp(c, content.x + content.w * 0.45, content.y + content.h * 0.9, "FAULT LINE", c.palette.accent);
    }
  };
  var drift = {
    id: "drift",
    name: "Drift",
    build(c) {
      const content = c.content;
      const h = headline(c);
      const v = visual(c);
      const a = action(c);
      const drift2 = content.w * 0.025;
      if (h) {
        c.place(
          h,
          {
            x: content.x + drift2 * 1.2,
            y: content.y + content.h * 0.08,
            w: content.w * 0.75,
            h: content.h * 0.27
          },
          { emphasis: 1.12, rotation: rotation(c, 0.35), z: 31 }
        );
      } else if (c.focal) {
        c.place(
          c.focal,
          {
            x: content.x + drift2,
            y: content.y + content.h * 0.08,
            w: content.w * 0.72,
            h: content.h * 0.27
          },
          { z: 31, rotation: rotation(c, 0.35) }
        );
      }
      if (v && !c.isPlaced(v)) {
        c.place(
          v,
          {
            x: content.x + content.w * 0.38,
            y: content.y + content.h * 0.46,
            w: content.w * 0.6,
            h: content.h * 0.31
          },
          { fit: "fill", z: 8, rotation: rotation(c, 0.45) }
        );
      }
      if (a) {
        c.place(
          a,
          {
            x: content.x + content.w * 0.08,
            y: content.y + content.h * 0.85,
            w: content.w * 0.24,
            h: content.h * 0.06
          },
          { z: 34, rotation: rotation(c, 0.9) }
        );
      }
      c.placeSupport(
        {
          x: content.x + content.w * 0.04,
          y: content.y + content.h * 0.46,
          w: content.w * 0.28,
          h: content.h * 0.34
        },
        { direction: "column", emphasis: 0.9, z: 27 }
      );
      for (let index = 0; index < 5; index += 1) {
        c.decor(
          "rule",
          {
            x: content.x + drift2 * index,
            y: content.y + content.h * (0.16 + index * 0.16),
            w: content.w * 0.18,
            h: Math.max(1, c.height * 14e-4)
          },
          index % 2 ? c.palette.accent : c.palette.ink,
          { z: 17, rotation: rotation(c, 0.18) }
        );
      }
      c.decor(
        "block",
        {
          x: content.x + content.w * 0.81,
          y: content.y + content.h * 0.06,
          w: content.w * 0.15,
          h: content.h * 0.03
        },
        c.palette.alt,
        { z: 15, rotation: rotation(c, 0.5) }
      );
      addIndex(c, "tr", `DRIFT / ${String(c.settings.seed).slice(-3)}`);
    }
  };
  var stagger = {
    id: "stagger",
    name: "Stagger",
    build(c) {
      const content = c.content;
      const h = headline(c);
      const v = visual(c);
      const a = action(c);
      if (h) {
        c.place(
          h,
          {
            x: content.x,
            y: content.y + content.h * 0.05,
            w: content.w * 0.72,
            h: content.h * 0.24
          },
          { emphasis: 1.14, z: 31, rotation: rotation(c, 0.2) }
        );
      } else if (c.focal) {
        c.place(
          c.focal,
          {
            x: content.x,
            y: content.y + content.h * 0.05,
            w: content.w * 0.7,
            h: content.h * 0.25
          },
          { z: 31 }
        );
      }
      if (v && !c.isPlaced(v)) {
        c.place(
          v,
          {
            x: content.x + content.w * 0.52,
            y: content.y + content.h * 0.36,
            w: content.w * 0.46,
            h: content.h * 0.28
          },
          { fit: "fill", z: 8, rotation: rotation(c, 0.35) }
        );
      }
      if (a) {
        c.place(
          a,
          {
            x: content.x + content.w * 0.06,
            y: content.y + content.h * 0.86,
            w: content.w * 0.22,
            h: content.h * 0.06
          },
          { z: 34, rotation: rotation(c, 0.7) }
        );
      }
      const remaining = c.remaining;
      if (remaining.length) {
        const zone = {
          x: content.x + content.w * 0.03,
          y: content.y + content.h * 0.42,
          w: content.w * 0.4,
          h: content.h * 0.36
        };
        const columns = remaining.length > 4 ? 2 : 1;
        const rows = Math.ceil(remaining.length / columns);
        const gap = Math.max(6, c.gutterPx * 0.7);
        const cellW = (zone.w - gap * (columns - 1)) / columns;
        const cellH = (zone.h - gap * (rows - 1)) / rows;
        remaining.forEach((block, index) => {
          const column = index % columns;
          const row = Math.floor(index / columns);
          const shift = (row % 2 === 0 ? 1 : -1) * content.w * 0.018;
          c.place(
            block,
            {
              x: zone.x + column * (cellW + gap) + shift,
              y: zone.y + row * (cellH + gap),
              w: cellW,
              h: cellH
            },
            { z: 27, emphasis: 0.86 }
          );
        });
      }
      for (let index = 0; index < 4; index += 1) {
        c.decor(
          "rule",
          {
            x: content.x + (index % 2 ? content.w * 0.46 : content.w * 0.04),
            y: content.y + content.h * (0.35 + index * 0.13),
            w: content.w * 0.26,
            h: Math.max(1, c.height * 15e-4)
          },
          index === 2 ? c.palette.accent : c.palette.ink,
          { z: 16 }
        );
      }
      addIndex(c, "br", `STAGGER / ${String(c.settings.seed).slice(-3)}`);
    }
  };
  var orbit = {
    id: "orbit",
    name: "Orbit",
    build(c) {
      const content = c.content;
      const h = headline(c);
      const v = visual(c);
      const a = action(c);
      const cx = content.x + content.w * 0.44;
      const cy = content.y + content.h * 0.34;
      c.decor(
        "ring",
        {
          x: cx - content.w * 0.18,
          y: cy - content.w * 0.18,
          w: content.w * 0.36,
          h: content.w * 0.36
        },
        c.palette.accent,
        { z: 2, opacity: 0.9 }
      );
      if (h) {
        c.place(
          h,
          {
            x: content.x + content.w * 0.28,
            y: content.y + content.h * 0.18,
            w: content.w * 0.5,
            h: content.h * 0.24
          },
          { emphasis: 1.14, z: 31, align: "CENTER", rotation: rotation(c, 0.3) }
        );
      } else if (c.focal) {
        c.place(
          c.focal,
          {
            x: content.x + content.w * 0.26,
            y: content.y + content.h * 0.18,
            w: content.w * 0.48,
            h: content.h * 0.24
          },
          { z: 31, align: "CENTER" }
        );
      }
      if (v && !c.isPlaced(v)) {
        c.place(
          v,
          {
            x: content.x + content.w * 0.66,
            y: content.y + content.h * 0.45,
            w: content.w * 0.29,
            h: content.h * 0.27
          },
          { fit: "fill", z: 8, rotation: rotation(c, 0.55) }
        );
      }
      if (a) {
        c.place(
          a,
          {
            x: content.x + content.w * 0.06,
            y: content.y + content.h * 0.6,
            w: content.w * 0.2,
            h: content.h * 0.06
          },
          { z: 34, rotation: rotation(c, 1) }
        );
      }
      c.placeSupport(
        {
          x: content.x + content.w * 0.05,
          y: content.y + content.h * 0.72,
          w: content.w * 0.9,
          h: content.h * 0.2
        },
        { columns: 4, emphasis: 0.86, z: 27 }
      );
      c.decor(
        "rule",
        {
          x: content.x + content.w * 0.08,
          y: content.y + content.h * 0.13,
          w: content.w * 0.16,
          h: Math.max(1, c.height * 14e-4)
        },
        c.palette.ink,
        { z: 18, rotation: rotation(c, 0.6) }
      );
      c.decor(
        "cross",
        {
          x: content.x + content.w * 0.08,
          y: content.y + content.h * 0.82,
          w: content.w * 0.04,
          h: content.w * 0.04
        },
        c.palette.accent,
        { z: 22 }
      );
      addIndex(c, "tl", `ORBIT / ${String(c.settings.seed).slice(-3)}`);
      addIndex(c, "br", `OFF AXIS / ${String(c.settings.seed).slice(-2)}`);
    }
  };
  var antigridGrammars = [
    brokenColumns,
    drift,
    stagger,
    orbit
  ];

  // src/engine/grammars/chaos.ts
  var hybridSplit = {
    id: "hybrid-split",
    name: "Hybrid split",
    build(c) {
      const content = c.content;
      const h = headline(c);
      const v = visual(c);
      const a = action(c);
      const split2 = c.width * (0.36 + c.dna.split * 0.16);
      c.decor(
        "block",
        {
          x: split2 - c.width * 0.01,
          y: 0,
          w: c.width * 0.02,
          h: c.height
        },
        c.palette.accent,
        { z: 14 }
      );
      if (h) {
        c.place(
          h,
          {
            x: content.x,
            y: content.y + content.h * 0.06,
            w: split2 - content.x - c.gutterPx * 2,
            h: content.h * 0.4
          },
          { emphasis: 1.22, z: 31, rotation: rotation(c, 0.4) }
        );
      } else if (c.focal && !c.isPlaced(c.focal)) {
        c.place(
          c.focal,
          {
            x: content.x,
            y: content.y + content.h * 0.06,
            w: split2 - content.x - c.gutterPx * 2,
            h: content.h * 0.4
          },
          { z: 31 }
        );
      }
      if (v && !c.isPlaced(v)) {
        c.place(
          v,
          {
            x: split2 + c.width * 0.02,
            y: 0,
            w: c.width - split2 - c.width * 0.02,
            h: c.height * 0.78
          },
          { fit: "fill", z: 8 }
        );
      }
      if (a) {
        c.place(
          a,
          {
            x: content.x + content.w * 0.44,
            y: content.y + content.h * 0.86,
            w: content.w * 0.2,
            h: content.h * 0.07
          },
          { z: 34, rotation: rotation(c, 0.7) }
        );
      }
      c.placeSupport(
        {
          x: content.x,
          y: content.y + content.h * 0.62,
          w: content.w * 0.4,
          h: content.h * 0.18
        },
        { columns: 2, emphasis: 0.9, z: 27 }
      );
      const bandColor = mixHex(c.palette.background, c.palette.ink, 0.1);
      c.decor(
        "frame",
        {
          x: content.x,
          y: content.y + content.h * 0.56,
          w: content.w * 0.38,
          h: content.h * 0.3
        },
        bandColor,
        { z: 16, rotation: rotation(c, 0.25) }
      );
      c.rule("h", content.y + content.h * 0.82, {
        thickness: Math.max(3, c.height * 6e-3),
        color: c.palette.accent,
        z: 18
      });
      addIndex(c, "tl", `HYBRID / ${String(c.settings.seed).slice(-3)}`);
      addStamp(c, split2 + c.width * 0.04, c.height * 0.84, "CROSSED / 01", c.palette.accent);
    }
  };
  var collisionField = {
    id: "collision-field",
    name: "Collision field",
    build(c) {
      const content = c.content;
      const h = headline(c);
      const v = visual(c);
      const a = action(c);
      const backingColor2 = c.palette.accent;
      if (v) {
        c.place(
          v,
          {
            x: content.x + content.w * 0.48,
            y: content.y + content.h * 0.04,
            w: content.w * 0.55,
            h: content.h * 0.5
          },
          { fit: "fill", z: 6, rotation: rotation(c, 0.5) }
        );
      }
      if (h) {
        const rect = {
          x: content.x + content.w * 0.02,
          y: content.y + content.h * 0.2,
          w: content.w * 0.7,
          h: content.h * 0.28
        };
        ensureCoveringBacking(c, rect, backingColor2, Math.round(c.width * 0.016));
        c.place(h, rect, {
          emphasis: 1.3,
          z: 31,
          backdrop: backingColor2,
          color: readableOn(backingColor2, [LAB.ink, LAB.paper, LAB.white]),
          rotation: rotation(c, 0.3)
        });
      } else if (c.focal && !c.isPlaced(c.focal)) {
        const rect = {
          x: content.x,
          y: content.y + content.h * 0.22,
          w: content.w * 0.66,
          h: content.h * 0.26
        };
        ensureCoveringBacking(c, rect, backingColor2);
        c.place(c.focal, rect, { z: 31, backdrop: backingColor2 });
      }
      if (a) {
        c.place(
          a,
          {
            x: content.x + content.w * 0.74,
            y: content.y + content.h * 0.62,
            w: content.w * 0.2,
            h: content.h * 0.07
          },
          { z: 34, rotation: rotation(c, 1) }
        );
      }
      c.placeSupport(
        {
          x: content.x,
          y: content.y + content.h * 0.62,
          w: content.w * 0.66,
          h: content.h * 0.28
        },
        { columns: 3, emphasis: 0.88, z: 27 }
      );
      c.decor(
        "bar",
        {
          x: 0,
          y: c.height * 0.1,
          w: c.width * 0.34,
          h: Math.max(8, c.height * 0.012)
        },
        c.palette.alt,
        { z: 16, rotation: rotation(c, 0.4) }
      );
      c.decor(
        "ring",
        {
          x: c.width * 0.08,
          y: c.height * 0.64,
          w: c.width * 0.14,
          h: c.width * 0.14
        },
        c.palette.accent,
        { z: 15 }
      );
      c.decor(
        "frame",
        {
          x: c.width * 0.03,
          y: c.height * 0.05,
          w: c.width * 0.94,
          h: c.height * 0.9
        },
        c.palette.accent,
        { z: 12, rotation: rotation(c, 0.18) }
      );
      c.rule("h", content.y + content.h * 0.58, {
        thickness: Math.max(1, c.height * 2e-3),
        z: 18
      });
      addIndex(c, "tr", `COLLISION / ${String(c.settings.seed).slice(-3)}`);
    }
  };
  var fracture = {
    id: "fracture",
    name: "Fracture",
    build(c) {
      const content = c.content;
      const blockCount = c.snapshot.blocks.length;
      const depth = blockCount <= 8 ? 3 : blockCount <= 16 ? 4 : 5;
      const leaves = bspLeaves(content, depth, c.rng, c.gutterPx);
      const readingLeaves = [...leaves].sort(
        (a2, b) => a2.y - b.y || a2.x - b.x
      );
      const byArea = [...leaves].sort((a2, b) => b.w * b.h - a2.w * a2.h);
      const assigned = /* @__PURE__ */ new Set();
      const h = headline(c);
      const v = visual(c);
      const a = action(c);
      if (h) {
        const leaf = byArea.shift();
        if (leaf) {
          c.place(h, leaf, {
            emphasis: 1.12,
            z: 31,
            rotation: rotation(c, 0.4)
          });
          assigned.add(h.id);
        }
      }
      if (v && byArea.length) {
        const leaf = byArea.shift();
        if (leaf) {
          c.place(v, leaf, { fit: "fill", z: 8, rotation: rotation(c, 0.5) });
          assigned.add(v.id);
        }
      }
      if (a && byArea.length) {
        const leaf = byArea.shift();
        if (leaf) {
          c.place(a, leaf, { z: 34, rotation: rotation(c, 0.8) });
          assigned.add(a.id);
        }
      }
      const remaining = c.remaining;
      const freeLeaves = [...byArea, ...readingLeaves].filter(
        (leaf, index, all) => all.indexOf(leaf) === index
      );
      let leafIndex = 0;
      for (const block of remaining) {
        if (assigned.has(block.id)) continue;
        const leaf = freeLeaves[leafIndex % Math.max(1, freeLeaves.length)];
        leafIndex += 1;
        if (!leaf) break;
        c.place(block, leaf, {
          z: 27,
          emphasis: block.role === "action" ? 0.95 : 0.86,
          rotation: block.role === "label" ? rotation(c, 0.35) : 0
        });
      }
      for (let index = 0; index < Math.min(7, leaves.length); index += 1) {
        const leaf = leaves[index];
        c.decor(
          "rule",
          {
            x: leaf.x + leaf.w * 0.04,
            y: leaf.y + leaf.h * 0.08,
            w: leaf.w * 0.22,
            h: Math.max(1, c.height * 12e-4)
          },
          index % 3 === 0 ? c.palette.accent : c.palette.ink,
          { z: 16, rotation: rotation(c, 0.3) }
        );
      }
      c.decor(
        "block",
        {
          x: c.width * 0.84,
          y: 0,
          w: c.width * 0.16,
          h: c.height * 0.03
        },
        c.palette.accent,
        { z: 16 }
      );
      addIndex(c, "bl", `FRACTURE / ${String(c.settings.seed).slice(-3)}`);
      addStamp(c, content.x + content.w * 0.68, content.y + content.h * 0.92, "LOAD BEARING");
    }
  };
  var anchorField = {
    id: "anchor-field",
    name: "Anchor field",
    build(c) {
      const content = c.content;
      const h = headline(c);
      const v = visual(c);
      const a = action(c);
      const shiftX = (c.rng() - 0.5) * content.w * 0.08;
      const shiftY = (c.rng() - 0.5) * content.h * 0.06;
      c.decor(
        "ring",
        {
          x: content.x + content.w * 0.58 + shiftX,
          y: content.y + content.h * 0.03,
          w: content.w * 0.28,
          h: content.w * 0.28
        },
        c.palette.alt,
        { z: 2, opacity: 0.85 }
      );
      if (h) {
        c.place(
          h,
          {
            x: content.x + content.w * 0.12 + shiftX,
            y: content.y + content.h * 0.12 + shiftY,
            w: content.w * 0.5,
            h: content.h * 0.25
          },
          { emphasis: 1.18, z: 31, rotation: rotation(c, 0.5) }
        );
      } else if (c.focal) {
        c.place(
          c.focal,
          {
            x: content.x + content.w * 0.12 + shiftX,
            y: content.y + content.h * 0.12 + shiftY,
            w: content.w * 0.5,
            h: content.h * 0.25
          },
          { z: 31, rotation: rotation(c, 0.5) }
        );
      }
      if (v && !c.isPlaced(v)) {
        c.place(
          v,
          {
            x: content.x + content.w * 0.63,
            y: content.y + content.h * 0.4,
            w: content.w * 0.32,
            h: content.h * 0.33
          },
          { fit: "fill", z: 8, rotation: rotation(c, 0.65) }
        );
      }
      if (a) {
        c.place(
          a,
          {
            x: content.x + content.w * 0.02,
            y: content.y + content.h * 0.72,
            w: content.w * 0.2,
            h: content.h * 0.06
          },
          { z: 34, rotation: rotation(c, 0.9) }
        );
      }
      c.placeSupport(
        {
          x: content.x + content.w * 0.06,
          y: content.y + content.h * 0.8,
          w: content.w * 0.62,
          h: content.h * 0.13
        },
        { columns: 4, emphasis: 0.84, z: 27 }
      );
      for (let index = 0; index < 4; index += 1) {
        c.decor(
          "dot",
          {
            x: content.x + content.w * (0.08 + index * 0.21),
            y: content.y + content.h * (index % 2 ? 0.38 : 0.68),
            w: Math.max(6, c.width * 6e-3),
            h: Math.max(6, c.width * 6e-3)
          },
          index === 1 ? c.palette.accent : c.palette.ink,
          { z: 20 }
        );
      }
      c.decor(
        "bar",
        {
          x: content.x,
          y: content.y + content.h * 0.38,
          w: content.w * 0.32,
          h: Math.max(1, c.height * 18e-4)
        },
        c.palette.ink,
        { z: 17, rotation: rotation(c, 0.4) }
      );
      addIndex(c, "tr", `ANCHORS / ${String(c.settings.seed).slice(-3)}`);
    }
  };
  var chaosGrammars = [
    hybridSplit,
    collisionField,
    fracture,
    anchorField
  ];

  // src/engine/planner.ts
  var GRAMMARS = Object.fromEntries(
    [
      ...brutalistGrammars,
      ...swissGrammars,
      ...minimalGrammars,
      ...maximalGrammars,
      ...antigridGrammars,
      ...chaosGrammars
    ].map((grammar) => [grammar.id, grammar])
  );
  var GRAMMARS_BY_PRESET = {
    brutalist: brutalistGrammars,
    swiss: swissGrammars,
    minimal: minimalGrammars,
    maximal: maximalGrammars,
    antigrid: antigridGrammars,
    chaos: chaosGrammars
  };
  function effectiveSeed(base, preset, salt, variationIndex) {
    return hashString(`${base}:${preset}:${salt}:${variationIndex}`) % 8999999 + 1;
  }
  function buildCandidate(snapshot, settings, grammar, seed, width, height, dnaOverride) {
    const rng = createRng(seed);
    const dna = dnaOverride ? __spreadProps(__spreadValues({}, dnaOverride), {
      // A small deterministic nudge keeps four offspring from sharing the
      // exact same inherited geometry.
      margin: Math.max(0.018, dnaOverride.margin + (rng() - 0.5) * 0.01),
      asymmetry: Math.max(-0.8, Math.min(0.9, dnaOverride.asymmetry + (rng() - 0.5) * 0.06)),
      rotation: Math.max(0, dnaOverride.rotation + (rng() - 0.5) * 1.4),
      split: Math.max(0.32, Math.min(0.72, dnaOverride.split + (rng() - 0.5) * 0.04))
    }) : deriveDna(settings.preset, settings, rng);
    const palette = buildPalette(snapshot, settings.preset, settings, dna, rng);
    const composer = new Composer(snapshot, settings, dna, palette, rng, width, height);
    try {
      grammar.build(composer);
    } catch (error) {
      composer.warnings.push(
        `Grammar ${grammar.id} stopped early: ${error instanceof Error ? error.message : "unknown layout error"}`
      );
    }
    const plan = composer.finish(
      {
        grammarId: grammar.id,
        grammarName: grammar.name || PRESET_GRAMMAR_NAMES[grammar.id] || grammar.id,
        seed
      },
      0,
      {}
    );
    return plan;
  }
  function finishPlan(plan, snapshot) {
    const scored = scorePlan(plan, snapshot);
    return __spreadProps(__spreadValues({}, plan), {
      score: scored.total,
      scoreParts: scored.parts,
      warnings: [...plan.warnings, ...scored.issues.slice(0, 4)]
    });
  }
  function buildSafePlan(snapshot, settings, seed, width, height) {
    var _a, _b;
    const rng = createRng(seed);
    const dna = __spreadProps(__spreadValues({}, deriveDna(settings.preset, __spreadProps(__spreadValues({}, settings), { chaos: 20, density: 42 }), rng)), {
      margin: 0.07,
      rotation: 0,
      alignment: "left",
      asymmetry: 0
    });
    const palette = buildPalette(snapshot, settings.preset, settings, dna, rng);
    const composer = new Composer(snapshot, settings, dna, palette, rng, width, height);
    const content = composer.content;
    const headlineBlock = (_b = (_a = snapshot.blocks.find((block) => block.role === "headline")) != null ? _a : snapshot.blocks.find((block) => block.role === "visual")) != null ? _b : snapshot.blocks[0];
    const visualBlock = snapshot.blocks.find((block) => block.role === "visual");
    if (headlineBlock) {
      composer.place(
        headlineBlock,
        {
          x: content.x,
          y: content.y,
          w: content.w * 0.92,
          h: content.h * 0.3
        },
        { z: 31, emphasis: 1.06 }
      );
    }
    if (visualBlock && !composer.isPlaced(visualBlock)) {
      composer.place(
        visualBlock,
        {
          x: content.x,
          y: content.y + content.h * 0.36,
          w: content.w * 0.52,
          h: content.h * 0.34
        },
        { z: 8, fit: "contain" }
      );
    }
    const remaining = composer.remaining;
    if (remaining.length) {
      composer.placeSupport(
        {
          x: content.x + content.w * 0.56,
          y: content.y + content.h * 0.36,
          w: content.w * 0.44,
          h: content.h * 0.34
        },
        { columns: 2, emphasis: 0.88, z: 27 }
      );
    }
    if (composer.remaining.length) {
      composer.placeSupport(
        {
          x: content.x,
          y: content.y + content.h * 0.73,
          w: content.w,
          h: content.h * 0.22
        },
        { columns: 4, emphasis: 0.82, z: 27 }
      );
    }
    composer.decor(
      "rule",
      {
        x: content.x,
        y: content.y + content.h * 0.33,
        w: content.w,
        h: Math.max(2, height * 3e-3)
      },
      palette.ink,
      { z: 17 }
    );
    composer.decor(
      "bar",
      {
        x: content.x,
        y: content.y + content.h * 0.71,
        w: content.w * 0.22,
        h: Math.max(6, height * 0.01)
      },
      palette.accent,
      { z: 18 }
    );
    return finishPlan(
      composer.finish(
        {
          grammarId: `${settings.preset}-safe`,
          grammarName: "Safe composition",
          seed
        },
        0,
        {}
      ),
      snapshot
    );
  }
  function buildDensePlan(snapshot, settings, seed, width, height, variant) {
    var _a, _b;
    const rng = createRng(seed);
    const base = deriveDna(settings.preset, settings, rng);
    const dna = __spreadProps(__spreadValues({}, base), {
      margin: 0.035,
      gutter: Math.max(8e-3, base.gutter * 0.75),
      rotation: 0,
      decorative: Math.min(0.45, base.decorative),
      alignment: variant % 2 === 0 ? "left" : "mixed"
    });
    const palette = buildPalette(snapshot, settings.preset, settings, dna, rng);
    const composer = new Composer(snapshot, settings, dna, palette, rng, width, height);
    const content = composer.content;
    const header = (_b = (_a = snapshot.blocks.find((block) => block.role === "headline")) != null ? _a : snapshot.blocks.find((block) => block.role === "visual")) != null ? _b : snapshot.blocks[0];
    if (header) {
      composer.place(
        header,
        {
          x: content.x,
          y: content.y,
          w: content.w * (variant === 3 ? 0.72 : 0.92),
          h: content.h * 0.14
        },
        {
          z: 31,
          emphasis: 1.04,
          align: variant === 3 ? "RIGHT" : "LEFT"
        }
      );
    }
    const gridBlocks = snapshot.blocks.filter((block) => block.id !== (header == null ? void 0 : header.id));
    const visual2 = gridBlocks.find((block) => block.role === "visual");
    const columns = [6, 7, 5, 8][variant % 4];
    const rows = Math.max(
      3,
      Math.ceil((gridBlocks.length + 3) / columns) + 1
    );
    const top = content.y + content.h * (header ? 0.18 : 0.02);
    const grid = {
      x: content.x,
      y: top,
      w: content.w,
      h: Math.max(80, content.y + content.h - top)
    };
    const gap = Math.max(6, Math.round(composer.gutterPx));
    const cellW = (grid.w - gap * (columns - 1)) / columns;
    const cellH = (grid.h - gap * (rows - 1)) / rows;
    const occupied = Array.from(
      { length: rows },
      () => Array.from({ length: columns }, () => false)
    );
    const cellRect = (col, row, colSpan = 1, rowSpan = 1) => ({
      x: grid.x + col * (cellW + gap),
      y: grid.y + row * (cellH + gap),
      w: cellW * colSpan + gap * (colSpan - 1),
      h: cellH * rowSpan + gap * (rowSpan - 1)
    });
    const claim = (col, row, colSpan = 1, rowSpan = 1) => {
      for (let r = row; r < Math.min(rows, row + rowSpan); r += 1) {
        for (let c = col; c < Math.min(columns, col + colSpan); c += 1) {
          occupied[r][c] = true;
        }
      }
    };
    const free = (col, row, colSpan = 1, rowSpan = 1) => {
      if (col + colSpan > columns || row + rowSpan > rows) return false;
      for (let r = row; r < row + rowSpan; r += 1) {
        for (let c = col; c < col + colSpan; c += 1) {
          if (occupied[r][c]) return false;
        }
      }
      return true;
    };
    const nextFree = (colSpan = 1, rowSpan = 1) => {
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < columns; col += 1) {
          if (free(col, row, colSpan, rowSpan)) return { col, row };
        }
      }
      return null;
    };
    if (visual2 && gridBlocks.length <= 34) {
      const span = variant === 1 ? { w: Math.min(3, columns), h: 1 } : variant === 2 ? { w: 2, h: 2 } : { w: 2, h: 2 };
      const spot = nextFree(span.w, span.h);
      if (spot) {
        claim(spot.col, spot.row, span.w, span.h);
        composer.place(
          visual2,
          cellRect(spot.col, spot.row, span.w, span.h),
          { z: 8, fit: "fill" }
        );
      }
    }
    for (const block of gridBlocks) {
      if (composer.isPlaced(block)) continue;
      const spot = nextFree(1, 1);
      if (!spot) {
        composer.place(
          block,
          {
            x: content.x,
            y: content.y + content.h * 0.88,
            w: content.w / 4,
            h: content.h * 0.1
          },
          { z: 27, emphasis: 0.8 }
        );
        continue;
      }
      claim(spot.col, spot.row);
      composer.place(block, cellRect(spot.col, spot.row), {
        z: 27,
        emphasis: block.role === "action" ? 0.95 : 0.88,
        align: variant % 2 === 0 ? "LEFT" : "RIGHT"
      });
    }
    composer.rule("h", content.y + content.h * 0.155, {
      thickness: Math.max(2, height * 35e-4),
      color: palette.accent,
      z: 18
    });
    composer.decor(
      "bar",
      {
        x: content.x,
        y: content.y + content.h * 0.965,
        w: content.w * 0.3,
        h: Math.max(4, height * 7e-3)
      },
      palette.accent,
      { z: 19 }
    );
    composer.decor("index", {
      x: content.x + content.w * 0.94,
      y: content.y + content.h * 0.97,
      w: content.w * 0.06,
      h: height * 0.02
    }, palette.ink, {
      label: `${String(seed).slice(-3)} / ${columns}\xD7${rows}`,
      z: 45
    });
    return finishPlan(
      composer.finish(
        {
          grammarId: `dense-index-${variant + 1}`,
          grammarName: "Dense index",
          seed
        },
        0,
        {}
      ),
      snapshot
    );
  }
  function generatePlans(snapshot, rawSettings, options = {}) {
    var _a, _b, _c, _d, _e, _f;
    const settings = sanitizeSettings(rawSettings);
    const count = Math.max(1, Math.min(6, (_a = options.count) != null ? _a : 4));
    const grammarPool = ((_b = options.grammarIds) == null ? void 0 : _b.length) ? options.grammarIds.map((id) => GRAMMARS[id]).filter((grammar) => Boolean(grammar)) : GRAMMARS_BY_PRESET[settings.preset];
    const pool = grammarPool.length ? grammarPool : GRAMMARS_BY_PRESET[settings.preset];
    const { width, height } = outputDimensions(
      snapshot.width,
      snapshot.height,
      settings.outputSize
    );
    const warnings = [];
    const accepted = [];
    const salt = (_c = options.salt) != null ? _c : "batch";
    const dense = snapshot.blocks.length > 18;
    if (dense) {
      warnings.push(
        "This is a dense composition. GRID CRIMES/ uses its editorial index layout so every element stays legible and editable."
      );
    }
    for (let variation = 0; variation < count; variation += 1) {
      const seed = effectiveSeed(settings.seed, settings.preset, salt, variation);
      if (dense) {
        const plan = buildDensePlan(
          snapshot,
          settings,
          seed,
          width,
          height,
          variation
        );
        accepted.push(plan);
        continue;
      }
      const usedGrammars = new Set(accepted.map((plan) => plan.grammarId));
      const unusedPool = pool.filter((grammar) => !usedGrammars.has(grammar.id));
      const candidatePool = unusedPool.length ? unusedPool : pool;
      const primaryGrammar = candidatePool[variation % candidatePool.length];
      const fallbackGrammar = candidatePool.find(
        (grammar) => grammar !== primaryGrammar
      );
      const candidateGrammars = fallbackGrammar ? [primaryGrammar, fallbackGrammar] : [primaryGrammar];
      const candidates = [];
      for (const grammar of candidateGrammars) {
        const attempts = grammar === primaryGrammar ? 3 : 2;
        for (let attempt = 0; attempt < attempts; attempt += 1) {
          const attemptSeed = hashString(`${seed}:${grammar.id}:${attempt}`) % 8999999 + 1;
          const candidate = finishPlan(
            buildCandidate(
              snapshot,
              settings,
              grammar,
              attemptSeed,
              width,
              height,
              (_d = options.dnaForVariation) == null ? void 0 : _d.call(options, variation, attemptSeed)
            ),
            snapshot
          );
          candidate.warnings = [...candidate.warnings];
          candidates.push(candidate);
        }
      }
      let best = null;
      let bestValue = -Infinity;
      for (const candidate of candidates) {
        const scored = scorePlan(candidate, snapshot);
        const diversityPenalty = accepted.reduce((max, plan) => Math.max(max, 1 - layoutDistance(candidate, plan)), 0) * 14;
        const value = scored.total - diversityPenalty + (scored.valid ? 12 : 0) + (candidate.grammarId === primaryGrammar.id ? 2 : 0);
        if (value > bestValue) {
          best = candidate;
          bestValue = value;
        }
      }
      if (!best || scorePlan(best, snapshot).total < 52 || !scorePlan(best, snapshot).valid) {
        const safe = buildSafePlan(snapshot, settings, seed, width, height);
        if (!best || scorePlan(safe, snapshot).total > scorePlan(best, snapshot).total || !scorePlan(best, snapshot).valid) {
          best = safe;
          warnings.push(
            `Variation ${variation + 1} used the safe layout because the expressive candidates violated a hard constraint.`
          );
        }
      }
      if (best) {
        const scored = scorePlan(best, snapshot);
        best.score = scored.total;
        best.scoreParts = scored.parts;
        accepted.push(best);
      }
    }
    const uniqueGrammars = new Set(accepted.map((plan) => plan.grammarId));
    if (uniqueGrammars.size < Math.min(count, pool.length)) {
      warnings.push(
        "Some variations share a grammar because the available content did not support every layout archetype."
      );
    }
    return {
      plans: accepted,
      warnings: [...new Set(warnings)],
      effectiveSeed: (_f = (_e = accepted[0]) == null ? void 0 : _e.seed) != null ? _f : settings.seed
    };
  }
  function grammarsForPreset(preset) {
    return PRESETS[preset].grammarIds;
  }

  // src/engine/crossbreed/crossbreed.ts
  function canCrossbreed(a, b) {
    if (a.frameId === b.frameId) {
      return { ok: false, reason: "Choose two different parents." };
    }
    if (a.sourceFingerprint !== b.sourceFingerprint) {
      return {
        ok: false,
        reason: "These variations came from different source structures. Crossbreed needs two directions built from the same composition."
      };
    }
    if (a.preset === b.preset && a.grammar === b.grammar) {
      return {
        ok: false,
        reason: "These two variations already share the same engine. Regenerate one or pick a different parent."
      };
    }
    return { ok: true };
  }
  function mixDna(a, b, inheritance, rng, variation = 0) {
    const t = clamp(inheritance / 100, 0, 1);
    const jitter = (amount) => (rng() - 0.5) * amount;
    const numeric = (key, amount = 0) => {
      const left = a[key];
      const right2 = b[key];
      return lerp(left, right2, t) + jitter(amount);
    };
    return {
      margin: clamp(numeric("margin", 8e-3), 0.018, 0.25),
      columns: Math.max(3, Math.round(numeric("columns", 0))),
      gutter: clamp(numeric("gutter", 3e-3), 6e-3, 0.05),
      asymmetry: clamp(numeric("asymmetry", 0.05), -0.8, 0.9),
      rotation: clamp(numeric("rotation", 0.7), 0, 16),
      scaleContrast: clamp(numeric("scaleContrast", 0.04), 0.15, 1),
      decorative: clamp(numeric("decorative", 0.05), 0.01, 1),
      occupancy: clamp(numeric("occupancy", 0.03), 0.12, 0.96),
      alignment: t < 0.34 ? a.alignment : t > 0.66 ? b.alignment : pick(rng, [a.alignment, b.alignment, "mixed"]),
      split: clamp(numeric("split", 0.03), 0.32, 0.72),
      backgroundMode: t < 0.4 ? a.backgroundMode : t > 0.6 ? b.backgroundMode : pick(rng, [a.backgroundMode, b.backgroundMode]),
      colorStrategy: t < 0.33 ? a.colorStrategy : t > 0.67 ? b.colorStrategy : variation % 2 === 0 ? a.colorStrategy : b.colorStrategy
    };
  }
  function crossbreedPlans(snapshot, parentA, parentB, options) {
    var _a;
    const compatibility = canCrossbreed(parentA, parentB);
    if (!compatibility.ok) throw new Error(compatibility.reason);
    if (parentA.sourceFingerprint !== snapshot.fingerprint) {
      throw new Error(
        "The current source no longer matches these parents. Crossbreed from the generated frames instead, or regenerate the batch."
      );
    }
    const inheritance = clamp(options.inheritance, 0, 100);
    const t = inheritance / 100;
    const settings = sanitizeSettings(__spreadProps(__spreadValues({}, options.settings), {
      preset: t < 0.5 ? parentA.preset : parentB.preset,
      chaos: Math.round(lerp(parentA.settings.chaos, parentB.settings.chaos, t)),
      density: Math.round(lerp(parentA.settings.density, parentB.settings.density, t)),
      hierarchy: Math.round(lerp(parentA.settings.hierarchy, parentB.settings.hierarchy, t)),
      seed: hashString(
        `${options.settings.seed}:${parentA.seed}:${parentB.seed}:${inheritance}`
      ) % 8999999 + 1
    }));
    const baseSeed = settings.seed;
    const grammarPool = hybridGrammarPool(parentA, parentB, t);
    const count = Math.max(1, Math.min(4, (_a = options.count) != null ? _a : 4));
    let firstDna = null;
    const dnaForVariation = (_index, seed) => {
      const rng = createRng(seed);
      const dna = mixDna(parentA.dna, parentB.dna, inheritance, rng, _index);
      if (!firstDna) firstDna = dna;
      return dna;
    };
    const result = generatePlans(
      snapshot,
      __spreadProps(__spreadValues({}, settings), { seed: baseSeed }),
      {
        count,
        grammarIds: grammarPool,
        salt: `cross:${parentA.frameId}:${parentB.frameId}:${inheritance}`,
        dnaForVariation
      }
    );
    return __spreadProps(__spreadValues({}, result), {
      settings,
      dna: firstDna != null ? firstDna : mixDna(parentA.dna, parentB.dna, inheritance, createRng(baseSeed)),
      grammarPool
    });
  }
  function hybridGrammarPool(a, b, t) {
    const aPool = grammarsForPreset(a.preset);
    const bPool = grammarsForPreset(b.preset);
    const aGrammar = aPool.includes(a.grammar) ? a.grammar : aPool[0];
    const bGrammar = bPool.includes(b.grammar) ? b.grammar : bPool[0];
    const pool = [];
    const push = (id) => {
      if (id && !pool.includes(id)) pool.push(id);
    };
    if (t <= 0.5) {
      push(aGrammar);
      push(bGrammar);
    } else {
      push(bGrammar);
      push(aGrammar);
    }
    for (let index = 1; index < Math.max(aPool.length, bPool.length); index += 1) {
      if (t <= 0.5) {
        push(aPool[index % aPool.length]);
        push(bPool[index % bPool.length]);
      } else {
        push(bPool[index % bPool.length]);
        push(aPool[index % aPool.length]);
      }
    }
    return pool.slice(0, 6);
  }
  function crossbreedName(a, b) {
    var _a, _b, _c, _d;
    return `${(_b = (_a = PRESETS[a.preset]) == null ? void 0 : _a.name) != null ? _b : a.preset} \xD7 ${(_d = (_c = PRESETS[b.preset]) == null ? void 0 : _c.name) != null ? _d : b.preset}`;
  }
  function inheritanceLabel(inheritance, a, b) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (inheritance <= 12) return `${(_b = (_a = PRESETS[a.preset]) == null ? void 0 : _a.name) != null ? _b : a.preset} dominant`;
    if (inheritance >= 88) return `${(_d = (_c = PRESETS[b.preset]) == null ? void 0 : _c.name) != null ? _d : b.preset} dominant`;
    if (inheritance < 40) return `Leaning ${(_f = (_e = PRESETS[a.preset]) == null ? void 0 : _e.name) != null ? _f : a.preset}`;
    if (inheritance > 60) return `Leaning ${(_h = (_g = PRESETS[b.preset]) == null ? void 0 : _g.name) != null ? _h : b.preset}`;
    return "Equal inheritance";
  }

  // src/engine/analyze.ts
  var HEADLINE_NAME = /(headline|head\b|hero|title|display|h1\b|masthead)/i;
  var SUBHEAD_NAME = /(subhead|subtitle|deck|standfirst|h2\b|intro)/i;
  var BODY_NAME = /(body|copy|paragraph|description|text|story|article|blurb)/i;
  var ACTION_NAME = /(button|cta|action|submit|sign\s?up|link)/i;
  var LABEL_NAME = /(label|meta|caption|eyebrow|kicker|tag|date|credit|footnote|nav)/i;
  var VISUAL_NAME = /(image|photo|visual|picture|img|media|thumbnail|cover|artwork)/i;
  var DECOR_NAME = /(line|rule|divider|dot|stamp|badge|shape|decor|ornament|mark)/i;
  function isThin(bounds) {
    return bounds.w < 10 || bounds.h < 10 || bounds.w / Math.max(1, bounds.h) > 18 || bounds.h / Math.max(1, bounds.w) > 18;
  }
  function shortText(text) {
    return Boolean(text && text.length > 0 && text.length <= 48);
  }
  function inferRoles(blocks) {
    var _a, _b, _c, _d;
    const result = blocks.map((block) => {
      var _a2;
      return __spreadProps(__spreadValues({}, block), {
        role: (_a2 = block.role) != null ? _a2 : "module"
      });
    });
    const textBlocks = result.filter((block) => block.text).sort(
      (a, b) => {
        var _a2, _b2, _c2, _d2;
        return ((_b2 = (_a2 = b.text) == null ? void 0 : _a2.fontSize) != null ? _b2 : 0) - ((_d2 = (_c2 = a.text) == null ? void 0 : _c2.fontSize) != null ? _d2 : 0) || b.bounds.w * b.bounds.h - a.bounds.w * a.bounds.h;
      }
    );
    const namedHeadline = textBlocks.find((block) => HEADLINE_NAME.test(block.name));
    const largest = textBlocks[0];
    const headline2 = namedHeadline != null ? namedHeadline : largest && ((_b = (_a = largest.text) == null ? void 0 : _a.fontSize) != null ? _b : 0) >= 20 ? largest : null;
    let subhead = null;
    const namedSubhead = textBlocks.find(
      (block) => block !== headline2 && SUBHEAD_NAME.test(block.name)
    );
    if (namedSubhead) subhead = namedSubhead;
    else {
      const candidates = textBlocks.filter(
        (block) => {
          var _a2, _b2, _c2, _d2;
          return block !== headline2 && ((_b2 = (_a2 = block.text) == null ? void 0 : _a2.fontSize) != null ? _b2 : 0) >= Math.max(15, ((_d2 = (_c2 = headline2 == null ? void 0 : headline2.text) == null ? void 0 : _c2.fontSize) != null ? _d2 : 28) * 0.38);
        }
      );
      if (candidates.length && ((_d = (_c = candidates[0].text) == null ? void 0 : _c.length) != null ? _d : 0) < 180) {
        subhead = candidates[0];
      }
    }
    for (const block of result) {
      const area2 = block.bounds.w * block.bounds.h;
      if (block === headline2) {
        block.role = "headline";
        continue;
      }
      if (block === subhead) {
        block.role = "subhead";
        continue;
      }
      if (ACTION_NAME.test(block.name) && (shortText(block.text) || block.childCount > 0)) {
        block.role = "action";
        continue;
      }
      if (block.text) {
        const size = block.text.fontSize;
        const length = block.text.length;
        if (LABEL_NAME.test(block.name) || size <= 13 && length <= 120) {
          block.role = "label";
        } else if (BODY_NAME.test(block.name) || length > 90 || size <= 19) {
          block.role = "body";
        } else if (length <= 70 && size >= 18) {
          block.role = "subhead";
        } else {
          block.role = "body";
        }
        continue;
      }
      if ((VISUAL_NAME.test(block.name) || block.hasImage) && !isThin(block.bounds)) {
        block.role = "visual";
        continue;
      }
      if (DECOR_NAME.test(block.name) && area2 < 0.02 * 1e6) {
        block.role = "decoration";
        continue;
      }
      if (isThin(block.bounds) || area2 < result.reduce((sum, b) => sum + b.bounds.w * b.bounds.h, 0) * 3e-3) {
        block.role = "decoration";
        continue;
      }
      if ((block.isInstance || block.isAutoLayout || block.childCount > 1) && shortText(block.text)) {
        block.role = "action";
        continue;
      }
      if ((block.sourceType === "RECTANGLE" || block.sourceType === "ELLIPSE" || block.sourceType === "VECTOR" || block.sourceType === "POLYGON" || block.sourceType === "STAR") && !block.text) {
        block.role = area2 > 0.025 * 1e6 ? "visual" : "decoration";
        continue;
      }
      if (block.childCount >= 1 || block.isInstance) {
        block.role = "module";
        continue;
      }
      block.role = "decoration";
    }
    for (const block of result) {
      if (block.role === "label" && block.text && block.text.length <= 28 && block.hasSolidFill && block.fillColors.length > 0 && block.bounds.w >= 60 && block.bounds.w <= 360 && block.bounds.h >= 28 && block.bounds.h <= 110) {
        block.role = "action";
      }
    }
    if (!result.some((block) => block.role === "visual")) {
      const candidate = result.filter((block) => block.hasImage).sort((a, b) => b.bounds.w * b.bounds.h - a.bounds.w * a.bounds.h)[0];
      if (candidate) candidate.role = "visual";
    }
    if (!result.some((block) => block.role === "headline")) {
      const focal = [...result].sort(
        (a, b) => b.bounds.w * b.bounds.h - a.bounds.w * a.bounds.h
      )[0];
      if (focal) focal.role = "subhead";
    }
    return result;
  }
  function buildSnapshot(raw, options = {}) {
    const blocks = options.preserveRoles ? raw.blocks.map((block) => {
      var _a;
      return __spreadProps(__spreadValues({}, block), {
        role: (_a = block.role) != null ? _a : "module"
      });
    }) : inferRoles(raw.blocks);
    const roleCounts = emptyRoleCounts();
    const totalArea = Math.max(1, raw.width * raw.height);
    const enriched = blocks.map((block) => {
      var _a, _b;
      roleCounts[block.role] += 1;
      return {
        id: block.id,
        name: block.name,
        sourceType: block.sourceType,
        role: block.role,
        bounds: {
          x: round(block.bounds.x),
          y: round(block.bounds.y),
          w: round(block.bounds.w),
          h: round(block.bounds.h)
        },
        rotation: round(block.rotation),
        areaShare: round(block.bounds.w * block.bounds.h / totalArea, 4),
        text: (_a = block.text) != null ? _a : void 0,
        hasImage: block.hasImage,
        hasVector: block.hasVector,
        hasSolidFill: block.hasSolidFill,
        fillColors: block.fillColors,
        isInstance: block.isInstance,
        isAutoLayout: block.isAutoLayout,
        childCount: block.childCount,
        resizeMode: block.resizeMode,
        canColorize: block.canColorize,
        canRotate: block.canRotate,
        hasMissingFont: (_b = block.hasMissingFont) != null ? _b : false
      };
    });
    const structure = enriched.map(
      (block) => `${block.role}:${block.sourceType}:${Math.round(
        block.bounds.w / Math.max(1, raw.width) * 100
      )}x${Math.round(block.bounds.h / Math.max(1, raw.height) * 100)}`
    ).join("|");
    return {
      version: 1,
      selectionKind: raw.selectionKind,
      name: raw.name,
      sourceIds: raw.sourceIds,
      width: raw.width,
      height: raw.height,
      background: raw.background,
      palette: raw.palette,
      blocks: enriched,
      fonts: collectFonts(enriched),
      warnings: raw.warnings,
      roleCounts,
      fingerprint: fingerprint(structure),
      analyzedAt: Date.now()
    };
  }
  function collectFonts(blocks) {
    var _a, _b;
    const fonts = /* @__PURE__ */ new Map();
    for (const block of blocks) {
      for (const font of (_b = (_a = block.text) == null ? void 0 : _a.fonts) != null ? _b : []) {
        fonts.set(`${font.family}::${font.style}`, font);
      }
    }
    return [...fonts.values()];
  }
  function inspectSnapshot(snapshot) {
    const warnings = [...snapshot.warnings];
    if (snapshot.blocks.length > 30) {
      warnings.push(
        `${snapshot.blocks.length} elements is beyond the comfortable v1 limit of 30. The composition will be simplified into supporting zones.`
      );
    }
    if (snapshot.blocks.length === 1) {
      warnings.push(
        "Only one element was found. The result will be a single-focal composition rather than a full layout."
      );
    }
    if (!snapshot.blocks.some((block) => block.role === "headline")) {
      warnings.push(
        "No clear headline was detected. Use the role controls to promote the strongest text layer."
      );
    }
    const missing = snapshot.blocks.filter(
      (block) => {
        var _a;
        return ((_a = block.text) == null ? void 0 : _a.hasMissingFont) || block.hasMissingFont;
      }
    );
    if (missing.length) {
      warnings.push(
        `${missing.length} text layer${missing.length === 1 ? " uses" : "s use"} an unavailable font. Their formatting will be preserved without typographic changes.`
      );
    }
    return [...new Set(warnings)];
  }

  // src/main/analysis.ts
  var MAX_BLOCKS = 30;
  var MAX_SCAN_NODES = 90;
  var FRAME_TYPES = /* @__PURE__ */ new Set(["FRAME", "GROUP", "SECTION", "COMPONENT"]);
  var SUPPORTED_BLOCK_TYPES = /* @__PURE__ */ new Set([
    "TEXT",
    "FRAME",
    "GROUP",
    "COMPONENT",
    "COMPONENT_SET",
    "INSTANCE",
    "RECTANGLE",
    "ELLIPSE",
    "POLYGON",
    "VECTOR",
    "STAR",
    "LINE",
    "BOOLEAN_OPERATION",
    "SECTION"
  ]);
  function isVisible(node) {
    return !node.removed && node.visible;
  }
  function absoluteBounds(node) {
    try {
      const box = node.absoluteBoundingBox;
      if (!box) return null;
      return { x: box.x, y: box.y, w: box.width, h: box.height };
    } catch (e) {
      return null;
    }
  }
  function hasChildren(node) {
    return "children" in node;
  }
  function paintsOf(node) {
    try {
      const fills = node.fills;
      return Array.isArray(fills) ? fills : [];
    } catch (e) {
      return [];
    }
  }
  function colorFromPaint(paint) {
    var _a, _b;
    if (paint.type === "SOLID" && paint.visible !== false) {
      const opacity = (_a = paint.opacity) != null ? _a : 1;
      if (opacity < 0.18) return null;
      return figmaColorToHex(paint.color);
    }
    if (paint.type === "GRADIENT_LINEAR" || paint.type === "GRADIENT_RADIAL" || paint.type === "GRADIENT_ANGULAR" || paint.type === "GRADIENT_DIAMOND") {
      const stop = (_b = paint.gradientStops) == null ? void 0 : _b[0];
      if (stop) return figmaColorToHex(stop.color);
    }
    return null;
  }
  function collectFills(node, depth = 0, visited = { count: 0 }) {
    if (depth > 3 || visited.count > MAX_SCAN_NODES) return [];
    visited.count += 1;
    const colors = [];
    for (const paint of paintsOf(node)) {
      const color = colorFromPaint(paint);
      if (color) colors.push(color);
    }
    if (hasChildren(node) && node.type !== "INSTANCE") {
      for (const child of node.children) {
        if (!isVisible(child)) continue;
        colors.push(...collectFills(child, depth + 1, visited));
      }
    }
    return colors;
  }
  function deepFlags(node, depth = 0, visited = { count: 0 }) {
    var _a;
    if (depth > 3 || visited.count > MAX_SCAN_NODES) {
      return {
        hasImage: false,
        hasVector: false,
        hasSolid: false,
        hasText: false,
        hasMissingFont: false
      };
    }
    visited.count += 1;
    let hasImage = false;
    let hasVector = false;
    let hasSolid = false;
    let hasText = node.type === "TEXT";
    let hasMissingFont = node.type === "TEXT" && node.hasMissingFont;
    for (const paint of paintsOf(node)) {
      if (paint.type === "IMAGE" && paint.visible !== false) hasImage = true;
      if (paint.type === "SOLID" && ((_a = paint.opacity) != null ? _a : 1) > 0.2) hasSolid = true;
    }
    if (node.type === "VECTOR" || node.type === "BOOLEAN_OPERATION" || node.type === "STAR" || node.type === "POLYGON" || node.type === "LINE" || node.type === "TEXT_PATH") {
      hasVector = true;
    }
    if (hasChildren(node) && node.type !== "INSTANCE") {
      for (const child of node.children) {
        if (!isVisible(child)) continue;
        const flags = deepFlags(child, depth + 1, visited);
        hasImage || (hasImage = flags.hasImage);
        hasVector || (hasVector = flags.hasVector);
        hasSolid || (hasSolid = flags.hasSolid);
        hasText || (hasText = flags.hasText);
        hasMissingFont || (hasMissingFont = flags.hasMissingFont);
      }
    }
    return { hasImage, hasVector, hasSolid, hasText, hasMissingFont };
  }
  function numericOr(value, fallback) {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
  }
  function readTextMeta(node) {
    var _a;
    const characters = (_a = node.characters) != null ? _a : "";
    let fonts = [];
    try {
      fonts = node.getRangeAllFontNames(0, Math.max(1, characters.length)).map((font) => ({ family: font.family, style: font.style }));
    } catch (e) {
      const font = node.fontName;
      if (font && font !== figma.mixed) {
        fonts = [{ family: font.family, style: font.style }];
      }
    }
    let fontSize = 16;
    let mixedFontSize = false;
    if (node.fontSize === figma.mixed) {
      mixedFontSize = true;
      try {
        const segments = node.getStyledTextSegments(["fontSize"]);
        fontSize = segments.reduce(
          (max, segment) => Math.max(max, numericOr(segment.fontSize, 0)),
          16
        );
      } catch (e) {
        fontSize = 16;
      }
    } else {
      fontSize = numericOr(node.fontSize, 16);
    }
    const lineHeight = node.lineHeight === figma.mixed ? null : node.lineHeight;
    const letterSpacing = node.letterSpacing === figma.mixed ? null : node.letterSpacing;
    return {
      characters,
      sample: characters.replace(/\s+/g, " ").slice(0, 80),
      length: characters.length,
      fontSize,
      lineHeight: lineHeight && lineHeight.unit === "PIXELS" ? lineHeight.value : lineHeight && lineHeight.unit === "PERCENT" ? fontSize * lineHeight.value / 100 : null,
      letterSpacing: (letterSpacing == null ? void 0 : letterSpacing.unit) === "PIXELS" ? letterSpacing.value : null,
      textCase: typeof node.textCase === "string" ? node.textCase : null,
      fonts,
      hasMissingFont: node.hasMissingFont,
      mixedFontSize
    };
  }
  function resizeModeFor(node) {
    if (node.type === "TEXT") return "text";
    if (node.type === "INSTANCE") return "rescale";
    if (node.type === "VECTOR" || node.type === "BOOLEAN_OPERATION" || node.type === "STAR" || node.type === "POLYGON" || node.type === "LINE" || node.type === "TEXT_PATH") {
      return "rescale";
    }
    if (hasChildren(node) && node.children.length > 0) return "rescale";
    return "frame";
  }
  function isInsideInstance(node) {
    let parent = node.parent;
    while (parent) {
      if (parent.type === "INSTANCE") return true;
      parent = parent.parent;
    }
    return false;
  }
  function rawBlockFromNode(node, origin, forcedRole) {
    if (node.type === "SLICE" || node.type === "CONNECTOR" || node.removed || !SUPPORTED_BLOCK_TYPES.has(node.type) || isInsideInstance(node)) {
      return null;
    }
    const bounds = absoluteBounds(node);
    if (!bounds || bounds.w < 1 || bounds.h < 1) return null;
    const text = node.type === "TEXT" ? readTextMeta(node) : null;
    const flags = deepFlags(node);
    const fills = collectFills(node);
    const children = hasChildren(node) ? node.children.length : 0;
    const hasTextDescendant = flags.hasText;
    const isInstance = node.type === "INSTANCE";
    const isAutoLayout = hasChildren(node) && "layoutMode" in node && node.layoutMode !== "NONE";
    return {
      id: node.id,
      name: node.name,
      sourceType: node.type,
      role: forcedRole,
      bounds: {
        x: bounds.x - origin.x,
        y: bounds.y - origin.y,
        w: bounds.w,
        h: bounds.h
      },
      rotation: "rotation" in node ? node.rotation : 0,
      text,
      hasImage: flags.hasImage,
      hasVector: flags.hasVector,
      hasSolidFill: flags.hasSolid || fills.length > 0,
      fillColors: uniquePalette(fills, 6),
      isInstance,
      isAutoLayout,
      childCount: children,
      resizeMode: resizeModeFor(node),
      canColorize: node.type === "TEXT" || !isInstance && !flags.hasImage && !flags.hasVector && !hasTextDescendant && fills.length > 0,
      canRotate: true,
      hasMissingFont: flags.hasMissingFont
    };
  }
  function backgroundFor(node, blocks) {
    var _a, _b, _c;
    let explicit = null;
    for (const paint of paintsOf(node)) {
      explicit = colorFromPaint(paint);
      if (explicit) break;
    }
    if (explicit) {
      if (isNearWhite(explicit) || isNearBlack(explicit)) return explicit;
      return explicit;
    }
    const candidates = blocks.flatMap((block) => block.fillColors).filter((color) => !isNearBlack(color));
    if (candidates.length) {
      const counts = /* @__PURE__ */ new Map();
      for (const color of candidates) {
        counts.set(color, ((_a = counts.get(color)) != null ? _a : 0) + 1);
      }
      return (_c = (_b = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]) == null ? void 0 : _b[0]) != null ? _c : LAB.paper;
    }
    return LAB.paper;
  }
  function unionBounds(nodes) {
    const boxes = nodes.map((node) => absoluteBounds(node)).filter((box) => Boolean(box));
    if (!boxes.length) return null;
    const left = Math.min(...boxes.map((box) => box.x));
    const top = Math.min(...boxes.map((box) => box.y));
    const right2 = Math.max(...boxes.map((box) => box.x + box.w));
    const bottom2 = Math.max(...boxes.map((box) => box.y + box.h));
    return { x: left, y: top, w: right2 - left, h: bottom2 - top };
  }
  function meaningfulChildren(node) {
    if (!hasChildren(node)) return [];
    return node.children.filter((child) => isVisible(child));
  }
  function exceedsLimit(blocks) {
    if (blocks.length <= MAX_BLOCKS) return { blocks, dropped: 0 };
    const kept = [...blocks].sort((a, b) => b.bounds.w * b.bounds.h - a.bounds.w * a.bounds.h).slice(0, MAX_BLOCKS).sort((a, b) => a.bounds.y - b.bounds.y || a.bounds.x - b.bounds.x);
    return { blocks: kept, dropped: blocks.length - kept.length };
  }
  function selectionKindFor(node) {
    if (node.type === "GROUP") return "group";
    if (FRAME_TYPES.has(node.type)) return "frame";
    return "single";
  }
  async function analyzeSelection(selection) {
    const hidden = selection.length === 0;
    if (hidden) {
      return {
        snapshot: null,
        problem: "Select a frame, group, or a few sibling layers to begin.",
        sourceNodes: []
      };
    }
    const roots = selection.filter(
      (node) => isVisible(node) && !selection.some(
        (other) => other.id !== node.id && isAncestor(other, node)
      )
    );
    if (!roots.length) {
      return {
        snapshot: null,
        problem: "The selected layers are hidden or empty. Make a frame visible and try again.",
        sourceNodes: []
      };
    }
    let sourceNodes = roots;
    let selectionKind = roots.length > 1 ? "multiple" : selectionKindFor(roots[0]);
    let origin = null;
    let width = 0;
    let height = 0;
    let background = LAB.paper;
    const warnings = [];
    if (roots.length === 1) {
      const root = roots[0];
      if (FRAME_TYPES.has(root.type) || root.type === "INSTANCE") {
        let inner = meaningfulChildren(root);
        if (root.type === "INSTANCE") {
          inner = [];
        } else if (inner.length === 1 && inner[0].type !== "INSTANCE") {
          const nested = meaningfulChildren(inner[0]);
          if (nested.length >= 2) {
            inner = nested;
          }
        }
        const rootBox = absoluteBounds(root);
        if (inner.length && rootBox) {
          sourceNodes = inner;
          origin = rootBox;
          width = rootBox.w;
          height = rootBox.h;
          selectionKind = selectionKindFor(root);
          if (inner.length === 1) {
            warnings.push(
              "The frame resolves to a single layer. The result will be a one-focal composition."
            );
          }
        } else if (rootBox) {
          sourceNodes = [root];
          origin = rootBox;
          width = rootBox.w;
          height = rootBox.h;
          selectionKind = "single";
          warnings.push(
            root.type === "INSTANCE" ? "The selected instance is treated as one atomic module. Select its parent frame for a richer composition." : "The selected layer is treated as one atomic block."
          );
        }
      }
      if (!origin) {
        const box = absoluteBounds(root);
        if (box) {
          origin = box;
          width = box.w;
          height = box.h;
          sourceNodes = [root];
          selectionKind = "single";
          warnings.push(
            "Only one layer is selected. The result will be a single-focal composition."
          );
        }
      }
    }
    if (!origin) {
      origin = unionBounds(sourceNodes);
      if (origin) {
        width = origin.w;
        height = origin.h;
      }
    }
    if (!origin || width < 8 || height < 8) {
      return {
        snapshot: null,
        problem: "This selection has no usable size. Select a visible frame or group with real content.",
        sourceNodes: []
      };
    }
    const blocks = [];
    let hiddenCount = 0;
    for (const node of sourceNodes) {
      if (!isVisible(node)) {
        hiddenCount += 1;
        continue;
      }
      if (node.type === "INSTANCE" && node !== sourceNodes[0] && roots.length === 1) {
        continue;
      }
      const block = rawBlockFromNode(node, origin);
      if (block) blocks.push(block);
      else warnings.push(`${node.name} has no renderable bounds and was skipped.`);
    }
    if (hiddenCount) {
      warnings.push(`${hiddenCount} hidden layer${hiddenCount === 1 ? " was" : "s were"} skipped.`);
    }
    if (!blocks.length) {
      return {
        snapshot: null,
        problem: "No visible, renderable layers were found. Ungroup the selection or select the contents directly.",
        sourceNodes: []
      };
    }
    const limited = exceedsLimit(blocks);
    if (limited.dropped) {
      warnings.push(
        `${limited.dropped} small layer${limited.dropped === 1 ? " was" : "s were"} left out to keep the composition below 30 blocks.`
      );
    }
    background = backgroundFor(sourceNodes[0], limited.blocks);
    const palette = uniquePalette(
      [
        ...limited.blocks.flatMap((block) => block.fillColors),
        background,
        LAB.acid,
        LAB.coral,
        LAB.violet
      ].filter((color) => !isNearWhite(color) || color === background),
      10
    );
    const raw = {
      selectionKind,
      name: roots.length === 1 ? roots[0].name : `${roots.length} selected layers`,
      sourceIds: roots.map((node) => node.id),
      width: Math.round(width),
      height: Math.round(height),
      background,
      palette,
      blocks: limited.blocks,
      warnings
    };
    const snapshot = buildSnapshot(raw);
    return {
      snapshot: __spreadProps(__spreadValues({}, snapshot), { warnings: inspectSnapshot(snapshot) }),
      problem: null,
      sourceNodes: roots
    };
  }
  function isAncestor(possibleAncestor, node) {
    let parent = node.parent;
    while (parent) {
      if (parent.id === possibleAncestor.id) return true;
      parent = parent.parent;
    }
    return false;
  }
  async function snapshotFromGeneratedFrame(frame, sourceFingerprint) {
    const origin = absoluteBounds(frame);
    if (!origin) return null;
    const blocks = [];
    const hiddenCount = 0;
    for (const child of frame.children) {
      if (!isVisible(child)) continue;
      const role = roleFromMeta(child.getPluginData(ROLE_KEY));
      if (!role || role === "decoration") continue;
      const block = rawBlockFromNode(child, origin, role);
      if (block) blocks.push(block);
    }
    if (!blocks.length) return null;
    const background = backgroundFor(frame, blocks);
    const raw = {
      selectionKind: "generated",
      name: frame.name,
      sourceIds: [frame.id],
      width: Math.round(frame.width),
      height: Math.round(frame.height),
      background,
      palette: uniquePalette(
        [...blocks.flatMap((block) => block.fillColors), background, LAB.acid, LAB.coral, LAB.violet],
        10
      ),
      blocks,
      warnings: hiddenCount ? [`${hiddenCount} hidden layers skipped.`] : []
    };
    const snapshot = buildSnapshot(raw, { preserveRoles: true });
    if (sourceFingerprint) {
      snapshot.fingerprint = sourceFingerprint;
    }
    return snapshot;
  }
  async function loadInter() {
    try {
      await Promise.all([
        figma.loadFontAsync({ family: "Inter", style: "Regular" }),
        figma.loadFontAsync({ family: "Inter", style: "Medium" }),
        figma.loadFontAsync({ family: "Inter", style: "Bold" })
      ]);
      return true;
    } catch (e) {
      try {
        await figma.loadFontAsync({ family: "Inter", style: "Regular" });
        return true;
      } catch (e2) {
        return false;
      }
    }
  }
  function addText(parent, name, characters, font, size, x, y, width, color) {
    const node = figma.createText();
    node.name = name;
    node.fontName = font;
    node.characters = characters;
    node.fontSize = size;
    node.textAutoResize = "HEIGHT";
    node.resizeWithoutConstraints(width, Math.max(size, node.height));
    node.x = x;
    node.y = y;
    node.fills = [{ type: "SOLID", color: hexToFigma(color) }];
    parent.appendChild(node);
    return node;
  }
  function hexToFigma(hex) {
    return {
      r: parseInt(hex.slice(1, 3), 16) / 255,
      g: parseInt(hex.slice(3, 5), 16) / 255,
      b: parseInt(hex.slice(5, 7), 16) / 255
    };
  }
  async function createSampleComposition() {
    const fonts = await loadInter();
    if (!fonts) return null;
    const viewport = figma.viewport.center;
    const frame = figma.createFrame();
    frame.name = "GRID CRIMES / SAMPLE";
    frame.resizeWithoutConstraints(1200, 800);
    frame.x = Math.round(viewport.x - 600);
    frame.y = Math.round(viewport.y - 400);
    frame.fills = [{ type: "SOLID", color: hexToFigma(LAB.paper) }];
    frame.clipsContent = true;
    const eyebrow = addText(
      frame,
      "Eyebrow",
      "LAB/ EXPERIMENT 019 \u2014 COMPOSITION INSTRUMENT",
      { family: "Inter", style: "Medium" },
      12,
      72,
      62,
      620,
      LAB.ink
    );
    eyebrow.letterSpacing = { unit: "PIXELS", value: 1.2 };
    const headline2 = addText(
      frame,
      "Headline",
      "BREAK THE GRID.\nKEEP THE CRAFT.",
      { family: "Inter", style: "Bold" },
      88,
      72,
      120,
      690,
      LAB.ink
    );
    headline2.lineHeight = { unit: "PERCENT", value: 88 };
    headline2.letterSpacing = { unit: "PERCENT", value: -3 };
    const body = addText(
      frame,
      "Body copy",
      "A composition engine for exploring alternate directions without losing the content that made the page worth designing.",
      { family: "Inter", style: "Regular" },
      18,
      72,
      420,
      520,
      LAB.ink
    );
    body.lineHeight = { unit: "PERCENT", value: 150 };
    const cta = figma.createFrame();
    cta.name = "Get started button";
    cta.resizeWithoutConstraints(250, 58);
    cta.x = 72;
    cta.y = 620;
    cta.fills = [{ type: "SOLID", color: hexToFigma(LAB.ink) }];
    cta.cornerRadius = 0;
    frame.appendChild(cta);
    addText(
      cta,
      "Button label",
      "GENERATE DIRECTIONS",
      { family: "Inter", style: "Medium" },
      13,
      22,
      20,
      210,
      LAB.acid
    );
    const visual2 = figma.createFrame();
    visual2.name = "Hero visual";
    visual2.resizeWithoutConstraints(360, 620);
    visual2.x = 760;
    visual2.y = 90;
    visual2.fills = [{ type: "SOLID", color: hexToFigma(LAB.violet) }];
    visual2.clipsContent = true;
    frame.appendChild(visual2);
    const circle = figma.createEllipse();
    circle.name = "Coral field";
    circle.resizeWithoutConstraints(280, 280);
    circle.x = 36;
    circle.y = 70;
    circle.fills = [{ type: "SOLID", color: hexToFigma(LAB.coral) }];
    visual2.appendChild(circle);
    const square = figma.createRectangle();
    square.name = "Acid block";
    square.resizeWithoutConstraints(150, 150);
    square.x = 178;
    square.y = 374;
    square.rotation = -8;
    square.fills = [{ type: "SOLID", color: hexToFigma(LAB.acid) }];
    visual2.appendChild(square);
    const hairline = figma.createRectangle();
    hairline.name = "Divider";
    hairline.resizeWithoutConstraints(250, 2);
    hairline.x = 56;
    hairline.y = 520;
    hairline.fills = [{ type: "SOLID", color: hexToFigma(LAB.paper) }];
    visual2.appendChild(hairline);
    const caption = addText(
      frame,
      "Caption",
      "EDITION 001 / GOOD THINGS HAPPEN OFF-GRID.",
      { family: "Inter", style: "Regular" },
      11,
      72,
      716,
      620,
      LAB.ink
    );
    caption.letterSpacing = { unit: "PIXELS", value: 0.8 };
    figma.currentPage.selection = [frame];
    return frame;
  }

  // src/main/builder.ts
  function editable(node) {
    return node;
  }
  function fontKey(family, style) {
    return `${family}::${style}`;
  }
  async function loadFonts(snapshot) {
    const available = /* @__PURE__ */ new Set();
    const unavailable = /* @__PURE__ */ new Set();
    const warnings = [];
    const fonts = /* @__PURE__ */ new Map();
    for (const font of snapshot.fonts) {
      fonts.set(fontKey(font.family, font.style), font);
    }
    for (const [key, font] of fonts) {
      try {
        await figma.loadFontAsync({ family: font.family, style: font.style });
        available.add(key);
      } catch (e) {
        unavailable.add(key);
      }
    }
    if (unavailable.size) {
      warnings.push(
        `${unavailable.size} font${unavailable.size === 1 ? " is" : "s are"} unavailable. Affected text keeps its original formatting and only moves with the composition.`
      );
    }
    let decorationFont = false;
    try {
      await figma.loadFontAsync({ family: "Inter", style: "Medium" });
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      decorationFont = true;
    } catch (e) {
      try {
        await figma.loadFontAsync({ family: "Inter", style: "Regular" });
        decorationFont = true;
      } catch (e2) {
        decorationFont = false;
      }
    }
    return { available, unavailable, warnings, decorationFont };
  }
  function canEditText(node, fonts) {
    if (node.hasMissingFont) return { ok: false, reason: "missing font" };
    let names = [];
    try {
      names = node.getRangeAllFontNames(0, Math.max(1, node.characters.length));
    } catch (e) {
      return { ok: false, reason: "unreadable font list" };
    }
    for (const font of names) {
      if (fonts.unavailable.has(fontKey(font.family, font.style))) {
        return { ok: false, reason: "unavailable font" };
      }
      if (!fonts.available.has(fontKey(font.family, font.style))) {
        return { ok: false, reason: "unloaded font" };
      }
    }
    return { ok: true };
  }
  function applyTextLayout(node, plan, block, fonts, warnings, targetWidth, targetHeight) {
    const editable2 = canEditText(node, fonts);
    if (!editable2.ok) {
      warnings.push(
        `${block.name} keeps its original type because ${editable2.reason}.`
      );
      return false;
    }
    try {
      node.textAutoResize = "HEIGHT";
      node.fontSize = Math.max(4, Math.min(600, plan.fontSize));
      node.textAlignHorizontal = plan.align;
      if (plan.lineHeight !== null) {
        node.lineHeight = { unit: "PERCENT", value: Math.max(50, plan.lineHeight * 100) };
      }
      if (plan.letterSpacing !== null) {
        node.letterSpacing = {
          unit: "PERCENT",
          value: plan.letterSpacing * 100
        };
      }
      node.textAutoResize = "HEIGHT";
      const width = Math.max(8, targetWidth);
      node.resizeWithoutConstraints(width, Math.max(8, node.height));
      let guard = 0;
      while (node.height > Math.max(12, targetHeight) * 1.08 && node.fontSize > 7 && guard < 14) {
        node.fontSize = Math.max(7, node.fontSize * 0.94);
        try {
          node.resizeWithoutConstraints(width, Math.max(8, node.height));
        } catch (e) {
          break;
        }
        guard += 1;
      }
    } catch (error) {
      warnings.push(
        `${block.name} could not be fully re-set: ${error instanceof Error ? error.message : "text layout unavailable"}`
      );
      return false;
    }
    return true;
  }
  function setTextWidth(node, plan) {
    try {
      node.textAutoResize = "HEIGHT";
      node.resizeWithoutConstraints(
        Math.max(8, plan.rect.w),
        Math.max(8, node.height)
      );
    } catch (e) {
    }
  }
  function applyFillColor(node, color) {
    try {
      if (node.type === "TEXT") {
        const style = node.fillStyleId;
        if (typeof style === "string" && style.length > 0) return;
        try {
          const segments = node.getStyledTextSegments(["fills"]);
          if (segments.length > 1) return;
        } catch (e) {
        }
        node.fills = [{ type: "SOLID", color: hexToFigmaColor(color) }];
        return;
      }
      if ("fills" in node) {
        const style = node.fillStyleId;
        if (typeof style === "string" && style.length > 0) return;
        node.fills = [
          { type: "SOLID", color: hexToFigmaColor(color) }
        ];
      }
    } catch (e) {
    }
  }
  function sizeAndPosition(node, block, plan, fonts, warnings) {
    var _a, _b, _c;
    if (node.type === "TEXT") {
      const edited = applyTextLayout(node, (_c = plan.text) != null ? _c : {
        fontSize: Math.max(10, ((_b = (_a = block.text) == null ? void 0 : _a.fontSize) != null ? _b : 16) * 0.9),
        lineHeight: null,
        letterSpacing: null,
        align: "LEFT",
        emphasis: 1
      }, block, fonts, warnings, plan.rect.w, plan.rect.h);
      if (edited) setTextWidth(node, plan);
      node.x = plan.rect.x;
      node.y = plan.rect.y;
      return;
    }
    if (block.hasMissingFont) {
      node.x = plan.rect.x;
      node.y = plan.rect.y;
      warnings.push(
        `${block.name} contains an unavailable font. It was repositioned without resizing.`
      );
      return;
    }
    const isRescale = block.isInstance || block.isAutoLayout || block.resizeMode === "rescale" || block.childCount > 1;
    const currentW = Math.max(1, node.width);
    const currentH = Math.max(1, node.height);
    if (isRescale) {
      const scale = Math.min(
        plan.rect.w / currentW,
        plan.rect.h / currentH
      );
      if (Number.isFinite(scale) && Math.abs(scale - 1) > 6e-3) {
        try {
          editable(node).rescale(Math.max(0.02, Math.min(12, scale)));
        } catch (e) {
          try {
            editable(node).resize(Math.max(2, plan.rect.w), Math.max(2, plan.rect.h));
          } catch (e2) {
            warnings.push(`${block.name} kept its original size.`);
          }
        }
      }
    } else {
      try {
        editable(node).resize(Math.max(2, plan.rect.w), Math.max(2, plan.rect.h));
      } catch (e) {
        warnings.push(`${block.name} kept its original size.`);
      }
    }
    const width = node.width;
    const height = node.height;
    node.x = plan.rect.x + Math.max(0, (plan.rect.w - width) / 2);
    node.y = plan.rect.y + Math.max(0, (plan.rect.h - height) / 2);
  }
  function rotateAroundCentre(node, degrees) {
    if (Math.abs(degrees) < 0.05) return;
    try {
      const target = editable(node);
      const before = target.absoluteBoundingBox;
      target.rotation = degrees;
      const after = target.absoluteBoundingBox;
      if (before && after) {
        target.x += before.x + before.width / 2 - (after.x + after.width / 2);
        target.y += before.y + before.height / 2 - (after.y + after.height / 2);
      }
    } catch (e) {
    }
  }
  function cloneBlock(frame, source, block, plan, fonts, warnings) {
    const clone = source.clone();
    clone.name = source.name;
    clone.locked = false;
    clone.visible = true;
    editable(clone).opacity = plan.opacity;
    frame.appendChild(clone);
    clone.setPluginData(ROLE_KEY, block.role);
    sizeAndPosition(clone, block, plan, fonts, warnings);
    if (plan.color && !block.isInstance) {
      applyFillColor(clone, plan.color);
    }
    rotateAroundCentre(clone, plan.rotation);
    return clone;
  }
  function decorationColorIcon(color, background) {
    return contrastRatio(color, background) >= 3.2 ? color : readableOn(background, [LAB.ink, LAB.paper]);
  }
  function addDecoration(frame, decoration, fonts, warnings) {
    var _a, _b, _c;
    const color = decoration.color;
    const fill = [{ type: "SOLID", color: hexToFigmaColor(color) }];
    const setCommon = (node, name) => {
      node.name = `DECOR / ${name}`;
      node.setPluginData(ROLE_KEY, "decoration");
      editable(node).opacity = decoration.opacity;
      frame.appendChild(node);
      node.x = decoration.rect.x;
      node.y = decoration.rect.y;
    };
    try {
      if (decoration.kind === "index" || decoration.kind === "stamp") {
        if (!fonts.decorationFont || !decoration.label) {
          if (decoration.kind === "stamp") {
            const rectangle2 = figma.createRectangle();
            rectangle2.resizeWithoutConstraints(decoration.rect.w, decoration.rect.h);
            rectangle2.fills = fill;
            setCommon(rectangle2, (_a = decoration.label) != null ? _a : "stamp");
            rotateAroundCentre(rectangle2, decoration.rotation);
            return rectangle2;
          }
          return null;
        }
        if (decoration.kind === "stamp") {
          const stamp = figma.createFrame();
          stamp.resizeWithoutConstraints(decoration.rect.w, decoration.rect.h);
          stamp.fills = fill;
          stamp.clipsContent = true;
          setCommon(stamp, (_b = decoration.label) != null ? _b : "stamp");
          const label = figma.createText();
          label.fontName = { family: "Inter", style: "Medium" };
          label.characters = decoration.label.toUpperCase();
          label.fills = [
            {
              type: "SOLID",
              color: hexToFigmaColor(decorationColorIcon(color, color))
            }
          ];
          label.fontSize = Math.max(7, decoration.rect.h * 0.42);
          label.letterSpacing = { unit: "PERCENT", value: 8 };
          label.textAutoResize = "HEIGHT";
          label.resizeWithoutConstraints(
            Math.max(8, decoration.rect.w - 12),
            Math.max(8, decoration.rect.h - 8)
          );
          stamp.appendChild(label);
          label.x = 6;
          label.y = (decoration.rect.h - label.height) / 2;
          rotateAroundCentre(stamp, decoration.rotation);
          return stamp;
        }
        const text = figma.createText();
        text.name = `DECOR / ${(_c = decoration.label) != null ? _c : "index"}`;
        text.setPluginData(ROLE_KEY, "decoration");
        text.fontName = { family: "Inter", style: "Medium" };
        text.characters = decoration.label;
        text.fontSize = Math.max(7, Math.round(decoration.rect.h * 0.58));
        text.letterSpacing = { unit: "PERCENT", value: 10 };
        text.textAutoResize = "HEIGHT";
        text.resizeWithoutConstraints(
          Math.max(24, decoration.rect.w),
          Math.max(8, decoration.rect.h)
        );
        text.fills = fill;
        text.opacity = decoration.opacity;
        frame.appendChild(text);
        text.x = decoration.rect.x;
        text.y = decoration.rect.y;
        rotateAroundCentre(text, decoration.rotation);
        return text;
      }
      if (decoration.kind === "ring") {
        const ellipse = figma.createEllipse();
        ellipse.resizeWithoutConstraints(
          Math.max(4, decoration.rect.w),
          Math.max(4, decoration.rect.h)
        );
        ellipse.fills = [];
        ellipse.strokes = fill;
        ellipse.strokeWeight = Math.max(1, Math.min(8, decoration.rect.w * 0.015));
        setCommon(ellipse, "ring");
        rotateAroundCentre(ellipse, decoration.rotation);
        return ellipse;
      }
      if (decoration.kind === "dot") {
        const ellipse = figma.createEllipse();
        ellipse.resizeWithoutConstraints(
          Math.max(3, decoration.rect.w),
          Math.max(3, decoration.rect.h)
        );
        ellipse.fills = fill;
        setCommon(ellipse, "dot");
        return ellipse;
      }
      if (decoration.kind === "cross") {
        const group = figma.createFrame();
        group.resizeWithoutConstraints(decoration.rect.w, decoration.rect.h);
        group.fills = [];
        group.clipsContent = false;
        setCommon(group, "cross");
        const thickness = Math.max(1, Math.min(decoration.rect.w, decoration.rect.h) * 0.12);
        const horizontal = figma.createRectangle();
        horizontal.resizeWithoutConstraints(decoration.rect.w, thickness);
        horizontal.x = 0;
        horizontal.y = (decoration.rect.h - thickness) / 2;
        horizontal.fills = fill;
        group.appendChild(horizontal);
        const vertical = figma.createRectangle();
        vertical.resizeWithoutConstraints(thickness, decoration.rect.h);
        vertical.x = (decoration.rect.w - thickness) / 2;
        vertical.y = 0;
        vertical.fills = fill;
        group.appendChild(vertical);
        rotateAroundCentre(group, decoration.rotation);
        return group;
      }
      if (decoration.kind === "frame") {
        const rectangle2 = figma.createRectangle();
        rectangle2.resizeWithoutConstraints(
          Math.max(4, decoration.rect.w),
          Math.max(4, decoration.rect.h)
        );
        rectangle2.fills = [];
        rectangle2.strokes = fill;
        rectangle2.strokeWeight = Math.max(1, Math.min(6, decoration.rect.w * 5e-3));
        setCommon(rectangle2, "frame");
        rotateAroundCentre(rectangle2, decoration.rotation);
        return rectangle2;
      }
      const rectangle = figma.createRectangle();
      rectangle.resizeWithoutConstraints(
        Math.max(1, decoration.rect.w),
        Math.max(1, decoration.rect.h)
      );
      rectangle.fills = fill;
      setCommon(rectangle, decoration.kind);
      rotateAroundCentre(rectangle, decoration.rotation);
      return rectangle;
    } catch (error) {
      warnings.push(
        `A ${decoration.kind} decoration could not be drawn: ${error instanceof Error ? error.message : "unknown error"}`
      );
      return null;
    }
  }
  function buildVariationFrame(input) {
    var _a, _b;
    const {
      plan,
      snapshot,
      container,
      x,
      y,
      index,
      batchId,
      frameName,
      sources,
      fonts,
      crossbreed
    } = input;
    const warnings = [];
    const frame = figma.createFrame();
    frame.name = frameName;
    frame.resizeWithoutConstraints(plan.width, plan.height);
    frame.x = x;
    frame.y = y;
    frame.fills = [{ type: "SOLID", color: hexToFigmaColor(plan.background) }];
    frame.clipsContent = true;
    frame.cornerRadius = 0;
    container.appendChild(frame);
    const blockMap = new Map(snapshot.blocks.map((block) => [block.id, block]));
    const layers = [
      ...plan.decorations.map((decoration) => ({
        kind: "decoration",
        z: decoration.z,
        decoration
      })),
      ...plan.blocks.map((block) => ({
        kind: "block",
        z: block.z,
        block
      }))
    ].sort((a, b) => a.z - b.z || (a.kind === "decoration" ? -1 : 1));
    for (const layer of layers) {
      if (layer.kind === "decoration") {
        addDecoration(frame, layer.decoration, fonts, warnings);
        continue;
      }
      const block = blockMap.get(layer.block.sourceId);
      const source = sources.get(layer.block.sourceId);
      if (!block || !source) {
        throw new Error(
          `The source layer "${layer.block.name}" is no longer available.`
        );
      }
      if (source.removed) {
        throw new Error(`"${layer.block.name}" was deleted during generation.`);
      }
      try {
        cloneBlock(frame, source, block, layer.block, fonts, warnings);
      } catch (error) {
        throw new Error(
          `Could not clone "${block.name}": ${error instanceof Error ? error.message : "unknown cloning error"}`
        );
      }
    }
    const meta = makeVariationMeta({
      batchId,
      containerId: container.id,
      variationId: `${batchId}_v${index + 1}`,
      index,
      preset: plan.preset,
      presetName: (_b = (_a = PRESETS[plan.preset]) == null ? void 0 : _a.name) != null ? _b : plan.preset,
      seed: plan.seed,
      settings: plan.settings,
      grammar: plan.grammarId,
      grammarName: plan.grammarName,
      score: plan.score,
      sourceFingerprint: snapshot.fingerprint,
      sourceName: snapshot.name,
      sourceIds: snapshot.sourceIds,
      dna: plan.dna,
      createdAt: Date.now(),
      kept: false,
      locked: false,
      revision: 0,
      crossbreed
    });
    frame.setPluginData(META_KEY, encodeMeta(meta));
    return { frame, meta, warnings: [...new Set(warnings)] };
  }
  function refreshMetaOnFrame(frame, meta) {
    frame.setPluginData(META_KEY, encodeMeta(meta));
  }
  function missingSourceIds(snapshot, sources) {
    return snapshot.blocks.filter((block) => !sources.has(block.id)).map((block) => block.name);
  }

  // src/main/placement.ts
  var BATCH_GAP = 56;
  var BATCH_PADDING = 48;
  var BATCH_TITLE_HEIGHT = 88;
  function batchDimensions(frameWidth, frameHeight, options = {}) {
    var _a, _b, _c;
    const gap = (_a = options.gap) != null ? _a : BATCH_GAP;
    const padding = (_b = options.padding) != null ? _b : BATCH_PADDING;
    const titleHeight = (_c = options.titleHeight) != null ? _c : BATCH_TITLE_HEIGHT;
    return {
      width: padding * 2 + frameWidth * 2 + gap,
      height: titleHeight + padding + frameHeight * 2 + gap
    };
  }
  function framePosition(index, frameWidth, frameHeight, options = {}) {
    var _a, _b, _c;
    const gap = (_a = options.gap) != null ? _a : BATCH_GAP;
    const padding = (_b = options.padding) != null ? _b : BATCH_PADDING;
    const titleHeight = (_c = options.titleHeight) != null ? _c : BATCH_TITLE_HEIGHT;
    return {
      x: padding + index % 2 * (frameWidth + gap),
      y: titleHeight + Math.floor(index / 2) * (frameHeight + gap)
    };
  }
  function intersects(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }
  function chooseBatchPlacement(source, batch, occupied, gap = 160) {
    const candidates = [];
    for (let column = 0; column < 4; column += 1) {
      const x = source.x + source.w + gap + column * (batch.width + gap);
      candidates.push({ x, y: source.y });
      for (let row = 1; row <= 5; row += 1) {
        candidates.push({ x, y: source.y + row * (batch.height * 0.55 + 48) });
      }
    }
    candidates.push({ x: source.x, y: source.y + source.h + gap });
    for (const candidate of candidates) {
      const rect = {
        x: candidate.x,
        y: candidate.y,
        w: batch.width,
        h: batch.height
      };
      if (!occupied.some((other) => intersects(rect, other))) {
        return {
          x: Math.round(candidate.x),
          y: Math.round(candidate.y)
        };
      }
    }
    const farRight = occupied.reduce(
      (max, rect) => Math.max(max, rect.x + rect.w),
      source.x + source.w
    );
    return {
      x: Math.round(farRight + gap),
      y: Math.round(source.y)
    };
  }
  function formatBatchNumber(value) {
    return String(Math.max(1, Math.floor(value))).padStart(3, "0");
  }
  function variationFrameName(preset, index) {
    return `GRID CRIMES / ${preset.toUpperCase()} / ${formatBatchNumber(index)}`;
  }
  function batchFrameName(index) {
    return `GRID CRIMES / BATCH ${formatBatchNumber(index)}`;
  }
  function newBatchId(seed, now) {
    return `gc_${now.toString(36)}_${(seed % 99991).toString(36)}`;
  }

  // src/main/code.ts
  var LAST_BATCH_KEY = "gc.lastBatch";
  var BATCH_COUNTER_KEY = "gc.batchCounter";
  var SETTINGS_KEY = "gc.settings";
  var currentSnapshot = null;
  var selectionProblem = null;
  var currentBatch = null;
  var selectedGenerated = [];
  var selectedThumbnails = {};
  var selectedThumbCache = /* @__PURE__ */ new Map();
  var lastSettings = null;
  var busy = false;
  var analysisToken = 0;
  var selectionTimer = null;
  var batchCounter = 1;
  function post(type, payload) {
    figma.ui.postMessage({ type, payload });
  }
  function statePayload() {
    return {
      selection: currentSnapshot,
      selectionProblem,
      batch: currentBatch,
      canCrossbreed: selectedGenerated.length === 2,
      selectedGenerated,
      selectedThumbnails,
      lastSettings,
      version: GENERATOR_VERSION,
      pending: busy
    };
  }
  function sendState() {
    post("state", statePayload());
  }
  function progress(operation, phase, message, percent) {
    post("progress", { operation, phase, message, percent });
  }
  function toast(tone, message) {
    post("toast", { tone, message });
  }
  function fail(operation, error) {
    var _a, _b;
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    const detail = error instanceof Error ? (_b = (_a = error.stack) == null ? void 0 : _a.split("\n")[1]) == null ? void 0 : _b.trim() : void 0;
    post("error", { operation, message, detail });
    figma.notify(`GRID CRIMES/ \u2014 ${message}`, { error: true, timeout: 6e3 });
  }
  function isSceneNode(node) {
    return Boolean(
      node && node.type !== "DOCUMENT" && node.type !== "PAGE"
    );
  }
  async function getSceneNode(id) {
    const node = await figma.getNodeByIdAsync(id);
    if (!isSceneNode(node) || node.removed) return null;
    return node;
  }
  function absoluteBounds2(node) {
    const box = node.absoluteBoundingBox;
    return box ? { x: box.x, y: box.y, w: box.width, h: box.height } : null;
  }
  function unionRect(nodes) {
    const boxes = nodes.map(absoluteBounds2).filter((box) => Boolean(box));
    if (!boxes.length) return null;
    const x = Math.min(...boxes.map((box) => box.x));
    const y = Math.min(...boxes.map((box) => box.y));
    const right2 = Math.max(...boxes.map((box) => box.x + box.w));
    const bottom2 = Math.max(...boxes.map((box) => box.y + box.h));
    return { x, y, w: right2 - x, h: bottom2 - y };
  }
  function stripBatch(batch) {
    return __spreadProps(__spreadValues({}, batch), {
      sourceThumbnail: null,
      variations: batch.variations.map((variation) => __spreadProps(__spreadValues({}, variation), {
        thumbnail: null
      }))
    });
  }
  function saveBatch(batch) {
    currentBatch = batch;
    void (async () => {
      const node = await figma.getNodeByIdAsync(batch.containerId);
      if (node && node.type === "FRAME") {
        node.setPluginData(BATCH_KEY, JSON.stringify(stripBatch(batch)));
      }
    })();
    void figma.clientStorage.setAsync(LAST_BATCH_KEY, {
      batchId: batch.id,
      containerId: batch.containerId,
      pageId: figma.currentPage.id,
      createdAt: batch.createdAt
    });
  }
  function parseBatch(raw) {
    var _a, _b, _c, _d;
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      const value = parsed;
      if (typeof value.id !== "string" || typeof value.containerId !== "string") {
        return null;
      }
      if (!Array.isArray(value.variations)) return null;
      return {
        id: value.id,
        containerId: value.containerId,
        sourceName: String((_a = value.sourceName) != null ? _a : "Original composition"),
        sourceFingerprint: String((_b = value.sourceFingerprint) != null ? _b : ""),
        createdAt: Number(value.createdAt) || 0,
        preset: (_c = value.preset) != null ? _c : "brutalist",
        settings: sanitizeSettings(value.settings),
        variations: value.variations.filter((entry) => Boolean(entry && typeof entry === "object")).map((entry) => {
          var _a2, _b2, _c2, _d2, _e, _f, _g;
          return {
            id: String((_a2 = entry.id) != null ? _a2 : ""),
            frameId: String((_b2 = entry.frameId) != null ? _b2 : ""),
            name: String((_c2 = entry.name) != null ? _c2 : ""),
            seed: Number(entry.seed) || 1,
            preset: String((_d2 = entry.preset) != null ? _d2 : ""),
            presetName: String((_e = entry.presetName) != null ? _e : ""),
            grammar: String((_f = entry.grammar) != null ? _f : ""),
            grammarName: String((_g = entry.grammarName) != null ? _g : ""),
            score: Number(entry.score) || 0,
            width: Number(entry.width) || 0,
            height: Number(entry.height) || 0,
            kept: entry.kept === true,
            locked: entry.locked === true,
            thumbnail: null,
            dna: entry.dna
          };
        }),
        parentMeta: (_d = value.parentMeta) != null ? _d : null,
        auxNodeIds: Array.isArray(value.auxNodeIds) ? value.auxNodeIds.filter((id) => typeof id === "string") : [],
        sourceThumbnail: null
      };
    } catch (e) {
      return null;
    }
  }
  async function exportThumbnail(node, maxPx = 440) {
    try {
      const width = Math.max(1, node.width);
      const scale = Math.min(1.5, Math.max(0.03, maxPx / width));
      const bytes = await node.exportAsync({
        format: "PNG",
        constraint: { type: "SCALE", value: scale }
      });
      return `data:image/png;base64,${figma.base64Encode(bytes)}`;
    } catch (e) {
      return null;
    }
  }
  async function hydrateThumbnails(batch) {
    if (!batch.sourceThumbnail && (currentSnapshot == null ? void 0 : currentSnapshot.sourceIds.length) === 1) {
      const source = await getSceneNode(currentSnapshot.sourceIds[0]);
      if (source) {
        batch.sourceThumbnail = await exportThumbnail(source, 700);
        sendState();
      }
    }
    for (const variation of batch.variations) {
      if (variation.thumbnail) continue;
      const frame = await getSceneNode(variation.frameId);
      if (frame && frame.type === "FRAME") {
        variation.thumbnail = await exportThumbnail(frame);
      }
    }
    post("thumbnails", {
      batchId: batch.id,
      thumbs: Object.fromEntries(
        batch.variations.filter((variation) => variation.thumbnail).map((variation) => [variation.id, variation.thumbnail])
      )
    });
  }
  async function loadBatchFromContainer(containerId, send = true) {
    var _a;
    const node = await getSceneNode(containerId);
    if (!node || node.type !== "FRAME") return null;
    if (((_a = node.parent) == null ? void 0 : _a.id) !== figma.currentPage.id) return null;
    const parsed = parseBatch(node.getPluginData(BATCH_KEY));
    if (!parsed) return null;
    currentBatch = parsed;
    if (send) {
      sendState();
      void hydrateThumbnails(parsed);
    }
    return parsed;
  }
  async function restoreLastBatch() {
    try {
      const ref = await figma.clientStorage.getAsync(LAST_BATCH_KEY);
      if (!ref || ref.pageId !== figma.currentPage.id) return;
      await loadBatchFromContainer(ref.containerId, false);
    } catch (e) {
    }
  }
  async function readBatchSettings() {
    try {
      const stored = await figma.clientStorage.getAsync(SETTINGS_KEY);
      if (stored) lastSettings = sanitizeSettings(stored);
    } catch (e) {
      lastSettings = null;
    }
    try {
      const counter = await figma.clientStorage.getAsync(BATCH_COUNTER_KEY);
      batchCounter = typeof counter === "number" && counter > 0 ? Math.floor(counter) : 1;
    } catch (e) {
      batchCounter = 1;
    }
  }
  function generatedMetaFor(node) {
    try {
      return decodeMeta(node.getPluginData(META_KEY));
    } catch (e) {
      return null;
    }
  }
  async function updateFromSelection() {
    var _a, _b, _c;
    const token = ++analysisToken;
    const selection = [...figma.currentPage.selection];
    const metas = [];
    const containers = [];
    const other = [];
    for (const node of selection) {
      const meta = generatedMetaFor(node);
      if (meta) {
        metas.push(meta);
        continue;
      }
      try {
        if (node.getPluginData(BATCH_KEY)) {
          containers.push(node.id);
          continue;
        }
      } catch (e) {
      }
      other.push(node);
    }
    selectedGenerated = metas;
    if (metas.length === 2) {
      selectedThumbnails = {};
      for (const node of selection) {
        const meta = generatedMetaFor(node);
        if (!meta) continue;
        const cacheKey = `${meta.variationId}:${meta.revision}`;
        let thumb = (_a = selectedThumbCache.get(cacheKey)) != null ? _a : null;
        if (!thumb) {
          thumb = await exportThumbnail(node);
          if (thumb) selectedThumbCache.set(cacheKey, thumb);
        }
        if (thumb) selectedThumbnails[meta.variationId] = thumb;
      }
    } else {
      selectedThumbnails = {};
    }
    if (other.length === 0 && (metas.length || containers.length)) {
      const batchId = (_b = metas[0]) == null ? void 0 : _b.batchId;
      if (batchId && metas.length > 0 && metas.every((meta) => meta.batchId === batchId) && (!currentBatch || currentBatch.id !== batchId)) {
        await loadBatchFromContainer(metas[0].containerId, false);
      }
      if (containers.length && !metas.length) {
        const container = await getSceneNode(containers[0]);
        if ((container == null ? void 0 : container.type) === "FRAME") {
          const parsed = parseBatch(container.getPluginData(BATCH_KEY));
          if (parsed) currentBatch = parsed;
        }
      }
      if (token !== analysisToken) return;
      sendState();
      return;
    }
    if (other.length === 0) {
      currentSnapshot = null;
      selectionProblem = selection.length === 0 ? "Select a frame, group, or a few sibling layers to begin." : null;
      if (token !== analysisToken) return;
      sendState();
      return;
    }
    const result = await analyzeSelection(other);
    if (token !== analysisToken) return;
    currentSnapshot = result.snapshot;
    selectionProblem = result.problem;
    if (result.snapshot) {
      lastSettings = sanitizeSettings(__spreadProps(__spreadValues({}, lastSettings != null ? lastSettings : DEFAULT_SETTINGS), {
        preset: (_c = lastSettings == null ? void 0 : lastSettings.preset) != null ? _c : DEFAULT_SETTINGS.preset
      }));
    }
    sendState();
  }
  function scheduleSelectionUpdate() {
    if (selectionTimer) clearTimeout(selectionTimer);
    selectionTimer = setTimeout(() => {
      void updateFromSelection();
    }, 140);
  }
  async function resolveSources(snapshot) {
    const map = /* @__PURE__ */ new Map();
    for (const block of snapshot.blocks) {
      const node = await getSceneNode(block.id);
      if (node) map.set(block.id, node);
    }
    const missing = missingSourceIds(snapshot, map);
    if (missing.length) {
      throw new Error(
        `The source changed while the plugin was open. These layers are missing: ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? "\u2026" : ""}. Select the composition again.`
      );
    }
    return map;
  }
  async function sourceRectFor(snapshot) {
    const roots = [];
    for (const id of snapshot.sourceIds) {
      const node = await getSceneNode(id);
      if (node) roots.push(node);
    }
    const union = unionRect(roots);
    if (union) return union;
    const blocks = [];
    for (const block of snapshot.blocks) {
      const node = await getSceneNode(block.id);
      if (node) blocks.push(node);
    }
    const blockUnion = unionRect(blocks);
    if (blockUnion) return blockUnion;
    return { x: 0, y: 0, w: snapshot.width, h: snapshot.height };
  }
  function pageOccupied() {
    return figma.currentPage.children.map(absoluteBounds2).filter((box) => Boolean(box));
  }
  async function createBatch(input) {
    var _a;
    const {
      plans,
      snapshot,
      settings,
      frameNames,
      presetLabel,
      crossbreed,
      parentMeta,
      warnings: extraWarnings = []
    } = input;
    if (!plans.length) throw new Error("No valid layout was produced.");
    const sources = await resolveSources(snapshot);
    const fonts = await loadFonts(snapshot);
    const warnings = [...extraWarnings, ...fonts.warnings];
    const sourceRect = await sourceRectFor(snapshot);
    const dims = batchDimensions(plans[0].width, plans[0].height);
    const placement = chooseBatchPlacement(sourceRect, dims, pageOccupied());
    const batchId = newBatchId(settings.seed, Date.now());
    const container = figma.createFrame();
    container.name = batchFrameName(batchCounter);
    container.resizeWithoutConstraints(dims.width, dims.height);
    container.x = placement.x;
    container.y = placement.y;
    container.fills = [];
    container.clipsContent = false;
    container.cornerRadius = 0;
    figma.currentPage.appendChild(container);
    const auxNodeIds = [];
    let sourceThumbnail = null;
    if (snapshot.sourceIds.length === 1) {
      const root = await getSceneNode(snapshot.sourceIds[0]);
      if (root) sourceThumbnail = await exportThumbnail(root, 700);
    }
    try {
      if (fonts.decorationFont) {
        const title = figma.createText();
        title.name = "Batch label";
        title.fontName = { family: "Inter", style: "Medium" };
        title.characters = `GRID CRIMES / ${String(batchCounter).padStart(3, "0")}`;
        title.fontSize = 22;
        title.letterSpacing = { unit: "PERCENT", value: -1 };
        title.fills = [{ type: "SOLID", color: { r: 35 / 255, g: 36 / 255, b: 31 / 255 } }];
        title.textAutoResize = "HEIGHT";
        title.resizeWithoutConstraints(480, 30);
        title.x = 48;
        title.y = 22;
        container.appendChild(title);
        auxNodeIds.push(title.id);
        const note = figma.createText();
        note.name = "Batch note";
        note.fontName = { family: "Inter", style: "Regular" };
        note.characters = `LAB/ COMPOSITION INSTRUMENT  \xB7  ${presetLabel}  \xB7  SEED ${settings.seed}  \xB7  ${plans.length} VARIATIONS`;
        note.fontSize = 10;
        note.letterSpacing = { unit: "PERCENT", value: 6 };
        note.fills = [{ type: "SOLID", color: { r: 98 / 255, g: 99 / 255, b: 90 / 255 } }];
        note.textAutoResize = "HEIGHT";
        note.resizeWithoutConstraints(Math.max(320, dims.width - 96), 18);
        note.x = 48;
        note.y = 52;
        container.appendChild(note);
        auxNodeIds.push(note.id);
      }
      const rule = figma.createRectangle();
      rule.name = "Batch rule";
      rule.resizeWithoutConstraints(Math.max(10, dims.width - 96), 2);
      rule.x = 48;
      rule.y = 78;
      rule.fills = [{ type: "SOLID", color: { r: 35 / 255, g: 36 / 255, b: 31 / 255 } }];
      container.appendChild(rule);
      auxNodeIds.push(rule.id);
      const variations = [];
      for (let index = 0; index < plans.length; index += 1) {
        const plan = plans[index];
        progress("generate", "build", `Building variation ${index + 1} of ${plans.length}`, 48 + index * 10);
        const position = framePosition(index, plan.width, plan.height);
        const built = buildVariationFrame({
          plan,
          snapshot,
          container,
          x: position.x,
          y: position.y,
          index,
          batchId,
          frameName: (_a = frameNames[index]) != null ? _a : variationFrameName(presetLabel, index + 1),
          sources,
          fonts,
          crossbreed
        });
        warnings.push(...built.warnings);
        variations.push({
          id: built.meta.variationId,
          frameId: built.frame.id,
          name: built.frame.name,
          seed: plan.seed,
          preset: plan.preset,
          presetName: plan.presetName,
          grammar: plan.grammarId,
          grammarName: plan.grammarName,
          score: plan.score,
          width: plan.width,
          height: plan.height,
          kept: false,
          locked: false,
          thumbnail: null,
          dna: plan.dna
        });
      }
      const batch = {
        id: batchId,
        containerId: container.id,
        sourceName: snapshot.name,
        sourceFingerprint: snapshot.fingerprint,
        createdAt: Date.now(),
        variations,
        preset: settings.preset,
        settings,
        parentMeta: parentMeta != null ? parentMeta : null,
        auxNodeIds,
        sourceThumbnail
      };
      progress("generate", "thumbnail", "Rendering real previews", 88);
      for (const variation of batch.variations) {
        const frame = await getSceneNode(variation.frameId);
        if (frame) variation.thumbnail = await exportThumbnail(frame);
      }
      saveBatch(batch);
      batchCounter += 1;
      void figma.clientStorage.setAsync(BATCH_COUNTER_KEY, batchCounter);
      void figma.clientStorage.setAsync(SETTINGS_KEY, settings);
      currentBatch = batch;
      figma.currentPage.selection = [container];
      figma.viewport.scrollAndZoomIntoView([container]);
      figma.commitUndo();
      return { batch, warnings: [...new Set(warnings)] };
    } catch (error) {
      try {
        container.remove();
      } catch (e) {
      }
      throw error;
    }
  }
  async function handleGenerate(settings, roleOverrides) {
    var _a, _b;
    if (busy) return;
    if (!currentSnapshot) {
      throw new Error("Select a composition before generating.");
    }
    busy = true;
    sendState();
    const operation = "generate";
    try {
      progress(operation, "analyze", "Reading the composition", 8);
      const snapshot = applyRoleOverrides(currentSnapshot, roleOverrides);
      progress(operation, "plan", "Planning four directions", 20);
      const result = generatePlans(snapshot, settings, { count: 4 });
      if (!result.plans.length) throw new Error("The engine could not produce a safe layout.");
      progress(operation, "build", "Building editable Figma frames", 42);
      const batch = await createBatch({
        plans: result.plans,
        snapshot,
        settings,
        frameNames: result.plans.map(
          (plan, index) => variationFrameName(plan.presetName, index + 1)
        ),
        presetLabel: (_b = (_a = PRESETS[settings.preset]) == null ? void 0 : _a.name) != null ? _b : settings.preset,
        warnings: [...result.warnings]
      });
      lastSettings = settings;
      busy = false;
      post("generated", { batch: batch.batch, warnings: batch.warnings });
      sendState();
      figma.notify("GRID CRIMES/ \u2014 four variations generated.", { timeout: 4e3 });
    } catch (error) {
      busy = false;
      sendState();
      fail(operation, error);
    }
  }
  async function resolveVariationFrame(variationId) {
    const variation = currentBatch == null ? void 0 : currentBatch.variations.find((entry) => entry.id === variationId);
    let frameId = variation == null ? void 0 : variation.frameId;
    if (!frameId) {
      const selectedMeta = selectedGenerated.find(
        (entry) => entry.variationId === variationId
      );
      if (selectedMeta) {
        const container = await getSceneNode(selectedMeta.containerId);
        if ((container == null ? void 0 : container.type) === "FRAME") {
          const child = container.children.find((candidate) => {
            const meta2 = generatedMetaFor(candidate);
            return (meta2 == null ? void 0 : meta2.variationId) === variationId;
          });
          frameId = child == null ? void 0 : child.id;
        }
      }
    }
    if (!frameId) {
      for (const node2 of figma.currentPage.selection) {
        const meta2 = generatedMetaFor(node2);
        if ((meta2 == null ? void 0 : meta2.variationId) === variationId) {
          frameId = node2.id;
          break;
        }
      }
    }
    if (!frameId) return null;
    const node = await getSceneNode(frameId);
    if (!node || node.type !== "FRAME") return null;
    const meta = generatedMetaFor(node);
    if (!meta) return null;
    return {
      variation: variation != null ? variation : {
        id: meta.variationId,
        frameId: node.id,
        name: node.name,
        seed: meta.seed,
        preset: meta.preset,
        presetName: meta.presetName,
        grammar: meta.grammar,
        grammarName: meta.grammarName,
        score: meta.score,
        width: node.width,
        height: node.height,
        kept: meta.kept,
        locked: meta.locked,
        thumbnail: null,
        dna: meta.dna
      },
      frame: node,
      meta
    };
  }
  async function handleRegenerate(variationId) {
    var _a, _b;
    if (busy) return;
    const found = await resolveVariationFrame(variationId);
    if (!found) throw new Error("That variation is no longer available.");
    if (found.frame.locked || found.meta.locked) {
      throw new Error("Unlock this variation before regenerating it.");
    }
    busy = true;
    sendState();
    const operation = "regenerate";
    let temp = null;
    try {
      progress(operation, "analyze", "Recovering the composition", 12);
      let snapshot = currentSnapshot;
      if (!snapshot || snapshot.fingerprint !== found.meta.sourceFingerprint) {
        const siblings = (_a = currentBatch == null ? void 0 : currentBatch.variations) != null ? _a : [];
        for (const sibling of siblings) {
          if (sibling.frameId === found.frame.id) continue;
          const frame = await getSceneNode(sibling.frameId);
          if ((frame == null ? void 0 : frame.type) === "FRAME") {
            snapshot = await snapshotFromGeneratedFrame(
              frame,
              found.meta.sourceFingerprint
            );
            if (snapshot) break;
          }
        }
      }
      if (!snapshot) snapshot = await snapshotFromGeneratedFrame(found.frame, found.meta.sourceFingerprint);
      if (!snapshot) throw new Error("The source content for this variation could not be recovered.");
      const sources = await resolveSources(snapshot);
      const fonts = await loadFonts(snapshot);
      progress(operation, "plan", "Re-planning this direction", 30);
      const revision = ((_b = found.meta.revision) != null ? _b : 0) + 1;
      const settings = __spreadValues({}, found.meta.settings);
      const result = generatePlans(snapshot, settings, {
        count: 1,
        grammarIds: [found.meta.grammar],
        salt: `regen:${variationId}:${revision}`
      });
      const plan = result.plans[0];
      if (!plan) throw new Error("No safe layout could be produced.");
      const container = await getSceneNode(found.meta.containerId);
      if (!container || container.type !== "FRAME") {
        throw new Error("The batch container is missing.");
      }
      const built = buildVariationFrame({
        plan,
        snapshot,
        container,
        x: found.frame.x,
        y: found.frame.y,
        index: found.meta.index,
        batchId: found.meta.batchId,
        frameName: found.frame.name,
        sources,
        fonts,
        crossbreed: found.meta.crossbreed
      });
      temp = built.frame;
      built.frame.setPluginData(
        META_KEY,
        encodeMeta(__spreadProps(__spreadValues({}, built.meta), { revision, kept: found.meta.kept }))
      );
      const oldFrame = found.frame;
      oldFrame.remove();
      temp = null;
      const variation = __spreadProps(__spreadValues({}, found.variation), {
        frameId: built.frame.id,
        seed: plan.seed,
        preset: plan.preset,
        presetName: plan.presetName,
        grammar: plan.grammarId,
        grammarName: plan.grammarName,
        score: plan.score,
        thumbnail: await exportThumbnail(built.frame),
        error: void 0,
        dna: plan.dna
      });
      if (currentBatch) {
        currentBatch.variations = currentBatch.variations.map(
          (entry) => entry.id === variation.id ? variation : entry
        );
        saveBatch(currentBatch);
      }
      figma.currentPage.selection = [built.frame];
      figma.viewport.scrollAndZoomIntoView([built.frame]);
      figma.commitUndo();
      post("regenerated", {
        batch: currentBatch,
        variationId,
        warnings: [...result.warnings, ...fonts.warnings]
      });
      sendState();
      figma.notify("GRID CRIMES/ \u2014 variation regenerated.", { timeout: 3e3 });
    } catch (error) {
      try {
        temp == null ? void 0 : temp.remove();
      } catch (e) {
      }
      fail(operation, error);
    } finally {
      busy = false;
      sendState();
    }
  }
  function toCrossbreedParent(meta) {
    var _a;
    return {
      frameId: (_a = meta.sourceIds[0]) != null ? _a : "",
      preset: meta.preset,
      presetName: meta.presetName,
      grammar: meta.grammar,
      seed: meta.seed,
      score: meta.score,
      sourceFingerprint: meta.sourceFingerprint,
      batchId: meta.batchId,
      settings: meta.settings,
      dna: meta.dna
    };
  }
  async function handleCrossbreed(parentAId, parentBId, inheritance, settings) {
    if (busy) return;
    const a = await resolveVariationFrame(parentAId);
    const b = await resolveVariationFrame(parentBId);
    if (!a || !b) throw new Error("One of the selected parents is no longer available.");
    const parentA = __spreadProps(__spreadValues({}, toCrossbreedParent(a.meta)), {
      frameId: a.frame.id
    });
    const parentB = __spreadProps(__spreadValues({}, toCrossbreedParent(b.meta)), {
      frameId: b.frame.id
    });
    const compatibility = canCrossbreed(parentA, parentB);
    if (!compatibility.ok) throw new Error(compatibility.reason);
    busy = true;
    sendState();
    const operation = "crossbreed";
    try {
      progress(operation, "crossbreed", "Reading two design DNAs", 10);
      let snapshot = currentSnapshot && currentSnapshot.fingerprint === parentA.sourceFingerprint ? currentSnapshot : null;
      if (!snapshot) {
        snapshot = await snapshotFromGeneratedFrame(a.frame, parentA.sourceFingerprint);
      }
      if (!snapshot) throw new Error("The crossed content could not be recovered.");
      progress(operation, "plan", "Mixing grammars and constraints", 28);
      const result = crossbreedPlans(snapshot, parentA, parentB, {
        inheritance,
        settings,
        count: 4
      });
      const crossbreed = {
        parentA,
        parentB,
        inheritance,
        offspringIndex: 0
      };
      const label = crossbreedName(parentA, parentB);
      const frameNames = result.plans.map(
        (_, index) => `GRID CRIMES / CROSSBREED / ${String(index + 1).padStart(3, "0")}`
      );
      progress(operation, "build", "Building offspring", 46);
      const batch = await createBatch({
        plans: result.plans,
        snapshot,
        settings: result.settings,
        frameNames,
        presetLabel: `${label} \xB7 ${inheritanceLabel(inheritance, parentA, parentB)}`,
        crossbreed,
        parentMeta: crossbreed,
        warnings: [...result.warnings, `Inheritance: ${inheritance}% \u2014 ${label}`]
      });
      lastSettings = result.settings;
      post("crossbred", {
        batch: batch.batch,
        warnings: [
          ...batch.warnings,
          `${label}: ${inheritanceLabel(inheritance, parentA, parentB)}`
        ]
      });
      sendState();
      figma.notify(`GRID CRIMES/ \u2014 ${label} offspring generated.`, { timeout: 5e3 });
    } catch (error) {
      fail(operation, error);
    } finally {
      busy = false;
      sendState();
    }
  }
  async function handleRemoveBatch(batchId) {
    var _a;
    if (!currentBatch || currentBatch.id !== batchId) {
      throw new Error("That batch is no longer active.");
    }
    const container = await getSceneNode(currentBatch.containerId);
    const removedIds = /* @__PURE__ */ new Set();
    for (const variation of currentBatch.variations) {
      const node = await getSceneNode(variation.frameId);
      if (node) {
        node.remove();
        removedIds.add(node.id);
      }
    }
    for (const id of (_a = currentBatch.auxNodeIds) != null ? _a : []) {
      const node = await getSceneNode(id);
      if (node) {
        node.remove();
        removedIds.add(node.id);
      }
    }
    let leftBehind = 0;
    if (container && container.type === "FRAME") {
      leftBehind = container.children.filter((child) => !removedIds.has(child.id)).length;
      if (leftBehind === 0) container.remove();
      else container.name = `${container.name} / DETACHED`;
    }
    currentBatch = null;
    await figma.clientStorage.deleteAsync(LAST_BATCH_KEY);
    figma.commitUndo();
    sendState();
    toast(
      leftBehind ? "warn" : "ok",
      leftBehind ? "Batch content removed. The container was left in place because it holds non-generated layers." : "Batch removed. The original composition was not touched."
    );
  }
  async function handleRemoveVariation(variationId) {
    const found = await resolveVariationFrame(variationId);
    if (!found) throw new Error("That variation is no longer available.");
    if (found.frame.locked) throw new Error("Unlock this variation before removing it.");
    found.frame.remove();
    if (currentBatch) {
      currentBatch.variations = currentBatch.variations.filter(
        (entry) => entry.id !== variationId
      );
      saveBatch(currentBatch);
    }
    sendState();
  }
  async function handleToggleLock(variationId, locked) {
    const found = await resolveVariationFrame(variationId);
    if (!found) throw new Error("That variation is no longer available.");
    found.frame.locked = locked;
    const meta = __spreadProps(__spreadValues({}, found.meta), { locked, kept: locked });
    refreshMetaOnFrame(found.frame, meta);
    if (currentBatch) {
      currentBatch.variations = currentBatch.variations.map(
        (entry) => entry.id === variationId ? __spreadProps(__spreadValues({}, entry), { locked, kept: locked }) : entry
      );
      saveBatch(currentBatch);
      post("batch-updated", { batch: currentBatch });
    }
    sendState();
  }
  async function handleFocusVariation(variationId) {
    const found = await resolveVariationFrame(variationId);
    if (!found) throw new Error("That variation is no longer available.");
    figma.currentPage.selection = [found.frame];
    figma.viewport.scrollAndZoomIntoView([found.frame]);
    post("focus-done", { target: found.frame.id });
  }
  async function handleFocusBatch(batchId) {
    if (!currentBatch || currentBatch.id !== batchId) {
      throw new Error("That batch is no longer active.");
    }
    const container = await getSceneNode(currentBatch.containerId);
    if (!container) throw new Error("The batch container was removed.");
    figma.currentPage.selection = [container];
    figma.viewport.scrollAndZoomIntoView([container]);
    post("focus-done", { target: container.id });
  }
  async function handleFocusSource() {
    var _a;
    const nodes = [];
    for (const id of (_a = currentSnapshot == null ? void 0 : currentSnapshot.sourceIds) != null ? _a : []) {
      const node = await getSceneNode(id);
      if (node) nodes.push(node);
    }
    if (!nodes.length) throw new Error("The original source is no longer on this page.");
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
    post("focus-done", { target: nodes[0].id });
  }
  async function handleRequest(parsed) {
    switch (parsed.type) {
      case "ready":
        await readBatchSettings();
        await restoreLastBatch();
        await updateFromSelection();
        sendState();
        break;
      case "request-selection":
        await updateFromSelection();
        break;
      case "try-sample": {
        busy = true;
        sendState();
        progress("sample", "sample", "Creating a real editable sample in Figma", 30);
        const frame = await createSampleComposition();
        if (!frame) {
          busy = false;
          throw new Error(
            "The sample could not be created because the Inter font is unavailable."
          );
        }
        await updateFromSelection();
        lastSettings = sanitizeSettings(DEFAULT_SETTINGS);
        busy = false;
        post("toast", {
          tone: "ok",
          message: "Sample composition created as real editable layers. Press Generate."
        });
        sendState();
        break;
      }
      case "set-role":
        if (currentSnapshot) {
          const blocks = currentSnapshot.blocks.map(
            (block) => block.id === parsed.payload.id ? __spreadProps(__spreadValues({}, block), { role: parsed.payload.role }) : block
          );
          const roleCounts = emptyRoleCounts();
          for (const block of blocks) roleCounts[block.role] += 1;
          currentSnapshot = __spreadProps(__spreadValues({}, currentSnapshot), { blocks, roleCounts });
          sendState();
        }
        break;
      case "generate":
        await handleGenerate(parsed.payload.settings, parsed.payload.roleOverrides);
        break;
      case "generate-again":
        await handleGenerate(parsed.payload.settings, parsed.payload.roleOverrides);
        break;
      case "regenerate":
        await handleRegenerate(parsed.payload.variationId);
        break;
      case "crossbreed":
        await handleCrossbreed(
          parsed.payload.parentA,
          parsed.payload.parentB,
          parsed.payload.inheritance,
          parsed.payload.settings
        );
        break;
      case "remove-batch":
        await handleRemoveBatch(parsed.payload.batchId);
        break;
      case "remove-variation":
        await handleRemoveVariation(parsed.payload.variationId);
        break;
      case "focus-variation":
        await handleFocusVariation(parsed.payload.variationId);
        break;
      case "focus-batch":
        await handleFocusBatch(parsed.payload.batchId);
        break;
      case "focus-source":
        await handleFocusSource();
        break;
      case "toggle-lock":
        await handleToggleLock(parsed.payload.variationId, parsed.payload.locked);
        break;
      case "load-batch":
        if ((currentBatch == null ? void 0 : currentBatch.id) === parsed.payload.batchId) {
          sendState();
          void hydrateThumbnails(currentBatch);
        } else {
          const ref = await figma.clientStorage.getAsync(LAST_BATCH_KEY);
          if ((ref == null ? void 0 : ref.batchId) === parsed.payload.batchId) {
            await loadBatchFromContainer(ref.containerId);
          } else {
            throw new Error("That batch is no longer available.");
          }
        }
        break;
      case "request-thumbnails":
        if ((currentBatch == null ? void 0 : currentBatch.id) === parsed.payload.batchId) {
          void hydrateThumbnails(currentBatch);
        }
        break;
      case "help":
        break;
      default:
        break;
    }
  }
  figma.showUI(__html__, {
    width: 440,
    height: 780,
    title: "GRID CRIMES/ \u2014 LAB",
    themeColors: true
  });
  figma.ui.onmessage = async (raw) => {
    const parsed = parseUIRequest(
      raw && typeof raw === "object" && "pluginMessage" in raw ? raw.pluginMessage : raw
    );
    if (!parsed) return;
    if (busy && parsed.type !== "ready" && parsed.type !== "request-selection") {
      return;
    }
    try {
      await handleRequest(parsed);
    } catch (error) {
      busy = false;
      fail(parsed.type, error);
      sendState();
    }
  };
  figma.on("selectionchange", scheduleSelectionUpdate);
  void (async () => {
    await readBatchSettings();
    await restoreLastBatch();
    await updateFromSelection();
  })();
})();
