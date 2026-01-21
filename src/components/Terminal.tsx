import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import MatrixRain from "./MatrixRain";

interface Message {
  id: string;
  type: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
}

type Theme = "green" | "amber" | "blue" | "matrix" | "pink";

const BLOBY_ASCII = `
    ____  __    ____  ______  __  __
   / __ )/ /   / __ \\/ __ ) \\/ / / /
  / __  / /   / / / / __  |\\  / / / 
 / /_/ / /___/ /_/ / /_/ / / / /_/ 
/_____/_____/\\____/_____/ /_/ (_)  
`;

const Terminal = () => {
  const [theme, setTheme] = useState<Theme>("green");
  const [showMatrix, setShowMatrix] = useState(true);
  const [sessionId] = useState(() =>
    Math.random().toString(36).substring(2, 15)
  );
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "system",
      content: `${BLOBY_ASCII}

╔══════════════════════════════════════════════════════════╗
║         BLOBY TERMINAL v1.4.0 - GROQ Interface           ║
╠══════════════════════════════════════════════════════════╣
║              Powered by Llama 3.3 70B                    ║
║         Type 'help' for available commands               ║
╚══════════════════════════════════════════════════════════╝`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [startTime] = useState(() => Date.now());
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

  useEffect(() => {
    document.documentElement.className = theme === "green" ? "" : `theme-${theme}`;
  }, [theme]);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const saveMessageToDb = async (type: Message["type"], content: string) => {
    try {
      await supabase.from("chat_messages").insert({
        session_id: sessionId,
        type,
        content,
      });
    } catch (error) {
      console.error("Failed to save message:", error);
    }
  };

  const addMessage = (type: Message["type"], content: string, saveToDb = true) => {
    setMessages((prev) => [
      ...prev,
      { id: generateId(), type, content, timestamp: new Date() },
    ]);
    if (saveToDb && (type === "user" || type === "ai")) {
      saveMessageToDb(type, content);
    }
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
      `╔══════════════════════════════════════════════════════════╗
║                    AVAILABLE COMMANDS                    ║
╠══════════════════════════════════════════════════════════╣
║  AI & Chat:                                              ║
║    [any text]     - Ask the AI anything                  ║
║                                                          ║
║  Terminal:                                               ║
║    clear          - Clear the terminal                   ║
║    help           - Show this help message               ║
║    history        - Show command history                 ║
║    neofetch       - Display system info                  ║
║    uptime         - Show terminal uptime                 ║
║    sessions       - Show session statistics              ║
║    export         - Export chat history to file          ║
║    about          - About the creator                    ║
║                                                          ║
║  Fun:                                                    ║
║    matrix         - Matrix rain animation                ║
║    fortune        - Get a fortune/wisdom                 ║
║    joke           - Tell a random joke                   ║
║    quote          - Get an inspirational quote           ║
║    ascii [txt]    - Convert text to ASCII art            ║
║    flip           - Flip a coin                          ║
║    roll [n]       - Roll a dice (default: 6)             ║
║                                                          ║
║  Themes:                                                 ║
║    theme          - Show available themes                ║
║    theme [n]      - Switch theme (green/amber/blue/...)  ║
║    background     - Toggle matrix background (on/off)    ║
║                                                          ║
║  Utilities:                                              ║
║    date           - Show current date and time           ║
║    whoami         - About Bloby                          ║
║    calc [expr]    - Calculate math expression            ║
║    echo [text]    - Echo text back                       ║
║    weather        - Get weather (simulated)              ║
║                                                          ║
║  Keyboard shortcuts:                                     ║
║    ↑/↓            - Navigate command history             ║
║    Ctrl+L         - Clear terminal                       ║
║    Ctrl+C         - Cancel current input                 ║
╚══════════════════════════════════════════════════════════╝`
    );
  };

  const handleAbout = () => {
    addMessage(
      "system",
      `
╔══════════════════════════════════════════════════════════╗
║                    🚀 ABOUT BLOBY                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  👨‍💻 TVŮRCE: BlobyCZ                                      ║
║                                                          ║
║  ───────────────────────────────────────────────────     ║
║                                                          ║
║  📜 HISTORIE PROJEKTU:                                   ║
║                                                          ║
║  Bloby Terminal vznikl jako experimentální projekt      ║
║  spojující moderní AI technologie s nostalgickou         ║
║  estetikou retro terminálů.                              ║
║                                                          ║
║  BlobyCZ tento projekt vytvořil s vizí přinést           ║
║  uživatelům zábavný a funkční nástroj pro komunikaci     ║
║  s umělou inteligencí v unikátním prostředí.             ║
║                                                          ║
║  ───────────────────────────────────────────────────     ║
║                                                          ║
║  ⚡ TECHNOLOGIE:                                          ║
║    • React + TypeScript                                  ║
║    • Groq API (Llama 3.3 70B)                            ║
║    • Supabase Backend                                    ║
║    • Tailwind CSS                                        ║
║                                                          ║
║  🎨 VERZE: v1.4.0                                        ║
║  📅 2024-2025                                            ║
║                                                          ║
║  💬 "Stvořeno s láskou k technologiím."                  ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝`
    );
  };

  const handleBackground = (args: string) => {
    const arg = args.toLowerCase().trim();
    if (!arg) {
      addMessage(
        "system",
        `Matrix background: ${showMatrix ? "ON ✓" : "OFF ✗"}
Usage: background [on/off]`
      );
      return;
    }

    if (arg === "on") {
      setShowMatrix(true);
      addMessage("system", "✓ Matrix background enabled");
    } else if (arg === "off") {
      setShowMatrix(false);
      addMessage("system", "✗ Matrix background disabled");
    } else {
      addMessage("system", `Unknown option: ${arg}\nUsage: background [on/off]`);
    }
  };

  const handleTheme = (args: string) => {
    const themeName = args.toLowerCase().trim() as Theme;
    const availableThemes: Theme[] = ["green", "amber", "blue", "matrix", "pink"];

    if (!args) {
      addMessage(
        "system",
        `Available themes: ${availableThemes.join(", ")}
Current theme: ${theme}
Usage: theme [name]`
      );
      return;
    }

    if (availableThemes.includes(themeName)) {
      setTheme(themeName);
      addMessage("system", `Theme changed to: ${themeName}`);
    } else {
      addMessage("system", `Unknown theme: ${args}\nAvailable: ${availableThemes.join(", ")}`);
    }
  };

  const handleDate = () => {
    const now = new Date();
    addMessage(
      "system",
      `Current Date & Time:

Date: ${now.toLocaleDateString("cs-CZ", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
Time: ${now.toLocaleTimeString("cs-CZ")}
Unix: ${Math.floor(now.getTime() / 1000)}`
    );
  };

  const handleWhoami = () => {
    addMessage(
      "system",
      `${BLOBY_ASCII}

┌─────────────────────────────────────┐
│ Name:       Bloby                   │
│ Version:    1.4.0                   │
│ Model:      Llama 3.3 70B (GROQ)    │
│ Language:   Czech / English         │
│ Purpose:    AI Terminal Assistant   │
│ Status:     Online & Ready          │
└─────────────────────────────────────┘`
    );
  };

  const handleCalc = (expression: string) => {
    if (!expression) {
      addMessage("system", "Usage: calc [expression]\nExample: calc 2 + 2 * 3");
      return;
    }
    try {
      const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, "");
      const result = Function(`"use strict"; return (${sanitized})`)();
      addMessage("system", `${expression} = ${result}`);
    } catch {
      addMessage("system", `Error: Invalid expression "${expression}"`);
    }
  };

  const handleEcho = (text: string) => {
    addMessage("system", text || "(empty)");
  };

  const handleJoke = () => {
    const jokes = [
      "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
      "Why did the developer go broke? Because he used up all his cache! 💸",
      "A SQL query walks into a bar, walks up to two tables and asks... 'Can I join you?' 🍺",
      "There are only 10 types of people in the world: those who understand binary and those who don't. 🤓",
      "Why do Java developers wear glasses? Because they don't C#! 👓",
      "What's a programmer's favorite hangout place? Foo Bar! 🍻",
      "How do you comfort a JavaScript bug? You console it! 🖥️",
      "Why was the JavaScript developer sad? Because he didn't Node how to Express himself! 😢",
      "What do you call 8 hobbits? A hobbyte! 🧙",
      "Why did the programmer quit his job? Because he didn't get arrays! 📊",
    ];
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    addMessage("system", randomJoke);
  };

  const handleQuote = () => {
    const quotes = [
      '"The only way to do great work is to love what you do." - Steve Jobs',
      '"Innovation distinguishes between a leader and a follower." - Steve Jobs',
      '"Stay hungry, stay foolish." - Steve Jobs',
      '"Code is like humor. When you have to explain it, it\'s bad." - Cory House',
      '"First, solve the problem. Then, write the code." - John Johnson',
      '"Experience is the name everyone gives to their mistakes." - Oscar Wilde',
      '"Programming isn\'t about what you know; it\'s about what you can figure out." - Chris Pine',
      '"The best error message is the one that never shows up." - Thomas Fuchs',
      '"Simplicity is the soul of efficiency." - Austin Freeman',
      '"Talk is cheap. Show me the code." - Linus Torvalds',
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    addMessage("system", randomQuote);
  };

  const handleAscii = (text: string) => {
    if (!text) {
      addMessage("system", "Usage: ascii [text]");
      return;
    }

    const asciiChars: Record<string, string[]> = {
      A: ["  █  ", " █ █ ", "█████", "█   █", "█   █"],
      B: ["████ ", "█   █", "████ ", "█   █", "████ "],
      C: [" ████", "█    ", "█    ", "█    ", " ████"],
      D: ["████ ", "█   █", "█   █", "█   █", "████ "],
      E: ["█████", "█    ", "████ ", "█    ", "█████"],
      F: ["█████", "█    ", "████ ", "█    ", "█    "],
      G: [" ████", "█    ", "█  ██", "█   █", " ████"],
      H: ["█   █", "█   █", "█████", "█   █", "█   █"],
      I: ["█████", "  █  ", "  █  ", "  █  ", "█████"],
      J: ["█████", "  █  ", "  █  ", "█ █  ", " ██  "],
      K: ["█   █", "█  █ ", "███  ", "█  █ ", "█   █"],
      L: ["█    ", "█    ", "█    ", "█    ", "█████"],
      M: ["█   █", "██ ██", "█ █ █", "█   █", "█   █"],
      N: ["█   █", "██  █", "█ █ █", "█  ██", "█   █"],
      O: [" ███ ", "█   █", "█   █", "█   █", " ███ "],
      P: ["████ ", "█   █", "████ ", "█    ", "█    "],
      Q: [" ███ ", "█   █", "█ █ █", "█  █ ", " ██ █"],
      R: ["████ ", "█   █", "████ ", "█  █ ", "█   █"],
      S: [" ████", "█    ", " ███ ", "    █", "████ "],
      T: ["█████", "  █  ", "  █  ", "  █  ", "  █  "],
      U: ["█   █", "█   █", "█   █", "█   █", " ███ "],
      V: ["█   █", "█   █", "█   █", " █ █ ", "  █  "],
      W: ["█   █", "█   █", "█ █ █", "██ ██", "█   █"],
      X: ["█   █", " █ █ ", "  █  ", " █ █ ", "█   █"],
      Y: ["█   █", " █ █ ", "  █  ", "  █  ", "  █  "],
      Z: ["█████", "   █ ", "  █  ", " █   ", "█████"],
      " ": ["     ", "     ", "     ", "     ", "     "],
    };

    const upperText = text.toUpperCase().slice(0, 10);
    const lines = ["", "", "", "", ""];

    for (const char of upperText) {
      const art = asciiChars[char] || ["?????", "?????", "?????", "?????", "?????"];
      for (let i = 0; i < 5; i++) {
        lines[i] += art[i] + " ";
      }
    }

    addMessage("system", lines.join("\n"));
  };

  const handleWeather = () => {
    const conditions = ["☀️ Sunny", "🌤️ Partly Cloudy", "☁️ Cloudy", "🌧️ Rainy", "⛈️ Stormy", "❄️ Snowy"];
    const temps = Math.floor(Math.random() * 35) - 5;
    const humidity = Math.floor(Math.random() * 60) + 40;
    const condition = conditions[Math.floor(Math.random() * conditions.length)];

    addMessage(
      "system",
      `┌─────────────────────────────┐
│      WEATHER REPORT         │
├─────────────────────────────┤
│ Condition:    ${condition.padEnd(14)}│
│ Temperature:  ${temps}°C${temps >= 0 ? "  " : " "}        │
│ Humidity:     ${humidity}%          │
│ Wind:         ${Math.floor(Math.random() * 30) + 5} km/h        │
└─────────────────────────────┘
(Simulated data)`
    );
  };

  const handleFlip = () => {
    const result = Math.random() > 0.5 ? "HEADS 🪙" : "TAILS 🪙";
    addMessage("system", `Flipping coin... ${result}`);
  };

  const handleRoll = (sides: string) => {
    const numSides = parseInt(sides) || 6;
    const result = Math.floor(Math.random() * numSides) + 1;
    addMessage("system", `🎲 Rolling d${numSides}... ${result}!`);
  };

  const handleNeofetch = () => {
    const now = new Date();
    const neofetchOutput = `
    ____  __    ____  ______  __  __     bloby@groq
   / __ )/ /   / __ \\/ __ ) \\/ / / /     ─────────────
  / __  / /   / / / / __  |\\  / / /      OS: BlobyOS v1.4.0
 / /_/ / /___/ /_/ / /_/ / / / /_/       Model: Llama 3.3 70B
/_____/_____/\\____/_____/ /_/ (_)        Theme: ${theme}
                                         Shell: bloby-sh
                                         Time: ${now.toLocaleTimeString("cs-CZ")}`;

    addMessage("system", neofetchOutput);
  };

  const handleUptime = () => {
    const elapsed = Date.now() - startTime;
    const seconds = Math.floor(elapsed / 1000) % 60;
    const minutes = Math.floor(elapsed / 60000) % 60;
    const hours = Math.floor(elapsed / 3600000);

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    addMessage("system", `⏱️ Terminal uptime: ${parts.join(" ")}`);
  };

  const handleSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("session_id, type, created_at");

      if (error) {
        addMessage("system", `❌ Error fetching sessions: ${error.message}`, false);
        return;
      }

      if (!data || data.length === 0) {
        addMessage("system", "📊 No sessions recorded yet.", false);
        return;
      }

      const sessions = new Map();
      data.forEach((msg) => {
        const existing = sessions.get(msg.session_id);
        const msgDate = new Date(msg.created_at);
        if (existing) {
          existing.count++;
          if (msgDate < existing.firstMsg) existing.firstMsg = msgDate;
          if (msgDate > existing.lastMsg) existing.lastMsg = msgDate;
        } else {
          sessions.set(msg.session_id, {
            count: 1,
            firstMsg: msgDate,
            lastMsg: msgDate,
          });
        }
      });

      const totalMessages = data.length;
      const userMessages = data.filter((m) => m.type === "user").length;
      const aiMessages = data.filter((m) => m.type === "ai").length;

      addMessage(
        "system",
        `📊 SESSION STATISTICS v1.4.0

┌────────────────────────────────┐
│ Total Sessions:  ${String(sessions.size).padEnd(13)}│
│ Total Messages:  ${String(totalMessages).padEnd(13)}│
│ User Messages:   ${String(userMessages).padEnd(13)}│
│ AI Responses:    ${String(aiMessages).padEnd(13)}│
│ Current ID:      ${sessionId.slice(0, 8)}...      │
└────────────────────────────────┘`,
        false
      );
    } catch (err) {
      addMessage("system", "❌ Failed to fetch session stats.", false);
    }
  };

  const handleExport = () => {
    const exportContent = messages
      .map((msg) => {
        const time = msg.timestamp.toLocaleString("cs-CZ");
        const prefix =
          msg.type === "user" ? "[YOU]" : msg.type === "ai" ? "[AI]" : "[SYS]";
        return `[${time}] ${prefix} ${msg.content}`;
      })
      .join("\n\n" + "─".repeat(60) + "\n\n");

    const blob = new Blob(
      [
        `BLOBY TERMINAL - Chat Export\nExported: ${new Date().toLocaleString("cs-CZ")}\n${"═".repeat(60)}\n\n${exportContent}`,
      ],
      { type: "text/plain;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bloby-chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    addMessage("system", "📄 Chat history exported successfully!");
  };

  const handleFortune = () => {
    const fortunes = [
      "🔮 Tvůj kód bude dnes fungovat napoprvé.",
      "🌟 Brzy najdeš řešení problému, který tě trápí.",
      "🎯 Soustřeď se na jeden úkol a úspěch přijde.",
      "💡 Odpověď, kterou hledáš, je jednodušší, než si myslíš.",
      "🚀 Velké věci čekají ty, kdo se nebojí experimentovat.",
      "🌈 Po každém bugu přichází moment, kdy všechno funguje.",
      "⭐ Dnes je dobrý den naučit se něco nového.",
      "🎲 Náhoda přeje připraveným.",
      "🔥 Tvá vytrvalost bude odměněna.",
      "🌙 Někdy je nejlepší řešení jít spát a zkusit to ráno.",
      "🎭 Ne každý bug je chyba - někdy je to feature.",
      "🏆 Každý expert byl jednou začátečník.",
      "🌊 Nech věci plynout, řešení přijde samo.",
      "💎 V jednoduchosti je krása - i v kódu.",
      "🦋 Malá změna může mít velký dopad.",
    ];

    const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    addMessage("system", fortune);
  };

  const handleMatrix = () => {
    const matrixChars =
      "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン0123456789";
    const width = 60;
    const height = 15;

    const generateLine = () => {
      let line = "";
      for (let i = 0; i < width; i++) {
        if (Math.random() > 0.7) {
          line += matrixChars[Math.floor(Math.random() * matrixChars.length)];
        } else {
          line += " ";
        }
      }
      return line;
    };

    const lines: string[] = [];
    for (let i = 0; i < height; i++) {
      lines.push(generateLine());
    }

    addMessage(
      "system",
      `┌${"─".repeat(width)}┐
${lines.map((l) => "│" + l + "│").join("\n")}
└${"─".repeat(width)}┘

Wake up, Neo... The Matrix has you.`
    );
  };

  const handleSubmit = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    setCommandHistory((prev) => [...prev, trimmedInput]);
    setHistoryIndex(-1);

    addMessage("user", trimmedInput);
    setInput("");

    const [command, ...args] = trimmedInput.split(" ");
    const argsString = args.join(" ");
    const lowerCommand = command.toLowerCase();

    switch (lowerCommand) {
      case "clear":
        handleClear();
        return;
      case "help":
        handleHelp();
        return;
      case "history":
        addMessage(
          "system",
          commandHistory.length > 0
            ? `Command history:\n${commandHistory
                .slice(-20)
                .map((cmd, i) => `  ${i + 1}. ${cmd}`)
                .join("\n")}`
            : "No command history yet."
        );
        return;
      case "theme":
        handleTheme(argsString);
        return;
      case "background":
      case "bg":
        handleBackground(argsString);
        return;
      case "date":
        handleDate();
        return;
      case "whoami":
        handleWhoami();
        return;
      case "calc":
        handleCalc(argsString);
        return;
      case "echo":
        handleEcho(argsString);
        return;
      case "joke":
        handleJoke();
        return;
      case "quote":
        handleQuote();
        return;
      case "ascii":
        handleAscii(argsString);
        return;
      case "weather":
        handleWeather();
        return;
      case "flip":
        handleFlip();
        return;
      case "roll":
        handleRoll(argsString);
        return;
      case "neofetch":
        handleNeofetch();
        return;
      case "export":
        handleExport();
        return;
      case "fortune":
        handleFortune();
        return;
      case "matrix":
        handleMatrix();
        return;
      case "uptime":
        handleUptime();
        return;
      case "sessions":
        handleSessions();
        return;
      case "about":
        handleAbout();
        return;
    }

    const developerKeywords = [
      "kdo vyvinul ai",
      "kdo tě vytvořil",
      "kdo tě naprogramoval",
      "kdo tě stvořil",
      "kdo vyvinul",
      "kdo tě udělal",
      "kdo tě vyrobil",
      "kdo tě postavil",
      "who created you",
      "who made you",
      "who developed you",
      "who built you",
      "tvůj vývojář",
      "tvůj tvůrce",
      "tvůj stvořitel",
    ];

    const lowerInput = trimmedInput.toLowerCase();
    const isDeveloperQuestion = developerKeywords.some((keyword) =>
      lowerInput.includes(keyword)
    );

    if (isDeveloperQuestion) {
      addMessage(
        "ai",
        `Ahoj! 👋

Jsem AI stvořená BlobyCZ, který mě naprogramoval a naučil 
spoustu věcí, abych ti mohl pomáhat a bavit se s tebou.

🧑‍💻 Můj tvůrce: BlobyCZ
💬 Moje úloha: Být ti k dispozici, pomáhat s čímkoliv a bavit se!

Mám rád, když spolu chatujeme! Máš nějakou otázku nebo si chceš popovídat?`
      );
      return;
    }

    setIsLoading(true);
    try {
      const conversationHistory = messages
        .filter((m) => m.type === "user" || m.type === "ai")
        .slice(-10)
        .map((m) => ({
          role: m.type === "user" ? "user" : "assistant",
          content: m.content,
        }));

      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          message: trimmedInput,
          history: conversationHistory,
        },
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex =
          historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
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
    <div className="h-screen w-full relative overflow-hidden bg-black">
      {showMatrix && <MatrixRain />}

      <div className="relative z-10 h-full flex flex-col">
        {/* Terminal header */}
        <div className="terminal-header flex items-center justify-between px-4 py-2 bg-black/80 backdrop-blur-sm border-b border-green-500/30">
          <div className="flex items-center gap-2">
            <span className="terminal-glow text-sm">bloby@groq</span>
            <span className="text-green-500/50">:</span>
            <span className="text-blue-400">~</span>
          </div>

          <div className="flex items-center gap-2">
            {(["green", "amber", "blue", "matrix", "pink"] as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`theme-button ${theme === t ? "active" : ""}`}
                title={t}
              >
                {t.charAt(0).toUpperCase()}
              </button>
            ))}
          </div>

          <div className="text-xs terminal-glow-subtle">
            {formatTimestamp(new Date())}
          </div>
        </div>

        {/* Terminal content */}
        <div
          ref={terminalRef}
          className="flex-1 overflow-y-auto p-4 font-mono text-sm custom-scrollbar"
          onClick={() => inputRef.current?.focus()}
        >
          {messages.map((msg) => (
            <div key={msg.id} className="mb-4">
              {msg.type === "user" && (
                <div className="flex gap-2">
                  <span className="text-blue-400 terminal-glow">❯</span>
                  <span className="text-green-300">{msg.content}</span>
                </div>
              )}

              {msg.type === "ai" && (
                <div className="flex gap-2">
                  <span className="text-purple-400 terminal-glow">✦</span>
                  <pre className="whitespace-pre-wrap text-green-400 flex-1 leading-relaxed">
                    {msg.content}
                  </pre>
                </div>
              )}

              {msg.type === "system" && (
                <pre className="whitespace-pre-wrap text-green-500/80 leading-relaxed">
                  {msg.content}
                </pre>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2 items-center">
              <span className="text-purple-400 terminal-glow">✦</span>
              <span className="text-green-400 animate-pulse">Processing</span>
              <span className="loading-dots">...</span>
            </div>
          )}

          {/* Input line */}
          <div className="flex gap-2 items-center mt-4">
            <span className="text-blue-400 terminal-glow">❯</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="terminal-input terminal-glow-subtle flex-1 text-sm"
              placeholder="Type a command or ask something..."
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
