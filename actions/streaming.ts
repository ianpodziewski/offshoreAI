import OpenAI from "openai";
import {
  CoreMessage,
  StreamedLoading,
  StreamedMessage,
  IndicatorIconType,
  StreamedDone,
  AIProviders,
  ProviderName,
  Citation,
  StreamedError,
} from "@/types";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Extracts citation references from the text and creates citation objects
 * @param text The text to process for citations
 * @param existingCitations Any existing citations to include
 * @returns An array of citation objects
 */
export function extractCitationsFromText(
  text: string,
  existingCitations: Citation[] = []
): Citation[] {
  // Find all citation markers like [1], [2], etc.
  const citationRegex = /\[(\d+)\]/g;
  const matches = Array.from(text.matchAll(citationRegex));
  
  // Create a map of existing citations by their index
  const citationsMap = new Map<number, Citation>();
  
  // Add existing citations to the map
  existingCitations.forEach((citation, index) => {
    citationsMap.set(index + 1, citation);
  });
  
  // Process all citation matches
  matches.forEach(match => {
    const citationNumber = parseInt(match[1], 10);
    
    // If this citation number doesn't exist yet, create a placeholder
    if (!citationsMap.has(citationNumber)) {
      citationsMap.set(citationNumber, {
        source_url: "",
        source_description: `Reference ${citationNumber}`
      });
    }
  });
  
  // Convert the map back to an array
  return Array.from({ length: citationsMap.size }, (_, i) => 
    citationsMap.get(i + 1) || {
      source_url: "",
      source_description: `Reference ${i + 1}`
    }
  );
}

/**
 * Temporarily modifies the response to include test citations
 * This helps verify if the citation display works correctly
 */
export function addTestCitations(text: string): {
  modifiedText: string;
  testCitations: Citation[];
} {
  // Create test citations
  const testCitations: Citation[] = [
    {
      source_url: "https://example.com/doc1",
      source_description: "Test Document 1"
    },
    {
      source_url: "https://example.com/doc2",
      source_description: "Test Document 2"
    }
  ];
  
  // Check if text already has citations
  if (text.match(/\[(\d+)\]/)) {
    // Text already has citations, just return with test citations data
    return {
      modifiedText: text,
      testCitations
    };
  }
  
  // Add citation markers to the text
  // First, split by paragraphs
  const paragraphs = text.split("\n\n");
  
  // Add to first paragraph if it exists
  if (paragraphs.length > 0) {
    // Find a good spot to add citation in first paragraph
    const firstPara = paragraphs[0];
    const sentences = firstPara.split(". ");
    
    if (sentences.length > 1) {
      // Add to the end of the first sentence
      sentences[0] = sentences[0] + " [1]";
      paragraphs[0] = sentences.join(". ");
    } else {
      // Just add to the end of paragraph
      paragraphs[0] = paragraphs[0] + " [1]";
    }
    
    // Add second citation to another paragraph if available
    if (paragraphs.length > 2) {
      const midIndex = Math.floor(paragraphs.length / 2);
      
      // Add citation to middle paragraph
      const midPara = paragraphs[midIndex];
      const midSentences = midPara.split(". ");
      
      if (midSentences.length > 1) {
        // Add to end of first sentence of middle paragraph
        midSentences[0] = midSentences[0] + " [2]";
        paragraphs[midIndex] = midSentences.join(". ");
      } else {
        // Add to end of paragraph
        paragraphs[midIndex] = paragraphs[midIndex] + " [2]";
      }
    }
  }
  
  return {
    modifiedText: paragraphs.join("\n\n"),
    testCitations
  };
}

export interface QueueAssistantResponseParams {
  controller: ReadableStreamDefaultController;
  providers: AIProviders;
  providerName: ProviderName;
  messages: CoreMessage[];
  model_name: string;
  systemPrompt: string;
  citations: Citation[];
  error_message: string;
  temperature: number;
}

export async function handleOpenAIStream({
  controller,
  providers,
  providerName,
  messages,
  model_name,
  systemPrompt,
  citations: initialCitations,
  temperature,
}: QueueAssistantResponseParams) {
  let client: OpenAI = providers.openai;
  if (providerName === "fireworks") {
    client = providers.fireworks;
    console.log("Streaming Fireworks response...", {
      temperature,
      model_name,
      systemPrompt,
      messages,
    });
  } else {
    console.log("Streaming OpenAI response...", {
      temperature,
      model_name,
      systemPrompt,
      messages,
    });
  }
  
  const startTime = Date.now();
  const streamedResponse = await client.chat.completions.create({
    model: model_name,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    stream: true,
    temperature,
  });
  
  if (!streamedResponse) {
    throw new Error("No stream response");
  }
  
  let responseBuffer: string = "";
  let currentCitations = [...initialCitations]; // Start with any initial citations
  let hasInjectedTestCitations = false;

  for await (const chunk of streamedResponse) {
    const deltaContent = chunk.choices[0]?.delta.content ?? "";
    responseBuffer += deltaContent;
    
    // TEST INJECTION: Add test citations once the response has enough content
    if (!hasInjectedTestCitations && responseBuffer.length > 150) {
      const { modifiedText, testCitations } = addTestCitations(responseBuffer);
      responseBuffer = modifiedText;
      currentCitations = [...currentCitations, ...testCitations];
      hasInjectedTestCitations = true;
      console.log("TEST: Injected test citations");
    }
    
    // Look for citation patterns in the newly added content
    if (deltaContent.includes('[') && deltaContent.includes(']')) {
      // Extract citations from the current buffer
      currentCitations = extractCitationsFromText(responseBuffer, initialCitations);
    }
    
    const streamedMessage: StreamedMessage = {
      type: "message",
      message: {
        role: "assistant",
        content: responseBuffer,
        citations: currentCitations,
      },
    };
    
    controller.enqueue(
      new TextEncoder().encode(JSON.stringify(streamedMessage) + "\n")
    );
  }
  
  // One final extraction at the end to catch any citations
  currentCitations = extractCitationsFromText(responseBuffer, initialCitations);
  
  const endTime = Date.now();
  const streamDuration = endTime - startTime;
  console.log(`Done streaming OpenAI response in ${streamDuration / 1000}s`);
  console.log(`Final response has ${currentCitations.length} citations`);
  
  const donePayload: StreamedDone = {
    type: "done",
    final_message: responseBuffer,
  };
  
  controller.enqueue(
    new TextEncoder().encode(JSON.stringify(donePayload) + "\n")
  );
  
  controller.close();
}

