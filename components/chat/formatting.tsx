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
      // Override paragraph to add spacing and handle citations
      return (
        <p className="my-3">
          {renderCitations(children, message.citations)}
        </p>
      );
    },
    ul: ({ children }: { children: React.ReactNode }) => {
      // Unordered list with bullets
      return <ul className="list-disc list-inside ml-6 my-4">{children}</ul>;
    },
    li: ({ children }: { children: React.ReactNode }) => {
      // Spacing between list items
      return <li className="my-1">{children}</li>;
    },
    h1: ({ children }: { children: React.ReactNode }) => {
      // Heading level 1
      return <h1 className="text-2xl font-bold my-4">{children}</h1>;
    },
    h2: ({ children }: { children: React.ReactNode }) => {
      // Heading level 2
      return <h2 className="text-xl font-bold my-3">{children}</h2>;
    },
    h3: ({ children }: { children: React.ReactNode }) => {
      // Heading level 3
      return <h3 className="text-lg font-semibold my-2">{children}</h3>;
    },
    blockquote: ({ children }: { children: React.ReactNode }) => {
      // Blockquote styling
      return (
        <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">
          {children}
        </blockquote>
      );
    },
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={components}
      // Tailwind Typography classes for a more polished look
      className="prose prose-neutral dark:prose-invert max-w-none"
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
