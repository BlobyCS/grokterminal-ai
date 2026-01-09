import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  type: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
}

const Terminal = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "system",
      content: `╔══════════════════════════════════════════════════════════╗
║             BLOBY TERMINAL v1.0 - GROQ Interface          ║
╠══════════════════════════════════════════════════════════╣
║  Powered by Llama 3.3 70B                                 ║
║  Type your question and press Enter                       ║
║  Type 'clear' to clear the terminal                       ║
║  Type 'help' for available commands                       ║
╚══════════════════════════════════════════════════════════╝`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalRef.current?.scrollTo({
      top: terminalRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addMessage = (type: Message["type"], content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: generateId(), type, content, timestamp: new Date() },
    ]);
  };

  const handleClear = () => {
    setMessages([
      {
        id: generateId(),
        type: "system",
        content: "Terminal cleared.",
        timestamp: new Date(),
      },
    ]);
  };

  const handleHelp = () => {
    addMessage(
      "system",
      `Available commands:
  clear    - Clear the terminal
  help     - Show this help message
  history  - Show command history
  
Keyboard shortcuts:
  ↑/↓      - Navigate command history
  Ctrl+L   - Clear terminal
  Ctrl+C   - Cancel current input`
    );
  };

  const handleSubmit = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // Add to command history
    setCommandHistory((prev) => [...prev, trimmedInput]);
    setHistoryIndex(-1);

    // Add user message
    addMessage("user", trimmedInput);
    setInput("");

    // Handle built-in commands
    if (trimmedInput.toLowerCase() === "clear") {
      handleClear();
      return;
    }

    if (trimmedInput.toLowerCase() === "help") {
      handleHelp();
      return;
    }

    if (trimmedInput.toLowerCase() === "history") {
      addMessage(
        "system",
        commandHistory.length > 0
          ? `Command history:\n${commandHistory.map((cmd, i) => `  ${i + 1}. ${cmd}`).join("\n")}`
          : "No command history yet."
      );
      return;
    }

    // Send to AI
    setIsLoading(true);
    try {
      // Build conversation history for context
      const conversationHistory = messages
        .filter((m) => m.type === "user" || m.type === "ai")
        .slice(-10) // Keep last 10 messages for context
        .map((m) => ({
          role: m.type === "user" ? "user" : "assistant",
          content: m.content,
        }));

      const { data, error } = await supabase.functions.invoke("chat", {
        body: { message: trimmedInput, history: conversationHistory },
      });

      if (error) {
        console.error("Edge function error:", error);
        addMessage("system", `Error: ${error.message || "Failed to get response"}`);
      } else if (data?.error) {
        addMessage("system", `Error: ${data.error}`);
      } else {
        addMessage("ai", data.response);
      }
    } catch (err) {
      console.error("Request error:", err);
      addMessage("system", "Error: Connection failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || "");
      } else {
        setHistoryIndex(-1);
        setInput("");
      }
    } else if (e.ctrlKey && e.key === "l") {
      e.preventDefault();
      handleClear();
    } else if (e.ctrlKey && e.key === "c") {
      e.preventDefault();
      setInput("");
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString("cs-CZ", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="terminal-container h-screen w-full crt-effect flex flex-col">
      <div className="scanlines" />
      
      {/* Terminal header */}
      <div className="border-b border-border px-4 py-2 flex items-center justify-between z-20 relative">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-primary" />
          </div>
          <span className="terminal-text text-sm">bloby@groq:~</span>
        </div>
        <span className="terminal-dim text-xs">{formatTimestamp(new Date())}</span>
      </div>

      {/* Terminal content */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 terminal-scrollbar z-20 relative"
        onClick={() => inputRef.current?.focus()}
      >
        {messages.map((msg) => (
          <div key={msg.id} className="mb-3 fade-in">
            {msg.type === "user" && (
              <div className="flex items-start gap-2">
                <span className="terminal-prompt font-bold">bloby&gt;</span>
                <span className="terminal-text">{msg.content}</span>
              </div>
            )}
            {msg.type === "ai" && (
              <div className="pl-6 mt-1">
                <pre className="terminal-text whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {msg.content}
                </pre>
              </div>
            )}
            {msg.type === "system" && (
              <div className="terminal-dim">
                <pre className="whitespace-pre-wrap font-mono text-sm">{msg.content}</pre>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="mb-3 fade-in">
            <div className="flex items-center gap-2 terminal-dim">
              <span className="animate-pulse">Processing</span>
              <span className="animate-bounce">.</span>
              <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
            </div>
          </div>
        )}

        {/* Input line */}
        <div className="flex items-center gap-2">
          <span className="terminal-prompt font-bold">bloby&gt;</span>
          <div className="flex-1 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="terminal-input terminal-text flex-1"
              autoComplete="off"
              spellCheck={false}
            />
            <span className="typing-cursor" />
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="border-t border-border px-4 py-1 flex items-center justify-between text-xs terminal-dim z-20 relative">
        <span>GROQ API | Llama 3.3 70B</span>
        <span>{messages.filter((m) => m.type === "user").length} queries</span>
      </div>
    </div>
  );
};

export default Terminal;
