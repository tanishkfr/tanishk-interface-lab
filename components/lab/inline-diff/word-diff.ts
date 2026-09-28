/**
 * WORD DIFF — pure, dependency-free token diffing.
 *
 * Both strings are tokenised into words with their trailing
 * whitespace attached, so joining a run of tokens reconstructs the
 * original text exactly. A standard LCS dynamic program then walks the
 * two token arrays backwards and emits same / removed / added
 * segments in order.
 *
 * The work is bounded: past 400 tokens per side the diff degrades to
 * one removed and one added block instead of a quadratic table.
 */

export type DiffSegment = {
  kind: "same" | "removed" | "added";
  text: string;
};

/** Above this many tokens per side, fall back to a whole-string swap. */
const MAX_TOKENS = 400;

/** A word (with any trailing whitespace) or a run of whitespace. */
const TOKEN_PATTERN = /\s+|\S+\s*/g;

function tokenise(input: string): string[] {
  return input.match(TOKEN_PATTERN) ?? [];
}

export function diffWords(before: string, after: string): DiffSegment[] {
  if (before === after) {
    return before.length > 0 ? [{ kind: "same", text: before }] : [];
  }

  const a = tokenise(before);
  const b = tokenise(after);

  if (a.length > MAX_TOKENS || b.length > MAX_TOKENS) {
    return [
      { kind: "removed", text: before },
      { kind: "added", text: after },
    ];
  }

  const width = b.length + 1;
  const table = new Uint32Array((a.length + 1) * width);

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      table[i * width + j] =
        a[i - 1] === b[j - 1]
          ? table[(i - 1) * width + (j - 1)] + 1
          : Math.max(
              table[(i - 1) * width + j],
              table[i * width + (j - 1)],
            );
    }
  }

  // Walk the table from the end; the ops come out reversed.
  const ops: DiffSegment[] = [];
  let i = a.length;
  let j = b.length;

  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      ops.push({ kind: "same", text: a[i - 1] });
      i -= 1;
      j -= 1;
    } else if (table[(i - 1) * width + j] >= table[i * width + (j - 1)]) {
      ops.push({ kind: "removed", text: a[i - 1] });
      i -= 1;
    } else {
      ops.push({ kind: "added", text: b[j - 1] });
      j -= 1;
    }
  }

  while (i > 0) {
    i -= 1;
    ops.push({ kind: "removed", text: a[i] });
  }

  while (j > 0) {
    j -= 1;
    ops.push({ kind: "added", text: b[j] });
  }

  ops.reverse();
  return groupChanges(ops);
}

/**
 * Inside one change region the walk can interleave removals and
 * additions. Rendering reads better with the removals first, and
 * neither string is affected: only the order of tokens within a
 * region changes, never their membership or their order within a
 * kind. Consecutive ops of the same kind are merged here too.
 */
function groupChanges(ops: DiffSegment[]): DiffSegment[] {
  const grouped: DiffSegment[] = [];
  let index = 0;

  while (index < ops.length) {
    if (ops[index].kind === "same") {
      const previous = grouped[grouped.length - 1];
      if (previous && previous.kind === "same") previous.text += ops[index].text;
      else grouped.push({ kind: "same", text: ops[index].text });
      index += 1;
      continue;
    }

    let removed = "";
    let added = "";
    while (index < ops.length && ops[index].kind !== "same") {
      if (ops[index].kind === "removed") removed += ops[index].text;
      else added += ops[index].text;
      index += 1;
    }

    if (removed.length > 0) grouped.push({ kind: "removed", text: removed });
    if (added.length > 0) grouped.push({ kind: "added", text: added });
  }

  return grouped;
}
