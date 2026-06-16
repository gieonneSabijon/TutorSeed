"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const UserIcon = () => (
  <svg className="w-5 h-5 text-indigo-300" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const SendIcon = () => (
  <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM14 1a1 1 0 011 1v2h2a1 1 0 110 2h-2v2a1 1 0 11-2 0V6h-2a1 1 0 110-2h2V2a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUBJECT_TEMPLATES: Record<string, { welcome: string; starters: string[] }> = {
  Coding: {
    welcome: "Hey there! I'm your coding tutor. Whether you're debugging a tricky function, learning about data structures, or trying to understand async processes, I'm here to guide you. What programming challenge or concept are we working on today?",
    starters: [
      "Help me understand recursion in programming",
      "Explain the difference between let, const, and var",
      "How do JavaScript Promises work?",
      "Guide me through building a binary search algorithm"
    ]
  },
  Mathematics: {
    welcome: "Welcome to our Socratic math session! Math is all about patterns and problem-solving. Share a problem you're stuck on, or a concept you'd like to explore, and we'll break it down together.",
    starters: [
      "Walk me through solving: 2x + 7 = 15",
      "Explain the concept of a derivative in calculus",
      "What is the Pythagorean theorem and how is it used?",
      "Help me understand matrix multiplication"
    ]
  },
  Science: {
    welcome: "Hello! Ready to explore the laws of nature? From cellular biology to chemical structures or physics, let's work through the principles step-by-step. What shall we investigate today?",
    starters: [
      "Explain photosynthesis in simple terms",
      "What is the difference between covalent and ionic bonds?",
      "How does gravity work according to Einstein?",
      "Help me understand Newton's laws of motion"
    ]
  },
  Writing: {
    welcome: "Greetings, writer! Crafting a compelling essay or story is a step-by-step journey. Tell me about your topic, prompt, or where you're feeling stuck, and we'll refine it together.",
    starters: [
      "Help me write a thesis statement for an essay on climate change",
      "What is the structure of a classic five-paragraph essay?",
      "Explain the difference between active and passive voice",
      "How do I show instead of tell in my stories?"
    ]
  }
};

const MarkdownRenderer = ({ content }: { content: string }) => {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        components={{
          code({ node, className, children, ...props }: any) {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-indigo-300 font-mono text-xs font-semibold" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <div className="relative my-3 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950/90 glow-indigo">
                <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[10px] text-zinc-400 font-mono">
                  <span>Code Example</span>
                </div>
                <pre className="p-4 overflow-x-auto text-xs font-mono text-indigo-200">
                  <code {...props}>{children}</code>
                </pre>
              </div>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default function Home() {
  const [activeSubject, setActiveSubject] = useState<string>("Coding");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize welcome message based on active subject
  useEffect(() => {
    const template = SUBJECT_TEMPLATES[activeSubject];
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: template.welcome,
        timestamp: new Date()
      }
    ]);
    setError(null);
  }, [activeSubject]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto expand input box
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || isLoading) return;

    if (!textToSend) setInput("");
    setError(null);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date()
    };

    const assistantMessageId = (Date.now() + 1).toString();
    const placeholderAssistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages([...updatedMessages, placeholderAssistantMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          subject: activeSubject
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error! Status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body received from server.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, content: accumulatedText }
              : msg
          )
        );
      }
    } catch (err: any) {
      console.error("Chat Stream Error:", err);
      setError(err.message || "Failed to communicate with Gemini API. Check that you set GEMINI_API_KEY inside your .env.local file.");
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#09090b] text-[#fafafa] overflow-hidden font-sans">

      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-900/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <aside className="hidden md:flex md:flex-col w-80 shrink-0 border-r border-zinc-900 bg-zinc-950/40 backdrop-blur-xl p-6 justify-between z-10">
        <div className="space-y-8">

          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-200 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                TutorSeed
              </h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
                Socratic AI Partner
              </p>
            </div>
          </div>

          {/* Subjects Selection */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider pl-1">
              Select Topic
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(SUBJECT_TEMPLATES).map(([subj]) => {
                const isActive = activeSubject === subj;
                return (
                  <button
                    key={subj}
                    onClick={() => !isLoading && setActiveSubject(subj)}
                    disabled={isLoading}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left border ${isActive
                        ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.05)]"
                        : "bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
                      } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <span>{subj}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[10px] text-zinc-600 text-center leading-relaxed font-medium">
          TutorSeed uses Socratic methods. Learn by doing, not by copy-pasting.
        </div>
      </aside>

      {/* Main chat window */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">

        {/* Top Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-zinc-950/20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                Active Topic: {activeSubject}
              </h2>
              <p className="text-[10px] text-zinc-500">Socratic prompt-driven tutor session</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to clear this learning session?")) {
                const template = SUBJECT_TEMPLATES[activeSubject];
                setMessages([
                  {
                    id: "welcome",
                    role: "assistant",
                    content: template.welcome,
                    timestamp: new Date()
                  }
                ]);
                setError(null);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 text-xs font-semibold text-zinc-400 hover:border-red-500/30 hover:text-red-400 transition-all duration-200 bg-zinc-900/10 cursor-pointer"
            title="Clear Chat History"
          >
            <TrashIcon />
            Clear
          </button>
        </header>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => {
              const isTutor = message.role === "assistant";
              return (
                <div
                  key={message.id}
                  className={`flex gap-4 ${isTutor ? "justify-start" : "justify-end"}`}
                >
                  {/* Tutor Avatar */}
                  {isTutor && (
                    <div className="w-8 h-8 rounded-lg bg-indigo-950/70 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-1 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                      <span className="text-xs font-bold text-indigo-400">AI</span>
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 md:p-5 shadow-sm text-sm border transition-all duration-200 ${isTutor
                        ? "bg-zinc-900/40 border-zinc-800/80 text-zinc-200 rounded-tl-none"
                        : "bg-indigo-600/10 border-indigo-500/30 text-zinc-100 rounded-tr-none glow-indigo"
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5 justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        {isTutor ? "TutorSeed" : "You"}
                      </span>
                      <span className="text-[9px] text-zinc-600 font-medium">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Rendering message content */}
                    {message.content ? (
                      <MarkdownRenderer content={message.content} />
                    ) : (
                      /* If message is empty but loading, show typing indicator in bubble */
                      <div className="flex items-center gap-1 py-1.5">
                        <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full typing-dot"></span>
                        <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full typing-dot"></span>
                        <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full typing-dot"></span>
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {!isTutor && (
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-1">
                      <UserIcon />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Suggested starters when only welcome message is visible */}
            {messages.length === 1 && (
              <div className="pt-6 space-y-4">
                <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider pl-1">
                  <SparklesIcon />
                  <span>Choose a starting challenge:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SUBJECT_TEMPLATES[activeSubject].starters.map((starter, index) => (
                    <button
                      key={index}
                      onClick={() => handleSend(starter)}
                      className="p-4 text-left rounded-xl border border-zinc-800 bg-zinc-900/10 hover:bg-indigo-950/10 hover:border-indigo-500/20 text-xs text-zinc-300 font-medium transition-all duration-200 cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(99,102,241,0.05)]"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-xs text-red-300 space-y-2">
                <p className="font-semibold flex items-center gap-1.5">
                  Connection Error
                </p>
                <p className="leading-relaxed">{error}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input Section */}
        <div className="p-6 border-t border-zinc-900 bg-zinc-950/10 backdrop-blur-md">
          <div className="max-w-3xl mx-auto relative">

            {/* Input Form */}
            <div className="flex items-end gap-3 p-1.5 rounded-xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm shadow-md">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask TutorSeed a question or show your code..."
                rows={1}
                disabled={isLoading}
                className="flex-1 bg-transparent border-0 text-sm py-2 px-3 focus:outline-none focus:ring-0 text-zinc-100 placeholder-zinc-500 resize-none min-h-[38px] max-h-40"
              />

              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className={`p-2.5 rounded-lg flex items-center justify-center transition-all duration-200 ${isLoading || !input.trim()
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer glow-indigo"
                  }`}
              >
                <SendIcon />
              </button>
            </div>

            {/* Bottom Info Tip */}
            <div className="flex items-center justify-between mt-2.5 px-1.5">
              <p className="text-[10px] text-zinc-500">
                Tip: Press <kbd className="px-1 py-0.5 bg-zinc-800 rounded text-[9px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-zinc-800 rounded text-[9px]">Shift + Enter</kbd> for new line.
              </p>
              {isLoading && (
                <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-medium">
                  <span>Gemini is generating response</span>
                  <span className="flex h-1.5 w-1.5 bg-indigo-400 rounded-full typing-dot"></span>
                  <span className="flex h-1.5 w-1.5 bg-indigo-400 rounded-full typing-dot"></span>
                  <span className="flex h-1.5 w-1.5 bg-indigo-400 rounded-full typing-dot"></span>
                </div>
              )}
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