export async function handleAnthropicStream({
  controller,
  providers,
  messages,
  model_name,
  systemPrompt,
  citations: initialCitations,
  temperature,
}: QueueAssistantResponseParams) {
  let anthropicClient: Anthropic = providers.anthropic;
  let anthropicMessages: Anthropic.Messages.MessageParam[] = messages.map(
    (msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    })
  );
  
  let responseBuffer: string = "";
  let currentCitations = [...initialCitations]; // Start with any initial citations
  let hasInjectedTestCitations = false;
  
  console.log("Streaming Anthropic response...", {
    temperature,
    model_name,
    systemPrompt,
    messages,
  });
  
  await anthropicClient.messages
    .stream({
      messages: anthropicMessages,
      model: model_name,
      system: systemPrompt,
      max_tokens: 4096,
      temperature,
    })
    .on("text", (textDelta) => {
      responseBuffer += textDelta;
      
      // TEST INJECTION: Add test citations once the response has enough content
      if (!hasInjectedTestCitations && responseBuffer.length > 150) {
        const { modifiedText, testCitations } = addTestCitations(responseBuffer);
        responseBuffer = modifiedText;
        currentCitations = [...currentCitations, ...testCitations];
        hasInjectedTestCitations = true;
        console.log("TEST: Injected test citations into Anthropic response");
      }
      
      // Look for citation patterns in the newly added content
      if (textDelta.includes('[') && textDelta.includes(']')) {
        // Extract citations from the current buffer
        currentCitations = extractCitationsFromText(responseBuffer, initialCitations);
      }
      
      const streamedMessage: StreamedMessage = {
        type: "message",
        message: {
          role: "assistant",
          content: responseBuffer,
          citations: currentCitations,
        },
      };
      
      controller.enqueue(
        new TextEncoder().encode(JSON.stringify(streamedMessage) + "\n")
      );
    })
    .on("end", () => {
      // One final extraction at the end to catch any citations
      currentCitations = extractCitationsFromText(responseBuffer, initialCitations);
      console.log(`Final Anthropic response has ${currentCitations.length} citations`);
      
      const donePayload: StreamedDone = {
        type: "done",
        final_message: responseBuffer,
      };
      
      controller.enqueue(
        new TextEncoder().encode(JSON.stringify(donePayload) + "\n")
      );
      
      controller.close();
    });
}

export async function queueAssistantResponse({
  controller,
  providers,
  providerName,
  messages,
  model_name,
  systemPrompt,
  citations,
  error_message,
  temperature,
}: QueueAssistantResponseParams) {
  if (providerName === "openai" || providerName === "fireworks") {
    console.log(providerName);
    await handleOpenAIStream({
      controller,
      providers,
      providerName,
      messages,
      model_name,
      systemPrompt,
      citations,
      error_message,
      temperature,
    });
  } else if (providerName === "anthropic") {
    await handleAnthropicStream({
      controller,
      providers,
      providerName,
      messages,
      model_name,
      systemPrompt,
      citations,
      error_message,
      temperature,
    });
  }
}

export interface QueueLoadingParams {
  controller: ReadableStreamDefaultController;
  status: string;
  icon: IndicatorIconType;
}

export async function queueIndicator({
  controller,
  status,
  icon,
}: QueueLoadingParams) {
  const loadingPayload: StreamedLoading = {
    type: "loading",
    indicator: {
      status: status,
      icon: icon,
    },
  };
  controller.enqueue(
    new TextEncoder().encode(JSON.stringify(loadingPayload) + "\n")
  );
}

export interface QueueErrorParams {
  controller: ReadableStreamDefaultController;
  error_message: string;
}

export async function queueError({
  controller,
  error_message,
}: QueueErrorParams) {
  const errorPayload: StreamedError = {
    type: "error",
    indicator: {
      status: error_message,
      icon: "error",
    },
  };
  controller.enqueue(
    new TextEncoder().encode(JSON.stringify(errorPayload) + "\n")
  );
  controller.close();
}