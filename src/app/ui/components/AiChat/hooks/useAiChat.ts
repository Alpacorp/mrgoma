'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isFilterApplication?: boolean;
}

interface ApiMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AiChatResponse {
  type: 'filters' | 'message';
  filters?: Record<string, unknown>;
  message: string;
}

export function useAiChat() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const apiHistoryRef = useRef<ApiMessage[]>([]);

  const applyFiltersToUrl = (filters: Record<string, unknown>) => {
    const params = new URLSearchParams();

    if (filters.w !== undefined) params.set('w', String(filters.w));
    if (filters.s !== undefined) params.set('s', String(filters.s));
    if (filters.d !== undefined) params.set('d', String(filters.d));
    if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
    if (filters.minTreadDepth !== undefined) params.set('minTreadDepth', String(filters.minTreadDepth));
    if (filters.maxTreadDepth !== undefined) params.set('maxTreadDepth', String(filters.maxTreadDepth));
    if (filters.minRemainingLife !== undefined) params.set('minRemainingLife', String(filters.minRemainingLife));
    if (filters.maxRemainingLife !== undefined) params.set('maxRemainingLife', String(filters.maxRemainingLife));
    if (filters.condition !== undefined) params.set('condition', String(filters.condition));
    if (filters.patched !== undefined) params.set('patched', String(filters.patched));
    if (filters.brands !== undefined) params.set('brands', String(filters.brands));

    params.set('page', '1');

    router.push(`/dashboard?${params.toString()}`);
  };

  const sendMessage = async (text: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const newApiMessage: ApiMessage = { role: 'user', content: text };
    apiHistoryRef.current = [...apiHistoryRef.current, newApiMessage];

    try {
      const response = await fetch('/api/dashboard/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiHistoryRef.current }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }

      const data: AiChatResponse = await response.json();

      const assistantApiMessage: ApiMessage = {
        role: 'assistant',
        content: data.message,
      };
      apiHistoryRef.current = [...apiHistoryRef.current, assistantApiMessage];

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        isFilterApplication: data.type === 'filters',
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.type === 'filters' && data.filters) {
        applyFiltersToUrl(data.filters);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.';

      const errorChatMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${errorMessage}`,
      };

      setMessages((prev) => [...prev, errorChatMessage]);
      // Remove the last user message from history on error
      apiHistoryRef.current = apiHistoryRef.current.slice(0, -1);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    apiHistoryRef.current = [];
  };

  return { messages, isLoading, sendMessage, clearChat };
}
