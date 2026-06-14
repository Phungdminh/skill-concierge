// Minimal, safe markdown → HTML for tool descriptions.
// We escape first, then apply a small set of patterns. Anything we don't
// understand is left as text.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inline(text: string): string {
  // links — [label](url) where url is http(s) or relative path
  text = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g,
    (_m, label, url) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-brand-orange underline-offset-2 hover:underline">${label}</a>`,
  );
  // bold
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // italic
  text = text.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  // inline code
  text = text.replace(
    /`([^`]+)`/g,
    '<code class="rounded bg-muted px-1.5 py-0.5 text-[0.9em] text-foreground/95">$1</code>',
  );
  return text;
}

export function renderMarkdown(input: string | null | undefined): string {
  if (!input) return '';
  const escaped = escapeHtml(input);
  const lines = escaped.split('\n');
  const out: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let inCode = false;
  let codeBuf: string[] = [];
  let paragraph: string[] = [];
  let sectionOpen = false;

  function ensureSection() {
    if (sectionOpen) return;
    out.push('<section class="description-section">');
    sectionOpen = true;
  }
  function closeSection() {
    if (!sectionOpen) return;
    out.push('</section>');
    sectionOpen = false;
  }
  function flushParagraph() {
    if (paragraph.length === 0) return;
    ensureSection();
    out.push(`<p class="my-3 text-foreground/80 leading-relaxed">${inline(paragraph.join(' '))}</p>`);
    paragraph = [];
  }
  function flushList() {
    if (!listType) return;
    out.push(`</${listType}>`);
    listType = null;
  }

  for (const raw of lines) {
    const line = raw;

    if (line.startsWith('```')) {
      flushParagraph();
      flushList();
      if (inCode) {
        ensureSection();
        out.push(
          `<pre class="my-4 overflow-x-auto rounded-xl border border-border bg-card p-4 text-[12.5px] leading-relaxed text-foreground/85"><code>${codeBuf.join('\n')}</code></pre>`,
        );
        codeBuf = [];
        inCode = false;
      } else {
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      continue;
    }

    if (/^#{1,6}\s/.test(line)) {
      flushParagraph();
      flushList();
      const level = line.match(/^#+/)![0].length;
      if (level <= 2) closeSection();
      ensureSection();
      const text = inline(line.replace(/^#+\s/, ''));
      const cls =
        level === 1
          ? 'mb-4 text-2xl font-semibold tracking-tight md:text-3xl'
          : level === 2
            ? 'mb-4 text-xl font-semibold tracking-tight md:text-2xl'
            : 'mt-5 mb-2 text-base font-semibold tracking-tight text-foreground/95';
      out.push(`<h${Math.min(level, 4)} class="${cls}">${text}</h${Math.min(level, 4)}>`);
      continue;
    }

    const ulMatch = line.match(/^[-*]\s+(.*)$/);
    const olMatch = line.match(/^\d+\.\s+(.*)$/);
    if (ulMatch || olMatch) {
      flushParagraph();
      ensureSection();
      const desired = ulMatch ? 'ul' : 'ol';
      if (listType !== desired) {
        flushList();
        const cls =
          desired === 'ul'
            ? 'my-3 list-disc space-y-1.5 pl-6 text-foreground/80 marker:text-foreground/40'
            : 'my-3 list-decimal space-y-1.5 pl-6 text-foreground/80 marker:text-foreground/40';
        out.push(`<${desired} class="${cls}">`);
        listType = desired;
      }
      out.push(`<li>${inline((ulMatch ?? olMatch)![1])}</li>`);
      continue;
    }

    if (line.trim() === '') {
      flushParagraph();
      flushList();
      continue;
    }

    paragraph.push(line.trim());
  }
  flushParagraph();
  flushList();
  if (inCode && codeBuf.length) {
    ensureSection();
    out.push(
      `<pre class="my-4 overflow-x-auto rounded-xl border border-border bg-card p-4 text-[12.5px] leading-relaxed text-foreground/85"><code>${codeBuf.join('\n')}</code></pre>`,
    );
  }
  closeSection();
  return out.join('\n');
}
