"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Store,
  ShoppingBag,
  Briefcase,
  LogIn,
  UserPlus,
  ArrowRight,
  Calendar,
  HelpCircle,
  Compass,
  Phone,
  Mail,
} from "lucide-react";

export interface SalonBotProps {
  /** Optional controlled open state */
  isOpen?: boolean;
  /** Optional callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Legacy prop support for backwards compatibility */
  isChatOpen?: boolean;
  /** Legacy callback support for backwards compatibility */
  setIsChatOpen?: (open: boolean) => void;
}

const SUGGESTED_QUESTIONS: string[] = [
  "How do I book a salon appointment?",
  "Tell me how many salons you have",
  "What is the name of that salon?",
  "What payment methods are supported?",
  "How can I register my salon as an owner?",
];

/**
 * Returns a fitting Lucide icon based on route URL
 */
function getRouteIcon(url: string) {
  const clean = url.split("?")[0].toLowerCase();
  if (clean.includes("salon")) return <Store className="w-3.5 h-3.5 text-[#e2b755]" />;
  if (clean.includes("product")) return <ShoppingBag className="w-3.5 h-3.5 text-[#e2b755]" />;
  if (clean.includes("vendor")) return <Briefcase className="w-3.5 h-3.5 text-[#e2b755]" />;
  if (clean.includes("signin") || clean.includes("login")) return <LogIn className="w-3.5 h-3.5 text-[#e2b755]" />;
  if (clean.includes("register") || clean.includes("signup")) return <UserPlus className="w-3.5 h-3.5 text-[#e2b755]" />;
  if (clean.includes("book")) return <Calendar className="w-3.5 h-3.5 text-[#e2b755]" />;
  if (clean.includes("support") || clean.includes("contact")) return <HelpCircle className="w-3.5 h-3.5 text-[#e2b755]" />;
  if (url.startsWith("mailto:")) return <Mail className="w-3.5 h-3.5 text-[#e2b755]" />;
  if (url.startsWith("tel:")) return <Phone className="w-3.5 h-3.5 text-[#e2b755]" />;
  return <Compass className="w-3.5 h-3.5 text-[#e2b755]" />;
}

/**
 * Friendly fallback label for common routes
 */
function getRouteDefaultLabel(url: string) {
  const clean = url.split("?")[0].toLowerCase();
  if (clean === "/salons") return "Browse Salons";
  if (clean === "/selfcare-products") return "Shop Products";
  if (clean === "/vendor") return "Vendor Portal";
  if (clean === "/auth/signin") return "Sign In";
  if (clean === "/auth/register") return "Register Account";
  if (clean === "/support") return "Customer Support";
  if (clean === "/contactus") return "Contact Us";
  if (clean === "/bookings" || clean === "/booking") return "My Bookings";
  return "Explore";
}

interface FormattedMessageProps {
  content: string;
  isUser: boolean;
}

/**
 * FormattedMessage: Eliminates all raw asterisk characters (* and **),
 * styles bold/bullet text semantically, and converts route links into
 * interactive Next.js client-side navigation buttons.
 */
