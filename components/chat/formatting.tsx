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
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Memoized code component for syntax highlighting with dark theme
const CodeBlock = memo(({ children, className, ...rest }: any) => {
  const match = /language-(\w+)/.exec(className || "");
  return match ? (
    <SyntaxHighlighter
      {...rest}
      PreTag="div"
      className="rounded-lg my-3 text-sm"
      style={vscDarkPlus}
      children={String(children).replace(/\n$/, "")}
      language={match[1]}
      showLineNumbers={true}
      customStyle={{
        margin: '0.75rem 0',
        padding: '1rem',
        borderRadius: '0.5rem',
        backgroundColor: '#1E2030'
      }}
    />
  ) : (
    <code {...rest} className={`px-1.5 py-0.5 rounded bg-gray-800 text-gray-200 ${className}`}>
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
      <p className="text-gray-200 my-2"><WithCitations children={children} citations={message.citations} /></p>
    ),
    
    li: ({ children }: { children: React.ReactNode }) => (
      <li className="text-gray-200 ml-6 my-1"><WithCitations children={children} citations={message.citations} /></li>
    ),
    
    ul: ({ children }: { children: React.ReactNode }) => (
      <ul className="list-disc my-3 space-y-1">{children}</ul>
    ),
    
    ol: ({ children }: { children: React.ReactNode }) => (
      <ol className="list-decimal my-3 space-y-1">{children}</ol>
    ),
    
    blockquote: ({ children }: { children: React.ReactNode }) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 my-4 py-1 text-gray-300 bg-gray-800/30 rounded-r-md">
        {children}
      </blockquote>
    ),
    
    h1: ({ children }: { children: React.ReactNode }) => (
      <h1 className="text-2xl font-bold text-white mt-6 mb-3"><WithCitations children={children} citations={message.citations} /></h1>
    ),
    
    h2: ({ children }: { children: React.ReactNode }) => (
      <h2 className="text-xl font-bold text-white mt-5 mb-2"><WithCitations children={children} citations={message.citations} /></h2>
    ),
    
    h3: ({ children }: { children: React.ReactNode }) => (
      <h3 className="text-lg font-bold text-white mt-4 mb-2"><WithCitations children={children} citations={message.citations} /></h3>
    ),
    
    a: ({ children, href }: { children: React.ReactNode, href?: string }) => (
      <a 
        href={href} 
        className="text-blue-400 hover:text-blue-300 hover:underline transition-colors" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    
    table: ({ children }: { children: React.ReactNode }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border border-gray-700 rounded-md">
          {children}
        </table>
      </div>
    ),
    
    thead: ({ children }: { children: React.ReactNode }) => (
      <thead className="bg-gray-800 text-gray-200">{children}</thead>
    ),
    
    th: ({ children }: { children: React.ReactNode }) => (
      <th className="px-4 py-2 border-b border-gray-700 text-left">{children}</th>
    ),
    
    td: ({ children }: { children: React.ReactNode }) => (
      <td className="px-4 py-2 border-b border-gray-700">{children}</td>
    ),
    
    tr: ({ children }: { children: React.ReactNode }) => (
      <tr className="hover:bg-gray-800/70 transition-colors">{children}</tr>
    ),
    
    hr: () => (
      <hr className="my-6 border-gray-700" />
    ),
    
    strong: ({ children }: { children: React.ReactNode }) => (
      <strong className="font-bold text-white">{children}</strong>
    ),
    
    em: ({ children }: { children: React.ReactNode }) => (
      <em className="italic text-gray-300">{children}</em>
    ),
    
    img: ({ src, alt }: { src?: string, alt?: string }) => (
      <img 
        src={src} 
        alt={alt || 'Image'} 
        className="rounded-md max-w-full my-4 mx-auto border border-gray-700"
      />
    ),
  }), [message.citations]);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={components as any}
      className="prose prose-invert max-w-none text-gray-200 py-2 leading-relaxed"
    >
      {processedContent}
    </ReactMarkdown>
  );
});

Formatting.displayName = "Formatting";