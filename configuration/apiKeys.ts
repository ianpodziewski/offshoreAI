/**
 * API Key validation and management
 */

/**
 * Check if the OpenAI API key is configured
 */
export const validateOpenAIKey = (): { valid: boolean; message: string } => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return {
      valid: false,
      message: "OPENAI_API_KEY is not set in environment variables"
    };
  }
  
  if (!apiKey.startsWith('sk-')) {
    return {
      valid: false,
      message: "OPENAI_API_KEY does not appear to be valid (should start with 'sk-')"
    };
  }
  
  return {
    valid: true,
    message: "OpenAI API key is configured"
  };
};

/**
 * Check if the Pinecone API key is configured
 */
export const validatePineconeKey = (): { valid: boolean; message: string } => {
  const apiKey = process.env.PINECONE_API_KEY;
  
  if (!apiKey) {
    return {
      valid: false,
      message: "PINECONE_API_KEY is not set in environment variables"
    };
  }
  
  return {
    valid: true,
    message: "Pinecone API key is configured"
  };
};

/**
 * Validate both API keys and return a combined status
 */
export const validateAllApiKeys = (): { 
  allValid: boolean; 
  openai: { valid: boolean; message: string };
  pinecone: { valid: boolean; message: string };
} => {
  const openaiStatus = validateOpenAIKey();
  const pineconeStatus = validatePineconeKey();
  
  return {
    allValid: openaiStatus.valid && pineconeStatus.valid,
    openai: openaiStatus,
    pinecone: pineconeStatus
  };
};

/**
 * Get a redacted version of an API key for logging purposes
 */
export const getRedactedKey = (key: string | undefined): string => {
  if (!key) return "[not set]";
  
  if (key.length <= 8) {
    return "*".repeat(key.length);
  }
  
  // Show first 4 and last 4 characters, hide the rest
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
}; 