import { Fragment, type ReactNode } from "react";

/**
 * Lightweight markdown renderer for AI assistant replies.
 * Supports the subset the model produces: paragraphs, bold (`**`), inline
 * links (`[text](url)`), and ordered/unordered lists with one nesting level.
 * Anything unrecognised falls back to plain text, so it can never throw on
 * unexpected input.
 */

type ListItem = { text: string; children: string[] };
type Block =
  | { kind: "p"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "list"; ordered: boolean; items: ListItem[] };

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let token = 0;
  let match: RegExpExecArray | null;

  // A fresh regex per call: renderInline recurses for bold-wrapped links, so a
  // shared /g regex would have its lastIndex clobbered mid-iteration.
  const inline = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  while ((match = inline.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[1] !== undefined) {
      nodes.push(
        <strong key={`${keyPrefix}-b${token}`} className="font-semibold">
          {renderInline(match[1], `${keyPrefix}-b${token}`)}
        </strong>,
      );
    } else {
      nodes.push(
        <a
          key={`${keyPrefix}-a${token}`}
          href={match[3]}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-zinc-900 underline underline-offset-2 transition-colors hover:text-zinc-500"
        >
          {match[2]}
        </a>,
      );
    }

    lastIndex = inline.lastIndex;
    token += 1;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function parseBlocks(content: string): Block[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: { ordered: boolean; items: ListItem[] } | null = null;

  const flushPara = () => {
    if (para.length) {
      blocks.push({ kind: "p", text: para.join(" ") });
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push({ kind: "list", ordered: list.ordered, items: list.items });
      list = null;
    }
  };

  for (const raw of lines) {
    if (!raw.trim()) {
      // A blank line ends a paragraph, but the model often separates list
      // items with blank lines — keep the list open so numbering continues.
      flushPara();
      continue;
    }

    const indent = raw.length - raw.trimStart().length;
    const heading = raw.match(/^\s*#{1,6}\s+(.*)$/);
    const ordered = raw.match(/^\s*(\d+)\.\s+(.*)$/);
    const unordered = raw.match(/^\s*[*-]\s+(.*)$/);

    if (heading) {
      flushPara();
      flushList();
      blocks.push({ kind: "heading", text: heading[1] });
    } else if (ordered) {
      flushPara();
      if (!list || !list.ordered) {
        flushList();
        list = { ordered: true, items: [] };
      }
      list.items.push({ text: ordered[2], children: [] });
    } else if (unordered && indent >= 2 && list && list.items.length) {
      list.items[list.items.length - 1].children.push(unordered[1]);
    } else if (unordered) {
      flushPara();
      if (!list || list.ordered) {
        flushList();
        list = { ordered: false, items: [] };
      }
      list.items.push({ text: unordered[1], children: [] });
    } else if (list && indent >= 2 && list.items.length) {
      // wrapped continuation of the current list item
      list.items[list.items.length - 1].text += ` ${raw.trim()}`;
    } else {
      flushList();
      para.push(raw.trim());
    }
  }

  flushPara();
  flushList();
  return blocks;
}

export function AiMessageContent({ content }: { content: string }) {
  const blocks = parseBlocks(content);

  return (
    <div className="space-y-2 leading-relaxed">
      {blocks.map((block, i) => {
        if (block.kind === "heading") {
          return (
            <p key={i} className="font-semibold text-zinc-900">
              {renderInline(block.text, `h${i}`)}
            </p>
          );
        }

        if (block.kind === "p") {
          return (
            <p key={i}>{renderInline(block.text, `p${i}`)}</p>
          );
        }

        const ListTag = block.ordered ? "ol" : "ul";
        return (
          <ListTag
            key={i}
            className={`space-y-1.5 pl-5 ${
              block.ordered
                ? "list-decimal marker:text-zinc-400"
                : "list-disc marker:text-zinc-400"
            }`}
          >
            {block.items.map((item, j) => (
              <li key={j} className="pl-1">
                <Fragment>{renderInline(item.text, `l${i}-${j}`)}</Fragment>
                {item.children.length > 0 ? (
                  <ul className="mt-1 space-y-1 pl-4 list-disc marker:text-zinc-300">
                    {item.children.map((child, k) => (
                      <li key={k} className="pl-1">
                        {renderInline(child, `l${i}-${j}-${k}`)}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ListTag>
        );
      })}
    </div>
  );
}
