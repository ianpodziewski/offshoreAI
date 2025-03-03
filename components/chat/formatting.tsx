// formatting.tsx
import { DisplayMessage } from "@/types";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { preprocessLaTeX, renderCitations } from "@/utilities/formatting";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

// Helper to extract text and process citations
function withCitations(children: React.ReactNode, citations: any) {
  let textContent = "";
  if (typeof children === "string") {
    textContent = children;
  } else if (Array.isArray(children)) {
    textContent = children
      .map(child => (typeof child === "string" ? child : ""))
      .join("");
  }
  return renderCitations(textContent, citations);
}

export function Formatting({ message }: { message: DisplayMessage }) {
  const processedContent = preprocessLaTeX(message.content);
  const components = {
    code: ({ children, className, node, ...rest }: any) => {
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
    },
    // Apply citation processing to paragraphs, list items, and headings
    p: ({ children }: { children: React.ReactNode }) => (
      <p>{withCitations(children, message.citations)}</p>
    ),
    li: ({ children }: { children: React.ReactNode }) => (
      <li>{withCitations(children, message.citations)}</li>
    ),
    h1: ({ children }: { children: React.ReactNode }) => (
      <h1>{withCitations(children, message.citations)}</h1>
    ),
    h2: ({ children }: { children: React.ReactNode }) => (
      <h2>{withCitations(children, message.citations)}</h2>
    ),
    h3: ({ children }: { children: React.ReactNode }) => (
      <h3>{withCitations(children, message.citations)}</h3>
    ),
    // Add more elements as needed...
  };

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
}




/*
import { DisplayMessage } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { preprocessLaTeX, renderCitations } from "@/utilities/formatting";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

export function Formatting({ message }: { message: DisplayMessage }) {
  const processedContent = preprocessLaTeX(message.content);
  const components = {
    code: ({ children, className, node, ...rest }: any) => {
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
    },
    p: ({ children }: { children: React.ReactNode }) => {
      return renderCitations(children, message.citations);
    },
  };
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
}
*/
