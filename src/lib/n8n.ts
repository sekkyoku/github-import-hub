// N8N API integration
// Replace with your actual n8n webhook URL
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || "";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export async function sendQueryToN8N(query: string, conversationHistory?: ChatMessage[], signal?: AbortSignal): Promise<string> {
  if (!N8N_WEBHOOK_URL) {
    throw new Error("N8N_WEBHOOK_URL environment variable is not set");
  }

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain;q=0.9, */*;q=0.8",
      },
      body: JSON.stringify({
        query,
        uploadOrQuery: false,
        history: conversationHistory?.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`N8N API error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type") || "";
    let result: any;

    if (contentType.includes("application/json")) {
      result = await response.json().catch(() => null);
    } else {
      const text = await response.text();
      // Try to parse JSON if the text looks like JSON, else use as plain text
      try {
        result = JSON.parse(text);
      } catch {
        // Use plain text if not JSON
        return text?.trim() || "No response received";
      }
    }

    // Normalize common shapes - prioritize answer field from n8n
    if (result && typeof result === "object") {
      const content = 
        result.answer ||
        result.response ||
        result.message ||
        result.result ||
        result.output ||
        result.data ||
        JSON.stringify(result);
      
      // Clean up escaped characters and formatting
      if (typeof content === "string") {
        // Remove escaped quotes and clean up the formatting
        return content
          .replace(/^"|"$/g, '') // Remove leading/trailing quotes
          .replace(/\\"/g, '"')   // Unescape quotes
          .replace(/\\n/g, '\n')  // Convert \n to actual newlines
          .trim();
      }
      
      return String(content);
    }

    return String(result ?? "No response received");
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request cancelled');
    }
    console.error("Error calling n8n workflow:", error);
    throw error;
  }
}
