import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: any[];
  matchedKeywords?: string[];
  router?: string;
}

export interface Session {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEYS = {
  SESSIONS: "visionary_sessions",
  CURRENT_SESSION: "visionary_current_session",
};

export const useSessionManager = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Record<string, Session>>({});
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Load sessions from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    const savedCurrentId = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);

    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        // Convert date strings back to Date objects
        Object.keys(parsed).forEach((id) => {
          parsed[id].createdAt = new Date(parsed[id].createdAt);
          parsed[id].updatedAt = new Date(parsed[id].updatedAt);
          parsed[id].messages = parsed[id].messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }));
        });
        setSessions(parsed);
      } catch (e) {
        console.error("Failed to load sessions:", e);
      }
    }

    if (savedCurrentId) {
      setCurrentSessionId(savedCurrentId);
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    if (Object.keys(sessions).length > 0) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    }
  }, [sessions]);

  // Save current session ID
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, currentSessionId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    }
  }, [currentSessionId]);

  const createSession = (id: string, initialMessage?: string) => {
    const newSession: Session = {
      id,
      title: initialMessage || "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setSessions((prev) => ({ ...prev, [id]: newSession }));
    setCurrentSessionId(id);
    navigate(`/chat/${id}`);
    return newSession;
  };

  const updateSession = (id: string, updates: Partial<Session>) => {
    setSessions((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...updates,
        updatedAt: new Date(),
      },
    }));
  };

  const addMessage = (id: string, message: ChatMessage) => {
    setSessions((prev) => {
      const session = prev[id];
      if (!session) return prev;

      const updatedMessages = [...session.messages, message];
      const title = session.messages.length === 0 && message.role === "user"
        ? message.content.slice(0, 50)
        : session.title;

      return {
        ...prev,
        [id]: {
          ...session,
          messages: updatedMessages,
          title,
          updatedAt: new Date(),
        },
      };
    });
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => {
      const newSessions = { ...prev };
      delete newSessions[id];
      return newSessions;
    });

    if (currentSessionId === id) {
      setCurrentSessionId(null);
      navigate("/");
    }
  };

  const renameSession = (id: string, newTitle: string) => {
    updateSession(id, { title: newTitle });
  };

  const duplicateSession = (id: string) => {
    const session = sessions[id];
    if (!session) return;

    const newId = crypto.randomUUID();
    const duplicated: Session = {
      ...session,
      id: newId,
      title: `${session.title} (copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setSessions((prev) => ({ ...prev, [newId]: duplicated }));
    setCurrentSessionId(newId);
    navigate(`/chat/${newId}`);
  };

  const goHome = () => {
    setCurrentSessionId(null);
    navigate("/");
  };

  const newChat = () => {
    const id = crypto.randomUUID();
    createSession(id);
  };

  const getCurrentSession = () => {
    return currentSessionId ? sessions[currentSessionId] : null;
  };

  const getSortedSessions = () => {
    return Object.values(sessions)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 30);
  };

  return {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    createSession,
    updateSession,
    addMessage,
    deleteSession,
    renameSession,
    duplicateSession,
    goHome,
    newChat,
    getCurrentSession,
    getSortedSessions,
  };
};
