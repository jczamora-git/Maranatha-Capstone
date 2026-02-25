import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { API_ENDPOINTS, apiPost } from "@/lib/api";
import chatbotIcon from "@/assets/chatbot.svg";

const renderWithLinks = (
  content: string,
  navigate: (path: string) => void,
): Array<JSX.Element> => {
  const parts: Array<{ type: "text" | "link"; value: string; href?: string }> = [];
  const pattern = /\[link:([^\]|]+)\|([^\]]+)\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: content.slice(lastIndex, match.index) });
    }
    parts.push({ type: "link", value: match[1], href: match[2] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: "text", value: content.slice(lastIndex) });
  }

  return parts.map((part, index) => {
    if (part.type === "link" && part.href) {
      return (
        <button
          key={`link-${index}`}
          type="button"
          onClick={() => navigate(part.href!)}
          className="text-primary underline underline-offset-2"
        >
          {part.value}
        </button>
      );
    }

    return (
      <span key={`text-${index}`}>
        {part.value}
      </span>
    );
  });
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatCacheEntry = {
  id: string;
  userId: string | number | null;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

const CHATBOT_DB_NAME = "chatbot-cache";
const CHATBOT_STORE = "messages";

const openChatbotDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(CHATBOT_DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(CHATBOT_STORE)) {
        const store = db.createObjectStore(CHATBOT_STORE, { keyPath: "id" });
        store.createIndex("userId", "userId", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const saveChatEntries = async (entries: ChatCacheEntry[]) => {
  if (entries.length === 0) return;
  const db = await openChatbotDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(CHATBOT_STORE, "readwrite");
    const store = tx.objectStore(CHATBOT_STORE);
    entries.forEach((entry) => store.put(entry));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
};

const loadChatEntries = async (userId: string | number | null, limit = 50) => {
  const db = await openChatbotDb();
  const entries = await new Promise<ChatCacheEntry[]>((resolve, reject) => {
    const tx = db.transaction(CHATBOT_STORE, "readonly");
    const store = tx.objectStore(CHATBOT_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as ChatCacheEntry[]);
    request.onerror = () => reject(request.error);
  });
  db.close();

  const filtered = entries.filter((entry) => entry.userId === userId);
  filtered.sort((a, b) => a.createdAt - b.createdAt);
  return filtered.slice(-limit);
};

const normalizeText = (value: string) => value.toLowerCase().replace(/\s+/g, " ").trim();

const extractKeywords = (value: string) =>
  normalizeText(value)
    .split(" ")
    .filter((word) => word.length >= 4);

const findCachedReply = async (message: string, userId: string | number | null) => {
  const entries = await loadChatEntries(userId, 200);
  const keywords = extractKeywords(message);
  if (keywords.length === 0) return null;

  for (let i = entries.length - 1; i >= 0; i -= 1) {
    const entry = entries[i];
    if (entry.role !== "assistant") continue;
    const content = normalizeText(entry.content);
    if (keywords.some((keyword) => content.includes(keyword))) {
      return entry.content;
    }
  }

  return null;
};

const ChatbotWidget = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedCache, setHasLoadedCache] = useState(false);

  const canSend = input.trim().length > 0 && !isSending;

  const headerLabel = useMemo(() => {
    return user ? `Hi, ${user.first_name ?? user.name ?? "there"}` : "Campus Companion";
  }, [user]);

  useEffect(() => {
    if (!user || hasLoadedCache) return;

    loadChatEntries(user.user_id ?? user.id ?? null)
      .then((entries) => {
        const restored = entries.map((entry) => ({
          role: entry.role,
          content: entry.content,
        }));
        if (restored.length > 0) {
          setMessages(restored);
        }
      })
      .catch(() => {
        // Ignore cache errors to avoid blocking the chat UI.
      })
      .finally(() => {
        setHasLoadedCache(true);
      });
  }, [user, hasLoadedCache]);

  const handleSend = async () => {
    const message = input.trim();
    if (!message || isSending) return;

    setError(null);
    setIsSending(true);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: message }]);

    try {
      if (!navigator.onLine) {
        const cachedReply = await findCachedReply(message, user?.user_id ?? user?.id ?? null);
        if (cachedReply) {
          setMessages((prev) => [...prev, { role: "assistant", content: cachedReply }]);
          await saveChatEntries([
            {
              id: crypto.randomUUID(),
              userId: user?.user_id ?? user?.id ?? null,
              role: "user",
              content: message,
              createdAt: Date.now(),
            },
            {
              id: crypto.randomUUID(),
              userId: user?.user_id ?? user?.id ?? null,
              role: "assistant",
              content: cachedReply,
              createdAt: Date.now(),
            },
          ]);
          return;
        }

        throw new Error("Offline: no cached reply found yet.");
      }

      const response = await apiPost(API_ENDPOINTS.CHATBOT_MESSAGE, { message });
      if (!response?.reply) {
        throw new Error("Unexpected chatbot response.");
      }
      setMessages((prev) => [...prev, { role: "assistant", content: response.reply }]);
      await saveChatEntries([
        {
          id: crypto.randomUUID(),
          userId: user?.user_id ?? user?.id ?? null,
          role: "user",
          content: message,
          createdAt: Date.now(),
        },
        {
          id: crypto.randomUUID(),
          userId: user?.user_id ?? user?.id ?? null,
          role: "assistant",
          content: response.reply,
          createdAt: Date.now(),
        },
      ]);
    } catch (err) {
      const messageText = err instanceof Error ? err.message : "Chatbot error.";
      setError(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {isOpen ? (
        <div className="w-[320px] rounded-2xl border border-border bg-background shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <img src={chatbotIcon} alt="" className="h-5 w-5 dark:invert" />
              <div>
                <p className="text-sm font-semibold">Campus Companion</p>
                <p className="text-xs text-muted-foreground">{headerLabel}</p>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>

          <div className="max-h-[280px] overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ask me anything about the system.</p>
            ) : (
              messages.map((msg, index) => (
                <div key={`${msg.role}-${index}`} className={msg.role === "user" ? "text-right" : "text-left"}>
                  <p className="text-xs text-muted-foreground">{msg.role === "user" ? "You" : "Chatbot"}</p>
                  <div
                    className={
                      msg.role === "user"
                        ? "inline-block bg-primary text-primary-foreground rounded-lg px-3 py-2 text-sm"
                        : "inline-block bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm"
                    }
                  >
                    {msg.role === "assistant" ? renderWithLinks(msg.content, navigate) : msg.content}
                  </div>
                </div>
              ))
            )}
          </div>

          {error && (
            <div className="px-4 pb-2 text-xs text-rose-600">{error}</div>
          )}

          <div className="border-t border-border px-4 py-3 space-y-2">
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={2}
              className="resize-none"
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={handleSend} disabled={!canSend}>
                {isSending ? "Sending" : "Send"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button
          size="icon"
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="h-12 w-12 rounded-full shadow-lg"
        >
          <img src={chatbotIcon} alt="" className="h-6 w-6 dark:invert" />
        </Button>
      )}
    </div>
  );
};

export default ChatbotWidget;
