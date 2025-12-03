// N8N API integration
// Production webhook URL for Canela AI
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || "https://bacostam.app.n8n.cloud/webhook/canela-ai";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export async function sendQueryToN8N(query: string, conversationHistory?: ChatMessage[], signal?: AbortSignal): Promise<string> {
  if (!N8N_WEBHOOK_URL) {
    throw new Error("N8N_WEBHOOK_URL is not configured");
  }

  try {
    // Use FormData for form-data POST request (query branch - false)
    const formData = new FormData();
    formData.append("query", query);
    
    // Optionally include history as JSON string if needed
    if (conversationHistory && conversationHistory.length > 0) {
      formData.append("history", JSON.stringify(conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))));
    }

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      body: formData,
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

// File upload function using form-data (upload branch - true)
export async function uploadFileToN8N(file: File, fileName: string): Promise<any> {
  const formData = new FormData();
  formData.append("file", file, file.name);
  formData.append("fileName", fileName);

  const response = await fetch(N8N_WEBHOOK_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }

  return response.json().catch(() => ({ ok: true }));
}
