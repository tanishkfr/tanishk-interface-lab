/**
 * COMPOSER PARSE — pure, deterministic text-to-structure parsing.
 *
 * No React, no DOM, no dependencies: the same sentence always produces
 * the same structure, which keeps the composer testable and completely
 * offline.
 *
 * Priority order (the first rule that fires wins):
 *   link > math > meeting > task > place > person > text
 * A URL is never a meeting, arithmetic is narrow and unambiguous,
 * scheduling phrases are more specific than generic lists, capitalised
 * places are more intentional than capitalised names, and text is the
 * honest fallback.
 */

export type ComposerIntent =
  | "text"
  | "task"
  | "meeting"
  | "math"
  | "place"
  | "person"
  | "link";

export type ParsedTask = { text: string; done: false };
export type ParsedMeeting = {
  title: string;
  day: string | null;
  time: string | null;
  durationMin: number | null;
};
export type ParsedMath = { expression: string; result: number | null };
export type ParsedPlace = { name: string; context: string | null };
export type ParsedPerson = { names: string[]; verbs: string[] };

export type ComposerPayload =
  | { intent: "text" }
  | { intent: "task"; tasks: ParsedTask[] }
  | { intent: "meeting"; meeting: ParsedMeeting }
  | { intent: "math"; math: ParsedMath }
  | { intent: "place"; place: ParsedPlace }
  | { intent: "person"; person: ParsedPerson }
  | { intent: "link"; url: string };

/* Confidence is fixed per rule so the composer never pretends to guess. */
const CONFIDENCE = {
  link: 0.9,
  math: 0.95,
  meeting: 0.85,
  task: 0.85,
  place: 0.7,
  person: 0.65,
  text: 0.3,
} as const;

const INTENT_LABELS: Record<ComposerIntent, string> = {
  text: "Text",
  task: "Tasks",
  meeting: "Meeting",
  math: "Calculation",
  place: "Place",
  person: "People",
  link: "Link",
};

export function formatIntent(intent: ComposerIntent): string {
  return INTENT_LABELS[intent];
}

/* ------------------------------------------------------------------ *
 * Link                                                                 *
 * ------------------------------------------------------------------ */

/*
 * A scheme or www prefix matches anything; a bare domain must end in a
 * known TLD so prose like "one.hour" or "e.g." never reads as a link.
 */
const TLDS =
  "com|org|net|io|dev|app|ai|co|me|info|biz|design|studio|xyz|edu|gov|" +
  "us|uk|ca|au|de|fr|es|it|nl|se|no|fi|dk|eu|tv|fm|gg|sh|to|so|ly|" +
  "codes|tools|works|space|site|online|page|art|blog|email|tech";

const LINK_RE = new RegExp(
  `(?:https?:\\/\\/|www\\.)[^\\s]+|\\b[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.(?:${TLDS})(?:\\.[a-z]{2})?(?:\\/[^\\s]*)?`,
  "i",
);

function matchLink(text: string): string | null {
  const match = LINK_RE.exec(text);
  if (!match) return null;
  return match[0].replace(/[),.;:!?]+$/, "");
}

/* ------------------------------------------------------------------ *
 * Math                                                                 *
 * ------------------------------------------------------------------ */

