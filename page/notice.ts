// A legal text's notice on the samples page (T89 in RUN.md; R69 in docs/decisions.md): the blocks
// scripts/legal.ts gave a version's Markdown, as elements of the page's own document. Every word
// goes in as text, never as HTML, so the page's policy needs nothing more (scripts/csp.ts). A
// heading steps down below the notice's own, of the third level: the text's title, of the first,
// is a heading of the fourth.

import type { Block, Inline } from "./sets.js";

/** The elements of runs of text. */
function inlineNodes(runs: readonly Inline[]): Node[] {
  return runs.map((run) => {
    if ("text" in run) return document.createTextNode(run.text);
    if ("lineBreak" in run) return document.createElement("br");
    if ("code" in run) {
      const code = document.createElement("code");
      code.textContent = run.code;
      return code;
    }
    return "strong" in run ? holding("strong", run.strong) : holding("em", run.emphasis);
  });
}

/** An element of tag holding runs of text. */
function holding(tag: string, runs: readonly Inline[]): HTMLElement {
  const element = document.createElement(tag);
  element.append(...inlineNodes(runs));
  return element;
}

/** The elements of a notice's blocks. */
export function noticeNodes(blocks: readonly Block[]): HTMLElement[] {
  return blocks.map((block) => {
    if ("heading" in block) return holding(`h${Math.min(block.heading + 3, 6)}`, block.inline);
    if ("paragraph" in block) return holding("p", block.paragraph);
    if ("list" in block) {
      const list = document.createElement(block.ordered ? "ol" : "ul");
      if (list instanceof HTMLOListElement && block.start !== 1) list.start = block.start;
      for (const item of block.list) {
        const li = document.createElement("li");
        li.append(...noticeNodes(item));
        list.append(li);
      }
      return list;
    }
    if ("table" in block) {
      const table = document.createElement("table");
      block.table.forEach((row, index) => {
        const tr = document.createElement("tr");
        for (const cell of row) tr.append(holding(index === 0 ? "th" : "td", cell));
        (index === 0 ? table.createTHead() : (table.tBodies[0] ?? table.createTBody())).append(tr);
      });
      return table;
    }
    if ("quote" in block) {
      const quote = document.createElement("blockquote");
      quote.append(...noticeNodes(block.quote));
      return quote;
    }
    if ("code" in block) {
      const pre = document.createElement("pre");
      pre.textContent = block.code;
      return pre;
    }
    return document.createElement("hr");
  });
}