function FormattedMessage({ content, isUser }: FormattedMessageProps) {
  const router = useRouter();

  if (isUser) {
    return <div className="whitespace-pre-wrap">{content.replace(/\*/g, "")}</div>;
  }

  const handleNavigate = (url: string) => {
    if (url.startsWith("/")) {
      router.push(url);
    } else if (url.startsWith("mailto:") || url.startsWith("tel:")) {
      window.location.href = url;
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const parseInlineTokens = (text: string): React.ReactNode[] => {
    // Matches:
    // 1. [Label](url)
    // 2. **bold**
    // 3. *italic*
    // 4. Standalone known route paths e.g. /salons, /Vendor
    const tokenRegex =
      /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|(?:\b|^)(\/(?:salons|selfcare-products|Vendor|auth\/signin|auth\/register|Support|ContactUs|bookings))\b)/g;

    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let keyIdx = 0;

    while ((match = tokenRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const plain = text.slice(lastIndex, match.index).replace(/\*/g, "");
        if (plain) {
          nodes.push(<span key={`txt-${keyIdx++}`}>{plain}</span>);
        }
      }

      const matched = match[0].trim();

      if (matched.startsWith("[") && matched.includes("](")) {
        const linkMatch = matched.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (linkMatch) {
          let label = linkMatch[1].trim();
          const url = linkMatch[2].trim();
          if (label.startsWith("/") || label.startsWith("[")) {
            label = getRouteDefaultLabel(url);
          }
          label = label.replace(/\*/g, "");

          nodes.push(
            <button
              key={`btn-${keyIdx++}`}
              type="button"
              onClick={() => handleNavigate(url)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 my-0.5 mx-1 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#70063c] via-[#830a48] to-[#a2125f] hover:from-[#830a48] hover:to-[#b5146c] shadow-2xs hover:shadow-xs transition-all duration-150 active:scale-95 cursor-pointer border border-[#e2b755]/40 group select-none align-middle"
              title={`Navigate to ${label}`}
            >
              {getRouteIcon(url)}
              <span className="tracking-tight">{label}</span>
              <ArrowRight className="w-3 h-3 text-[#e2b755] transition-transform duration-150 group-hover:translate-x-0.5" />
            </button>,
          );
        }
      } else if (matched.startsWith("**") && matched.endsWith("**")) {
        const boldText = matched.slice(2, -2).replace(/\*/g, "");
        nodes.push(
          <strong key={`bld-${keyIdx++}`} className="font-semibold text-gray-900">
            {boldText}
          </strong>,
        );
      } else if (matched.startsWith("*") && matched.endsWith("*")) {
        const italicText = matched.slice(1, -1).replace(/\*/g, "");
        nodes.push(
          <span key={`it-${keyIdx++}`} className="font-medium text-gray-800">
            {italicText}
          </span>,
        );
      } else if (matched.startsWith("/")) {
        const url = matched;
        const label = getRouteDefaultLabel(url);
        nodes.push(
          <button
            key={`rt-${keyIdx++}`}
            type="button"
            onClick={() => handleNavigate(url)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 my-0.5 mx-1 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#70063c] via-[#830a48] to-[#a2125f] hover:from-[#830a48] hover:to-[#b5146c] shadow-2xs hover:shadow-xs transition-all duration-150 active:scale-95 cursor-pointer border border-[#e2b755]/40 group select-none align-middle"
            title={`Navigate to ${label}`}
          >
            {getRouteIcon(url)}
            <span className="tracking-tight">{label}</span>
            <ArrowRight className="w-3 h-3 text-[#e2b755] transition-transform duration-150 group-hover:translate-x-0.5" />
          </button>,
        );
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      const remaining = text.slice(lastIndex).replace(/\*/g, "");
      if (remaining) {
        nodes.push(<span key={`txt-${keyIdx++}`}>{remaining}</span>);
      }
    }

    return nodes;
  };

  const lines = content.split("\n");

  return (
    <div className="space-y-1.5 text-[13.5px] leading-relaxed">
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();
        if (!line) {
          return <div key={idx} className="h-1" />;
        }

        // Pure action button line: e.g. [Browse Salons](/salons)
        const pureButtonMatch = line.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (pureButtonMatch) {
          let label = pureButtonMatch[1].trim();
          const url = pureButtonMatch[2].trim();
          if (label.startsWith("/") || label.startsWith("[")) {
            label = getRouteDefaultLabel(url);
          }
          label = label.replace(/\*/g, "");

          return (
            <div key={idx} className="my-1.5">
              <button
                type="button"
                onClick={() => handleNavigate(url)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#70063c] via-[#830a48] to-[#a2125f] hover:from-[#830a48] hover:to-[#b5146c] shadow-xs hover:shadow transition-all duration-150 active:scale-95 cursor-pointer border border-[#e2b755]/30 group select-none"
              >
                {getRouteIcon(url)}
                <span className="tracking-tight">{label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#e2b755] transition-transform duration-150 group-hover:translate-x-0.5" />
              </button>
            </div>
          );
        }

        // Bullet list items starting with * or - or •
        const bulletMatch = line.match(/^(\*|-|•)\s+(.*)$/);
        if (bulletMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 my-1 pl-1">
              <span className="text-[#830a48] font-bold text-xs mt-0.5 shrink-0 select-none">
                •
              </span>
              <div className="flex-1">{parseInlineTokens(bulletMatch[2])}</div>
            </div>
          );
        }

        // Numbered list items: e.g. "1. "
        const numberMatch = line.match(/^(\d+)\.\s+(.*)$/);
        if (numberMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 my-1 pl-1">
              <span className="text-[#830a48] font-semibold text-xs mt-0.5 shrink-0 select-none">
                {numberMatch[1]}.
              </span>
              <div className="flex-1">{parseInlineTokens(numberMatch[2])}</div>
            </div>
          );
        }

        // Standard paragraph line
        return (
          <p key={idx} className="my-0.5">
            {parseInlineTokens(line)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * SalonBot - Production-Ready RAG AI Customer Support Assistant for SalonSphere.
 * Powered by Next.js App Router, MongoDB Atlas Vector Search, and Vercel AI SDK.
 */
export default function SalonBot({
  isOpen: controlledIsOpen,
  onOpenChange,
  isChatOpen: legacyIsOpen,
  setIsChatOpen: legacySetIsOpen,
}: SalonBotProps) {
  // Support both uncontrolled (standalone) and controlled open states
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);

  const isControlled =
    controlledIsOpen !== undefined || legacyIsOpen !== undefined;
  const isOpen = isControlled
    ? controlledIsOpen ?? legacyIsOpen ?? false
    : internalIsOpen;

  const setIsOpen = (open: boolean) => {
    if (!isControlled) {
      setInternalIsOpen(open);
    }
    onOpenChange?.(open);
    legacySetIsOpen?.(open);
  };

  // Vercel AI SDK useChat hook connecting to App Router /api/chat
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    append,
    reload,
    setMessages,
    error,
  } = useChat({
    api: "/api/chat",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to the bottom whenever messages change or during streaming tokens
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Focus input field when chat window opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Handle suggested question pill click
  const handleSuggestedClick = async (question: string) => {
    await append({
      role: "user",
      content: question,
    });
  };

  const handleClearHistory = () => {
    setMessages([]);
  };

  return (
    <>
      {/* Floating Action Button Launcher (Shown only in standalone mode) */}
      {!isOpen && !isControlled && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open SalonSphere AI Support"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-[#830a48]/40"
          style={{
            background: "linear-gradient(135deg, #70063c 0%, #830a48 50%, #a2125f 100%)",
          }}
        >
          <div className="relative flex items-center justify-center">
            <MessageSquare className="w-5 h-5 transition-transform duration-300 group-hover:rotate-6" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e2b755] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#e2b755]"></span>
            </span>
          </div>
          <span className="font-semibold text-sm tracking-wide">
            Chat with SalonBot
          </span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="SalonSphere AI Support Chat"
          className="fixed bottom-4 right-4 z-50 flex flex-col w-[calc(100vw-2rem)] sm:w-[410px] md:w-[430px] h-[640px] max-h-[88vh] rounded-2xl shadow-2xl overflow-hidden border border-[#830a48]/20 bg-white transition-all duration-200 animate-in fade-in slide-in-from-bottom-5"
        >
          {/* Header - Deep Magenta Gradient (#70063c -> #830a48 -> #a2125f) */}
          <header
            className="flex items-center justify-between px-4 py-3.5 text-white shrink-0 shadow-md select-none"
            style={{
              background: "linear-gradient(135deg, #70063c 0%, #830a48 55%, #a2125f 100%)",
            }}
          >
            <div className="flex items-center space-x-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white shadow-inner">
                <Bot className="w-5 h-5" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#70063c] rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-tight text-white">
                    SalonBot
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#e2b755] text-[#70063c] shadow-xs">
                    RAG AI
                  </span>
                </div>
                <p className="text-[11px] text-white/80 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  SalonSphere Support Concierge
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  title="Clear conversation"
                  aria-label="Clear conversation history"
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Minimize chat"
                aria-label="Close support chat"
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Chat Messages Body */}
          <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#faf7f9]">
            {/* Initial Welcome Message (Shown when history is empty) */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-white border border-[#f2d8e4] shadow-sm space-y-3 animate-in fade-in duration-300">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md"
                  style={{
                    background: "linear-gradient(135deg, #70063c 0%, #830a48 100%)",
                  }}
                >
                  <Sparkles className="w-6 h-6 text-[#e2b755]" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">
                    Welcome to SalonSphere Support
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    I am your intelligent concierge powered by MongoDB Atlas
                    Vector Search. Ask me anything about appointments, services,
                    POS billing, or account management.
                  </p>
                </div>
                <div className="w-full pt-1 border-t border-gray-100 flex items-center justify-around text-[11px] text-[#830a48] font-medium">
                  <span className="flex items-center gap-1">
                    ✓ Verified Docs
                  </span>
                  <span className="flex items-center gap-1">
                    ✓ Real-time AI
                  </span>
                  <span className="flex items-center gap-1">
                    ✓ Instant Booking Help
                  </span>
                </div>
              </div>
            )}

            {/* Rendered Conversation Messages */}
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-2.5 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 mt-1 shadow-xs"
                      style={{ backgroundColor: "#830a48" }}
                    >
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] text-sm px-4 py-2.5 rounded-2xl shadow-xs leading-relaxed break-words ${
                      isUser
                        ? "bg-[#ffeef6] text-[#70063c] border border-[#f5c6cb] rounded-tr-xs font-medium"
                        : "bg-white text-gray-800 border border-pink-100/90 rounded-tl-xs"
                    }`}
                  >
                    <FormattedMessage content={message.content} isUser={isUser} />
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center bg-[#ffeef6] border border-[#f5c6cb] text-[#70063c] shrink-0 mt-1 shadow-xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pulsing Loading State ("Thinking...") */}
            {isLoading && (
              <div className="flex items-start gap-2.5 justify-start animate-in fade-in duration-200">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 mt-1 shadow-xs"
                  style={{ backgroundColor: "#830a48" }}
                >
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-pink-100 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center space-x-2 text-xs text-[#830a48]">
                  <div className="flex space-x-1">
                    <span className="w-2 h-2 rounded-full bg-[#830a48] animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 rounded-full bg-[#a2125f] animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 rounded-full bg-[#e2b755] animate-bounce"></span>
                  </div>
                  <span className="font-semibold tracking-wide">
                    SalonBot is thinking...
                  </span>
                </div>
              </div>
            )}

            {/* Error Banner with Retry */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between gap-2 animate-in fade-in">
                <span>{error.message || "An error occurred while connecting to SalonBot."}</span>
                <button
                  type="button"
                  onClick={() => reload()}
                  className="px-2.5 py-1 rounded bg-red-100 hover:bg-red-200 font-semibold text-red-800 shrink-0 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Scroll Anchor */}
            <div ref={messagesEndRef} />
          </main>

          {/* Interactive Suggested Questions Pills */}
          <div className="px-3 pt-2.5 pb-2 bg-[#faf7f9] border-t border-[#f0dce5] shrink-0">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#830a48] mb-1.5">
              <Sparkles className="w-3 h-3 text-[#e2b755]" />
              <span>Suggested Questions</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar">
              {SUGGESTED_QUESTIONS.map((question, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSuggestedClick(question)}
                  className="whitespace-nowrap shrink-0 text-xs px-2.5 py-1.5 rounded-full bg-white hover:bg-[#ffeef6] text-[#70063c] border border-[#e8cbd9] hover:border-[#830a48] shadow-2xs font-medium transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input & Gold Accent Button */}
          <footer className="p-3 bg-white border-t border-gray-100 shrink-0">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="Ask about bookings, services, POS..."
                className="flex-1 px-3.5 py-2.5 text-sm rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#830a48]/50 focus:border-[#830a48] transition-all disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                className="flex items-center justify-center p-2.5 rounded-xl font-bold shadow-sm transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-105"
                style={{
                  backgroundColor: "#e2b755",
                  color: "#4a0427",
                }}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-1.5 text-center">
              <span className="text-[10px] text-gray-400 tracking-tight">
                Powered by SalonSphere RAG • MongoDB Atlas Vector Search
              </span>
            </div>
          </footer>
        </div>
      )}
    </>
  );
}
