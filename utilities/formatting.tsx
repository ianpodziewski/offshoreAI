import { CitationCircle } from "@/components/chat/citation";
import { Citation } from "@/types";
import React from "react";

// Regex to check if the processed content contains any potential LaTeX patterns
const containsLatexRegex =
  /\\\(.*?\\\)|\\\[.*?\\\]|\$.*?\$|\\begin\{equation\}.*?\\end\{equation\}/;

// Regex for inline and block LaTeX expressions
const inlineLatex = new RegExp(/\\\((.+?)\\\)/, "g");
const blockLatex = new RegExp(/\\\[(.*?[^\\])\\\]/, "gs");

// Function to restore code blocks
const restoreCodeBlocks = (content: string, codeBlocks: string[]) => {
  return content.replace(
    /<<CODE_BLOCK_(\d+)>>/g,
    (match, index) => codeBlocks[index]
  );
};

// Regex to identify code blocks and inline code
const codeBlockRegex = /(```[\s\S]*?```|`.*?`)/g;

export const processLaTeX = (_content: string) => {
  let content = _content;
  // Temporarily replace code blocks and inline code with placeholders
  const codeBlocks: string[] = [];
  let index = 0;
  content = content.replace(codeBlockRegex, (match) => {
    codeBlocks[index] = match;
    return `<<CODE_BLOCK_${index++}>>`;
  });

  // Escape dollar signs followed by a digit or space and digit
  let processedContent = content.replace(/(\$)(?=\s?\d)/g, "\\$");

  // If no LaTeX patterns are found, restore code blocks and return the processed content
  if (!containsLatexRegex.test(processedContent)) {
    return restoreCodeBlocks(processedContent, codeBlocks);
  }

  // Convert LaTeX expressions to a markdown compatible format
  processedContent = processedContent
    .replace(inlineLatex, (match: string, equation: string) => `$${equation}$`) // Convert inline LaTeX
    .replace(
      blockLatex,
      (match: string, equation: string) => `$$${equation}$$`
    ); // Convert block LaTeX

  // Restore code blocks
  return restoreCodeBlocks(processedContent, codeBlocks);
};

/**
 * Preprocesses LaTeX content by replacing delimiters and escaping certain characters.
 *
 * @param content The input string containing LaTeX expressions.
 * @returns The processed string with replaced delimiters and escaped characters.
 */
export function preprocessLaTeX(content: string): string {
  // Step 1: Protect code blocks
  const codeBlocks: string[] = [];
  content = content.replace(/(```[\s\S]*?```|`[^`\n]+`)/g, (match, code) => {
    codeBlocks.push(code);
    return `<<CODE_BLOCK_${codeBlocks.length - 1}>>`;
  });

  // Step 2: Protect existing LaTeX expressions
  const latexExpressions: string[] = [];
  content = content.replace(
    /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\(.*?\\\))/g,
    (match) => {
      latexExpressions.push(match);
      return `<<LATEX_${latexExpressions.length - 1}>>`;
    }
  );

  // Step 3: Escape dollar signs that are likely currency indicators
  content = content.replace(/\$(?=\d)/g, "\\$");

  // Step 4: Restore LaTeX expressions
  content = content.replace(
    /<<LATEX_(\d+)>>/g,
    (_, index) => latexExpressions[parseInt(index)]
  );

  // Step 5: Restore code blocks
  content = content.replace(
    /<<CODE_BLOCK_(\d+)>>/g,
    (_, index) => codeBlocks[parseInt(index)]
  );

  // Step 6: Apply additional escaping functions
  content = escapeBrackets(content);
  content = escapeMhchem(content);

  return content;
}

export function escapeBrackets(text: string): string {
  const pattern =
    /(```[\S\s]*?```|`.*?`)|\\\[([\S\s]*?[^\\])\\]|\\\((.*?)\\\)/g;
  return text.replace(
    pattern,
    (
      match: string,
      codeBlock: string | undefined,
      squareBracket: string | undefined,
      roundBracket: string | undefined
    ): string => {
      if (codeBlock != null) {
        return codeBlock;
      } else if (squareBracket != null) {
        return `$$${squareBracket}$$`;
      } else if (roundBracket != null) {
        return `$${roundBracket}$`;
      }
      return match;
    }
  );
}

export function escapeMhchem(text: string) {
  return text.replaceAll("$\\ce{", "$\\\\ce{").replaceAll("$\\pu{", "$\\\\pu{");
}

export function renderCitations(
  children: React.ReactNode | string,
  citations: Citation[]
): React.ReactNode {
  // Check if there are any citations to process
  if (!citations || citations.length === 0) {
    return <span className="text-base">{children}</span>;
  }

  // Improved regex to better match citation patterns [1], [2], etc.
  const matchRegex = /\[(\d+)\]/g;

  // Helper function to process string content
  const processString = (text: string) => {
    if (!text) return null;
    
    // Find all citation matches in the text
    const matches = Array.from(text.matchAll(matchRegex));
    if (matches.length === 0) return text;
    
    // Split the text by the citation markers
    const parts = [];
    let lastIndex = 0;
    
    matches.forEach((match) => {
      const [fullMatch, numberStr] = match;
      const matchIndex = match.index as number;
      
      // Add text before the citation
      if (matchIndex > lastIndex) {
        parts.push(text.substring(lastIndex, matchIndex));
      }
      
      // Process the citation
      const number = parseInt(numberStr, 10);
      if (number > 0 && number <= citations.length) {
        parts.push(
          <CitationCircle
            key={`citation-${matchIndex}`}
            number={number}
            citation={citations[number - 1]}
          />
        );
      } else {
        // If citation number is invalid, just keep the original text
        parts.push(fullMatch);
      }
      
      lastIndex = matchIndex + fullMatch.length;
    });
    
    // Add any remaining text after the last citation
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts;
  };

  // Recursively process children
  const processChildren = (node: React.ReactNode): React.ReactNode => {
    if (typeof node === "string") {
      return processString(node);
    }

    if (Array.isArray(node)) {
      return node.map((child, index) => (
        <React.Fragment key={index}>{processChildren(child)}</React.Fragment>
      ));
    }

    if (React.isValidElement(node)) {
      const childrenContent = processChildren(node.props.children);
      return React.cloneElement(node, {
        ...node.props,
        children: childrenContent,
      });
    }

    return node;
  };

  // Wrap in a span instead of p to avoid nesting paragraph issues
  return <span className="text-base">{processChildren(children)}</span>;
}