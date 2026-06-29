/**
 * Minimal, XSS-SAFE Markdown renderer for assistant replies.
 *
 * The assistant writes Markdown (e.g. **bold**, # headings, - lists). Rendering
 * it as raw text showed the literal markers; rendering it as HTML would be an
 * injection risk. Instead we parse it into React elements whose content is only
 * ever plain text nodes — we NEVER use dangerouslySetInnerHTML — so a payload
 * like `<script>` is shown verbatim and can never execute (OWASP A05).
 *
 * Supported: #/##/### headings, - / * / + and 1. ordered lists, and inline
 * **bold**, *italic* / _italic_, and `code`. Anything else renders as text.
 */

/** Parse inline emphasis/code within a single line into React nodes. */
function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Order matters: **bold** and __bold__ before single * / _ italics.
  const re = /(\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_|`([^`]+)`)/g;
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[2] !== undefined || m[3] !== undefined) {
      nodes.push(<strong key={key++}>{m[2] ?? m[3]}</strong>);
    } else if (m[4] !== undefined || m[5] !== undefined) {
      nodes.push(<em key={key++}>{m[4] ?? m[5]}</em>);
    } else if (m[6] !== undefined) {
      nodes.push(
        <code
          key={key++}
          className="rounded px-1 py-0.5 text-[0.85em]"
          style={{ background: "color-mix(in srgb, var(--color-fg) 9%, transparent)" }}
        >
          {m[6]}
        </code>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/** Render Markdown text into block-level React elements (lists, headings, …). */
export function renderMarkdown(text: string): React.ReactNode {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const out: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let key = 0;

  const flushList = () => {
    if (!list) return;
    const items = list.items.map((it, i) => <li key={i}>{renderInline(it)}</li>);
    out.push(
      list.ordered ? (
        <ol key={`l${key++}`} className="my-1.5 ml-5 list-decimal space-y-0.5">
          {items}
        </ol>
      ) : (
        <ul key={`l${key++}`} className="my-1.5 ml-5 list-disc space-y-0.5">
          {items}
        </ul>
      ),
    );
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushList();
      continue;
    }
    let m: RegExpExecArray | null;
    if ((m = /^###\s+(.*)/.exec(line))) {
      flushList();
      out.push(<h3 key={key++} className="mt-2 mb-1 text-sm font-bold">{renderInline(m[1])}</h3>);
    } else if ((m = /^##\s+(.*)/.exec(line))) {
      flushList();
      out.push(<h2 key={key++} className="mt-2 mb-1 text-base font-bold">{renderInline(m[1])}</h2>);
    } else if ((m = /^#\s+(.*)/.exec(line))) {
      flushList();
      out.push(<h1 key={key++} className="mt-2 mb-1 text-lg font-extrabold">{renderInline(m[1])}</h1>);
    } else if ((m = /^[-*+]\s+(.*)/.exec(line))) {
      if (!list || list.ordered) {
        flushList();
        list = { ordered: false, items: [] };
      }
      list.items.push(m[1]);
    } else if ((m = /^\d+[.)]\s+(.*)/.exec(line))) {
      if (!list || !list.ordered) {
        flushList();
        list = { ordered: true, items: [] };
      }
      list.items.push(m[1]);
    } else {
      flushList();
      out.push(<p key={key++} className="my-1 first:mt-0 last:mb-0">{renderInline(line)}</p>);
    }
  }
  flushList();
  return out;
}
