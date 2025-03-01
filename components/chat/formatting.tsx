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
    // Override code blocks to use SyntaxHighlighter with some custom styling
    code: ({ children, className, ...rest }: any) => {
      const match = /language-(\w+)/.exec(className || "");
      return match ? (
        <SyntaxHighlighter
          {...rest}
          PreTag="div"
          className="rounded-xl my-4" // adds margin for spacing
          language={match[1]}
          children={String(children).replace(/\n$/, "")}
        />
      ) : (
        <code {...rest} className={className}>
          {children}
        </code>
      );
    },
    // Custom paragraph component that applies a margin and renders citations
    p: ({ children }: { children: React.ReactNode }) => {
      return (
        <p className="my-4">
          {renderCitations(children, message.citations)}
        </p>
      );
    },
    // Custom heading components to add bold and spacing
    h1: ({ children }: { children: React.ReactNode }) => {
      return <h1 className="text-2xl font-bold my-4">{children}</h1>;
    },
    h2: ({ children }: { children: React.ReactNode }) => {
      return <h2 className="text-xl font-bold my-3">{children}</h2>;
    },
    h3: ({ children }: { children: React.ReactNode }) => {
      return <h3 className="text-lg font-bold my-2">{children}</h3>;
    },
    // Optionally, add more customizations for lists, blockquotes, etc.
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
