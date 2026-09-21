"use client";

import React, { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathViewProps {
  math: string;
  block?: boolean;
  className?: string;
}

export function MathView({ math, block = false, className = "" }: MathViewProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
      });
    } catch {
      return math;
    }
  }, [math, block]);

  return (
    <span
      className={`inline-block ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Renders text that may contain inline math denoted by $...$ or $$...$$
 */
export function FormattedTextWithMath({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const parts = useMemo(() => {
    if (!text) return [];
    // Split on $...$ or $$...$$
    const regex = /(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g;
    const tokens: Array<{ type: "text" | "math" | "display-math"; content: string }> = [];
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        tokens.push({ type: "text", content: text.substring(lastIdx, match.index) });
      }
      const raw = match[0];
      if (raw.startsWith("$$") && raw.endsWith("$$")) {
        tokens.push({ type: "display-math", content: raw.slice(2, -2) });
      } else {
        tokens.push({ type: "math", content: raw.slice(1, -1) });
      }
      lastIdx = regex.lastIndex;
    }

    if (lastIdx < text.length) {
      tokens.push({ type: "text", content: text.substring(lastIdx) });
    }

    return tokens;
  }, [text]);

  if (parts.length === 0) return <span className={className}>{text}</span>;

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.type === "text") {
          return <span key={i}>{part.content}</span>;
        }
        return (
          <MathView
            key={i}
            math={part.content}
            block={part.type === "display-math"}
          />
        );
      })}
    </span>
  );
}
