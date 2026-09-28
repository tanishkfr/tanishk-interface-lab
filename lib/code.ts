import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import githubLight from "shiki/themes/github-light.mjs";
import langTsx from "shiki/langs/tsx.mjs";
import langTs from "shiki/langs/typescript.mjs";
import langCss from "shiki/langs/css.mjs";
import langBash from "shiki/langs/bash.mjs";
import langJson from "shiki/langs/json.mjs";

/**
 * SERVER-ONLY SYNTAX HIGHLIGHTING.
 *
 * Shiki runs at build/request time on the server; the client only ever
 * receives the highlighted HTML. One highlighter instance serves every
 * page, with the JS regex engine so no WASM ships anywhere.
 */

let highlighterPromise: Promise<HighlighterCore> | null = null;

function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [githubLight],
      langs: [langTsx, langTs, langCss, langBash, langJson],
      engine: createJavaScriptRegexEngine(),
    });
  }
  return highlighterPromise;
}

export type CodeLang = "tsx" | "ts" | "css" | "bash" | "json";

export async function highlight(
  code: string,
  lang: CodeLang = "tsx",
): Promise<string> {
  const highlighter = await getHighlighter();
  return highlighter.codeToHtml(code.trim(), {
    lang,
    theme: "github-light",
    structure: "inline",
  });
}
