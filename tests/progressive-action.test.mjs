import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const source = readFileSync(new URL("../components/lab/progressive-action/progressive-action.tsx", import.meta.url), "utf8");
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
const exports = {};
runInNewContext(code, { exports, require: (name) => name.endsWith(".css") ? {} : require(name) });
const { ProgressiveAction } = exports;
const render = (phase, props = {}) => renderToStaticMarkup(React.createElement(ProgressiveAction, { phase, ...props }));

test("unavailable progressive actions do not appear actionable", () => {
  assert.match(render("ready"), /aria-disabled="true"/);
  assert.doesNotMatch(render("running"), />Cancel</);
  assert.doesNotMatch(render("error"), />Retry</);
  assert.match(render("review"), /<button[^>]*disabled=""[^>]*>Accept</);
  assert.match(render("ready", { onRun() {} }), /aria-disabled="false"/);
});
