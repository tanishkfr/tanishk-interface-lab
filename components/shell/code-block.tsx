import { highlight, type CodeLang } from "@/lib/code";
import { CopyButton } from "./copy-button";

/**
 * CODE BLOCK — highlighted on the server, framed as a lab slip.
 * Copying is the only interactive part, so that is the only client code.
 */
export async function CodeBlock({
  code,
  lang = "tsx",
  title,
  dark = false,
}: {
  code: string;
  lang?: CodeLang;
  title?: string;
  dark?: boolean;
}) {
  const html = await highlight(code, lang);

  return (
    <figure className={`code-block${dark ? " code-block--dark" : ""}`}>
      <figcaption className="code-block-head">
        <span className="code-block-title">{title ?? lang}</span>
        <CopyButton text={code} dark={dark} title={title ?? lang} />
      </figcaption>
      <pre tabIndex={0}>
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </figure>
  );
}

/**
 * COLLAPSIBLE SOURCE — a native <details>, so the closed state costs
 * nothing and keyboard behaviour is the browser’s own.
 */
export async function SourceDetails({
  code,
  lang = "tsx",
  title,
  open = false,
}: {
  code: string;
  lang?: CodeLang;
  title: string;
  open?: boolean;
}) {
  const html = await highlight(code, lang);

  return (
    <details className="code-details" open={open}>
      <summary>
        {title}
        <span className="sr-only">
          — press enter to show or hide the source
        </span>
      </summary>
      <figure className="code-block">
        <figcaption className="code-block-head">
          <span className="code-block-title">{lang}</span>
          <CopyButton text={code} title={title} />
        </figcaption>
        <pre tabIndex={0}>
          <code dangerouslySetInnerHTML={{ __html: html }} />
        </pre>
      </figure>
    </details>
  );
}
