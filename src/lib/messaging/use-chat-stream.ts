"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: { username: string };
}

interface SSEEvent {
  type: "connected" | "messages" | "reconnect";
  messages?: ChatMessage[];
}

export function useChatStream(conversationId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const sourceRef = useRef<EventSource | null>(null);
  const fallbackRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectRef = useRef<() => void>(() => {});

  const startPolling = useCallback(() => {
    if (fallbackRef.current) return;

    fallbackRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/conversations/${conversationId}`);
        if (res.ok) {
          const data = (await res.json()) as { messages: ChatMessage[] };
          setMessages(data.messages);
        }
      } catch {
        // ignore
      }
    }, 5000);
  }, [conversationId]);

  const connectSSE = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.close();
    }

    // Stop polling if running
    if (fallbackRef.current) {
      clearInterval(fallbackRef.current);
      fallbackRef.current = null;
    }

    const es = new EventSource(`/api/conversations/${conversationId}/stream`);
    sourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as SSEEvent;

        if (data.type === "connected") {
          setIsConnected(true);
        }

        if (data.type === "messages" && data.messages) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMsgs = data.messages!.filter((m) => !existingIds.has(m.id));
            return newMsgs.length > 0 ? [...prev, ...newMsgs] : prev;
          });
        }

        if (data.type === "reconnect") {
          es.close();
          setTimeout(() => connectRef.current(), 500);
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      setIsConnected(false);
      es.close();
      sourceRef.current = null;
      startPolling();
    };
  }, [conversationId, startPolling]);

  // Load initial messages
  useEffect(() => {
    connectRef.current = connectSSE;
    async function loadInitial() {
      try {
        const res = await fetch(`/api/conversations/${conversationId}`);
        if (res.ok) {
          const data = (await res.json()) as { messages: ChatMessage[] };
          setMessages(data.messages);
        }
      } catch {
        // will be loaded by stream
      }
    }

    void loadInitial();
    connectSSE();

    return () => {
      sourceRef.current?.close();
      sourceRef.current = null;
      if (fallbackRef.current) {
        clearInterval(fallbackRef.current);
        fallbackRef.current = null;
      }
    };
  }, [conversationId, connectSSE]);

  const addOptimistic = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  return { messages, isConnected, addOptimistic };
}
