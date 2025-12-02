const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface AskResponse {
  answer: string;
  sources?: Array<{
    id: string;
    title: string;
    snippet: string;
    file_path?: string;
  }>;
  matched_keywords?: string[];
  router?: string;
}

export interface HealthResponse {
  status: string;
  message: string;
}

export interface RuleSummary {
  total_rules: number;
  groups: Array<{
    name: string;
    keyword_count: number;
  }>;
}

export const api = {
  async ask(query: string, conversationHistory?: Array<{ role: string; content: string }>): Promise<AskResponse> {
    const response = await fetch(`${API_BASE_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        conversation_history: conversationHistory,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  },

  async ingestFile(file: File): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/ingest`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to ingest file: ${response.statusText}`);
    }

    return response.json();
  },

  async refreshData(): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/ingest/refresh`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh data: ${response.statusText}`);
    }

    return response.json();
  },

  async getDocumentPreview(docId: string): Promise<{ content: string; metadata?: any }> {
    const response = await fetch(`${API_BASE_URL}/doc/${docId}/preview`);

    if (!response.ok) {
      throw new Error(`Failed to get document preview: ${response.statusText}`);
    }

    return response.json();
  },

  async getRulesSummary(): Promise<RuleSummary> {
    const response = await fetch(`${API_BASE_URL}/rules/summary`);

    if (!response.ok) {
      throw new Error(`Failed to get rules summary: ${response.statusText}`);
    }

    return response.json();
  },

  async getHealth(): Promise<HealthResponse> {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
      throw new Error(`Failed to get health status: ${response.statusText}`);
    }

    return response.json();
  },
};