/* A leading phrase and a trailing question mark are noise, not maths. */
const MATH_PREFIX =
  /^(?:what\s*(?:'s|is)|what's|how\s+much\s+is|calc(?:ulate)?|compute|=)\s*/i;
const MATH_ONLY = /^[\d\s+\-*/%().^]+$/;
const MATH_OPERATOR = /[+\-*/%^]/;

function mathExpression(text: string): string | null {
  const expression = text.replace(MATH_PREFIX, "").replace(/\?+$/, "").trim();
  if (!expression || !MATH_ONLY.test(expression)) return null;
  if (!MATH_OPERATOR.test(expression)) return null;
  const numbers = expression.match(/\d+/g) ?? [];
  if (numbers.length < 2) return null;
  return expression;
}

/**
 * Safe arithmetic evaluator: numbers, + - * / % ( ) and ^ only.
 * A tiny recursive-descent parser — never eval(), never Function.
 * Returns null for malformed input, division by zero or non-finite
 * results.
 */
export function evaluateExpression(expression: string): number | null {
  const src = expression.replace(/\s+/g, "");
  if (!src || src.length > 200) return null;

  const tokens: Array<number | string> = [];
  let i = 0;
  while (i < src.length) {
    const ch = src.charAt(i);
    if ((ch >= "0" && ch <= "9") || ch === ".") {
      let j = i;
      while (j < src.length) {
        const next = src.charAt(j);
        if ((next >= "0" && next <= "9") || next === ".") j += 1;
        else break;
      }
      const raw = src.slice(i, j);
      if (raw === "." || (raw.match(/\./g) ?? []).length > 1) return null;
      const value = Number(raw);
      if (!Number.isFinite(value)) return null;
      tokens.push(value);
      i = j;
      continue;
    }
    if ("+-*/%^()".indexOf(ch) !== -1) {
      tokens.push(ch);
      i += 1;
      continue;
    }
    return null;
  }

  let pos = 0;
  const token = (): number | string | undefined => tokens[pos];

  const parsePrimary = (): number | null => {
    const current = token();
    if (typeof current === "number") {
      pos += 1;
      return current;
    }
    if (current === "(") {
      pos += 1;
      const value = parseExpression();
      if (value === null || token() !== ")") return null;
      pos += 1;
      return value;
    }
    return null;
  };

  const parsePower = (): number | null => {
    const base = parsePrimary();
    if (base === null) return null;
    if (token() === "^") {
      pos += 1;
      const exponent = parseUnary();
      if (exponent === null) return null;
      const value = Math.pow(base, exponent);
      return Number.isFinite(value) ? value : null;
    }
    return base;
  };

  const parseUnary = (): number | null => {
    const current = token();
    if (current === "-" || current === "+") {
      pos += 1;
      const value = parseUnary();
      if (value === null) return null;
      return current === "-" ? -value : value;
    }
    return parsePower();
  };

  const parseTerm = (): number | null => {
    const first = parseUnary();
    if (first === null) return null;
    let value: number = first;
    for (;;) {
      const op = token();
      if (op !== "*" && op !== "/" && op !== "%") break;
      pos += 1;
      const rhs = parseUnary();
      if (rhs === null) return null;
      const next: number =
        op === "*" ? value * rhs : op === "/" ? value / rhs : value % rhs;
      if (!Number.isFinite(next)) return null;
      value = next;
    }
    return value;
  };

  const parseExpression = (): number | null => {
    const first = parseTerm();
    if (first === null) return null;
    let value: number = first;
    for (;;) {
      const op = token();
      if (op !== "+" && op !== "-") break;
      pos += 1;
      const rhs = parseTerm();
      if (rhs === null) return null;
      const next: number = op === "+" ? value + rhs : value - rhs;
      if (!Number.isFinite(next)) return null;
      value = next;
    }
    return value;
  };

  const result = parseExpression();
  if (result === null || pos !== tokens.length) return null;
  return result;
}

/* ------------------------------------------------------------------ *
 * Day, time, duration                                                  *
 * ------------------------------------------------------------------ */

type Match<T> = { value: T; raw: string };

const DAY_WORDS: Array<[RegExp, string]> = [
  [/\bnext\s+week\b/i, "Next week"],
  [/\btoday\b/i, "Today"],
  [/\btomorrow\b/i, "Tomorrow"],
  [/\bmon(?:day)?\b/i, "Monday"],
  [/\btue(?:s(?:day)?)?\b/i, "Tuesday"],
  [/\bwed(?:nesday)?\b/i, "Wednesday"],
  [/\bthu(?:r(?:s(?:day)?)?)?\b/i, "Thursday"],
  [/\bfri(?:day)?\b/i, "Friday"],
  [/\bsat(?:urday)?\b/i, "Saturday"],
  [/\bsun(?:day)?\b/i, "Sunday"],
];

function matchDay(text: string): Match<string> | null {
  for (const [pattern, label] of DAY_WORDS) {
    const match = pattern.exec(text);
    if (match) return { value: label, raw: match[0] };
  }
  return null;
}

type TimeMatch = Match<string> & { hour: number; minute: number };

function matchTime(text: string): TimeMatch | null {
  const meridiem = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i.exec(text);
  if (meridiem) {
    const hour = Number(meridiem[1]);
    const minute = meridiem[2] ? Number(meridiem[2]) : 0;
    if (hour < 1 || hour > 12 || minute > 59) return null;
    const h24 = (hour % 12) + (meridiem[3].toLowerCase() === "pm" ? 12 : 0);
    return {
      value: `${String(h24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      raw: meridiem[0],
      hour: h24,
      minute,
    };
  }
  const clock = /\b(\d{1,2}):(\d{2})\b/.exec(text);
  if (clock) {
    const hour = Number(clock[1]);
    const minute = Number(clock[2]);
    if (hour > 23 || minute > 59) return null;
    return {
      value: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      raw: clock[0],
      hour,
      minute,
    };
  }
  return null;
}

export function parseDayTime(text: string): {
  day: string | null;
  time: string | null;
} {
  return {
    day: matchDay(text)?.value ?? null,
    time: matchTime(text)?.value ?? null,
  };
}

const HOUR_AND_HALF = /\ban?\s+hour\s+and\s+a\s+half\b/i; // 90 min
const HALF_AN_HOUR = /\bhalf\s+an?\s+hour\b/i; // 30 min
const HOURS_MINUTES =
  /(\d+)\s*h(?:(?:ou)?rs?)?(?:\s*(\d+)\s*m?(?:in(?:ute)?s?)?)?/i;
const MINUTES = /(\d+)\s*(?:min(?:ute)?s?|m)\b/i;
const WORD_HOURS = /\b(one|two|three|four|five|six|an?)\s+hours?\b/i;
const COUPLE_HOURS = /\ba\s+couple\s+of\s+hours\b/i;

const WORD_HOUR_VALUES: Record<string, number> = {
  one: 1,
  an: 1,
  a: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
};

/** "45m" → 45, "1h30" → 90, "one hour" → 60. Null when nothing matches. */
export function parseDuration(text: string): number | null {
  return matchDuration(text)?.value ?? null;
}

function matchDuration(text: string): Match<number> | null {
  const ninety = HOUR_AND_HALF.exec(text);
  if (ninety) return { value: 90, raw: ninety[0] };
  const thirty = HALF_AN_HOUR.exec(text);
  if (thirty) return { value: 30, raw: thirty[0] };
  const hours = HOURS_MINUTES.exec(text);
  if (hours) {
    const minutes = Number(hours[1]) * 60 + (hours[2] ? Number(hours[2]) : 0);
    if (minutes > 0) return { value: minutes, raw: hours[0] };
  }
  const plain = MINUTES.exec(text);
  if (plain) {
    const minutes = Number(plain[1]);
    if (minutes > 0) return { value: minutes, raw: plain[0] };
  }
  const couple = COUPLE_HOURS.exec(text);
  if (couple) return { value: 120, raw: couple[0] };
  const words = WORD_HOURS.exec(text);
  if (words) {
    const hoursCount = WORD_HOUR_VALUES[words[1].toLowerCase()] ?? 0;
    if (hoursCount > 0) return { value: hoursCount * 60, raw: words[0] };
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * Meeting                                                              *
 * ------------------------------------------------------------------ */

const MEETING_VERBS =
  /\b(meet|meeting|call|review|stand-?up|sync|catch\s+up|schedule|book)\b/i;

function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function meetingTitle(
  text: string,
  day: Match<string> | null,
  time: TimeMatch | null,
  duration: Match<number> | null,
): string {
  let title = text;
  for (const raw of [day?.raw, time?.raw, duration?.raw]) {
    if (raw) title = title.replace(raw, " ");
  }
  title = title.replace(/\s+/g, " ").trim();
  title = title.replace(
    /^(?:(?:meet|meeting|call|review|stand-?up|sync|catch\s+up|schedule|book)\b[\s:,.-]*)+/i,
    "",
  );
  /* Fragments often leave a dangling connector at either end. */
  title = title.replace(/^(?:on|at|for|in|from|by|about)\b\s*/i, "");
  title = title.replace(/(?:\s+(?:on|at|for|in|from|by|about))+\s*$/i, "");
  title = title.replace(/\s+/g, " ").trim();
  return capitalize(title) || "Meeting";
}

/* ------------------------------------------------------------------ *
 * Tasks                                                                *
 * ------------------------------------------------------------------ */

const TASK_SPLIT =
  /\n+|\s*;\s*|\s*,\s*then\s+|\s+and\s+then\s+|\s+then\s+/i;
const ACTION_START =
  /^(?:add|ask|book|buy|call|check|create|draft|email|file|finish|fix|follow\s+up|make|move|order|pay|ping|plan|prepare|read|renew|review|schedule|send|ship|summari[sz]e|update|write)\b/i;

/* ------------------------------------------------------------------ *
 * Place and person                                                     *
 * ------------------------------------------------------------------ */

const PLACE_RE =
  /\b(?:[Ii]n|[Aa]t|[Nn]ear|[Aa]round)\s+([A-Z][\w'-]*(?:\s+[A-Z][\w'-]*)*)/;

const PERSON_RE =
  /\b(with|ask|tell|email|ping)\s+([A-Z][a-z]+(?:[, ]+(?:and\s+)?[A-Z][a-z]+)*)/g;

/* ------------------------------------------------------------------ *
 * The parser                                                           *
 * ------------------------------------------------------------------ */

export function parseComposerInput(text: string): {
  intent: ComposerIntent;
  confidence: number;
  payload: ComposerPayload;
} {
  const trimmed = text.trim();
  if (!trimmed) {
    return { intent: "text", confidence: CONFIDENCE.text, payload: { intent: "text" } };
  }

  /* 1 — link */
  const url = matchLink(trimmed);
  if (url) {
    return {
      intent: "link",
      confidence: CONFIDENCE.link,
      payload: { intent: "link", url },
    };
  }

  /* 2 — math */
  const expression = mathExpression(trimmed);
  if (expression) {
    return {
      intent: "math",
      confidence: CONFIDENCE.math,
      payload: {
        intent: "math",
        math: { expression, result: evaluateExpression(expression) },
      },
    };
  }

  /* 3 — meeting */
  const day = matchDay(trimmed);
  const time = matchTime(trimmed);
  const duration = matchDuration(trimmed);
  if ((day || time) && (duration || MEETING_VERBS.test(trimmed))) {
    return {
      intent: "meeting",
      confidence: CONFIDENCE.meeting,
      payload: {
        intent: "meeting",
        meeting: {
          title: meetingTitle(trimmed, day, time, duration),
          day: day?.value ?? null,
          time: time?.value ?? null,
          durationMin: duration?.value ?? null,
        },
      },
    };
  }

  /* 4 — task */
  const segments = trimmed
    .split(TASK_SPLIT)
    .map((segment) => segment.trim())
    .filter(Boolean);
  if (
    segments.length >= 2 ||
    (ACTION_START.test(trimmed) && /\bthen\b/i.test(trimmed))
  ) {
    const tasks: ParsedTask[] = segments.map((segment) => ({
      text: capitalize(segment),
      done: false,
    }));
    return {
      intent: "task",
      confidence: CONFIDENCE.task,
      payload: { intent: "task", tasks },
    };
  }

  /* 5 — place */
  const place = PLACE_RE.exec(trimmed);
  if (place) {
    const rest = trimmed.slice(place.index + place[0].length).trim();
    return {
      intent: "place",
      confidence: CONFIDENCE.place,
      payload: {
        intent: "place",
        place: { name: place[1], context: rest || null },
      },
    };
  }

  /* 6 — person */
  const names: string[] = [];
  const verbs: string[] = [];
  PERSON_RE.lastIndex = 0;
  for (;;) {
    const match = PERSON_RE.exec(trimmed);
    if (!match) break;
    for (const name of match[2].split(/\s*(?:,|\band\b)\s*/)) {
      if (name && !names.includes(name)) names.push(name);
    }
    const verb = match[1].toLowerCase();
    if (!verbs.includes(verb)) verbs.push(verb);
  }
  if (names.length > 0) {
    return {
      intent: "person",
      confidence: CONFIDENCE.person,
      payload: { intent: "person", person: { names, verbs } },
    };
  }

  /* 7 — text */
  return { intent: "text", confidence: CONFIDENCE.text, payload: { intent: "text" } };
}
