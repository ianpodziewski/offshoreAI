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

  for await (const chunk of streamedResponse) {
    const deltaContent = chunk.choices[0]?.delta.content ?? "";
    responseBuffer += deltaContent;
    
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