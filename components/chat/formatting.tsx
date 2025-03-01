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
    code: ({ children, className, ...rest }: any) => {
      const match = /language-(\w+)/.exec(className || "");
      return match ? (
        <SyntaxHighlighter
          {...rest}
          PreTag="div"
          className="rounded-xl my-4"
          language={match[1]}
          children={String(children).replace(/\n$/, "")}
        />
      ) : (
        <code {...rest} className={className}>
          {children}
        </code>
      );
    },
    p: ({ children }: { children: React.ReactNode }) => {
      // Paragraph override (for citations or spacing)
      return (
        <p className="my-3">
          {renderCitations(children, message.citations)}
        </p>
      );
    },
    // NEW: Override unordered list
    ul: ({ children }: { children: React.ReactNode }) => {
      return <ul className="list-disc list-inside ml-6 my-4">{children}</ul>;
    },
    // NEW: Override list items
    li: ({ children }: { children: React.ReactNode }) => {
      return <li className="my-1">{children}</li>;
    },
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={components as any}
      className="flex flex-col"
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
