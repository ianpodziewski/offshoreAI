// /components/chat/formatting.tsx
import React, { memo, useMemo } from "react";
import { DisplayMessage } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { preprocessLaTeX, renderCitations } from "@/utilities/formatting";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

// Memoized code component for syntax highlighting
const CodeBlock = memo(({ children, className, ...rest }: any) => {
  const match = /language-(\w+)/.exec(className || "");
  return match ? (
    <SyntaxHighlighter
      {...rest}
      PreTag="div"
      className="rounded-xl"
      children={String(children).replace(/\n$/, "")}
      language={match[1]}
    />
  ) : (
    <code {...rest} className={className}>
      {children}
    </code>
  );
});
CodeBlock.displayName = "CodeBlock";

// Helper for citation processing
const WithCitations = memo(({ children, citations }: { children: React.ReactNode, citations: any }) => {
  let textContent = "";
  if (typeof children === "string") {
    textContent = children;
  } else if (Array.isArray(children)) {
    textContent = children
      .map(child => (typeof child === "string" ? child : ""))
      .join("");
  }
  return renderCitations(textContent, citations);
});
WithCitations.displayName = "WithCitations";

export const Formatting = memo(({ message }: { message: DisplayMessage }) => {
  // Process LaTeX only once per message
  const processedContent = useMemo(() => preprocessLaTeX(message.content), [message.content]);
  
  // Create components object with memoized components
  const components = useMemo(() => ({
    code: CodeBlock,
    // Apply citation processing to paragraphs, list items, and headings
    p: ({ children }: { children: React.ReactNode }) => (
      <p><WithCitations children={children} citations={message.citations} /></p>
    ),
    li: ({ children }: { children: React.ReactNode }) => (
      <li><WithCitations children={children} citations={message.citations} /></li>
    ),
    h1: ({ children }: { children: React.ReactNode }) => (
      <h1><WithCitations children={children} citations={message.citations} /></h1>
    ),
    h2: ({ children }: { children: React.ReactNode }) => (
      <h2><WithCitations children={children} citations={message.citations} /></h2>
    ),
    h3: ({ children }: { children: React.ReactNode }) => (
      <h3><WithCitations children={children} citations={message.citations} /></h3>
    ),
  }), [message.citations]);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={components as any}
      className="gap-3 flex flex-col"
    >
      {processedContent}
    </ReactMarkdown>
  );
});

Formatting.displayName = "Formatting";