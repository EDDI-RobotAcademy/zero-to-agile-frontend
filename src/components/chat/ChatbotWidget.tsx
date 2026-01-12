"use client";

import { useEffect, useRef, useState } from "react";
import { useRole } from "@/lib/auth/roleContext";
import { Bot, Send, X, MessageSquare } from "lucide-react";

type Message = {
  id: string;
  sender: "bot" | "user";
  text: string;
};

function createMessage(sender: Message["sender"], text: string): Message {
  return { id: `${sender}-${Date.now()}-${Math.random()}`, sender, text };
}

export function ChatbotWidget({ listing }: { listing: any }) {
  const { isAuthenticated, authFetch } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const storageKey = listing?.id ? `chatbot:listing:${listing.id}` : null;

  useEffect(() => {
    if (!isOpen) return;
    if (!storageKey) {
      setMessages([
        createMessage(
          "bot",
          "안녕하세요! 이 매물에 대해 궁금한 점이 있으신가요?",
        ),
      ]);
      return;
    }
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setMessages(parsed as Message[]);
          return;
        }
      } catch {
        // Ignore invalid cache data.
      }
    }
    setMessages([
      createMessage(
        "bot",
        "안녕하세요! 이 매물에 대해 궁금한 점이 있으신가요?",
      ),
    ]);
  }, [isOpen, storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    if (messages.length === 0) return;
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollTop = viewport.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    if (!isAuthenticated) {
      setMessages((prev) => [
        ...prev,
        createMessage("bot", "로그인 후 이용해주세요."),
      ]);
      return;
    }

    const userMsg = createMessage("user", trimmed);
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
    const res = await authFetch("/chatbot/prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listing, userPrompt: trimmed }),
    });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "챗봇 요청에 실패했습니다.");
      }

    const data = await res.json();
    const replyText =
      typeof data?.answer === "string"
        ? data.answer
        : "응답을 해석하지 못했습니다.";
      setMessages((prev) => [...prev, createMessage("bot", replyText)]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        createMessage("bot", err?.message ?? "문제가 발생했습니다."),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="z-50 flex flex-col items-end gap-3"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
      }}
    >
      {isOpen && (
        <div className="mb-2 flex w-96 flex-col overflow-hidden rounded-3xl border-2 border-blue-100 bg-white shadow-2xl ring-1 ring-slate-200">
          {/* 헤더 */}
          <div className="bg-gradient-to-br from-blue-100 via-white to-blue-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                  <Bot className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">AI 파인더 챗봇</p>
                  <p className="text-xs text-slate-500">
                    궁금한 점을 편하게 물어보세요
                  </p>
                </div>
              </div>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 active:scale-95"
                onClick={() => setIsOpen(false)}
                aria-label="챗봇 닫기"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 메시지 영역 */}
          <div
            ref={viewportRef}
            className="flex h-96 flex-col gap-3 overflow-y-auto bg-gradient-to-b from-slate-50 to-blue-50/30 px-5 py-4"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <div className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <Bot className="h-5 w-5 text-blue-600" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    msg.sender === "user"
                      ? "bg-blue-600 font-medium text-white"
                      : "border border-slate-200 bg-white font-medium text-slate-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>
                <div className="max-w-[75%] rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: "0ms" }}></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: "150ms" }}></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 입력 영역 */}
          <div className="border-t border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                disabled={isLoading}
                placeholder={
                  isLoading ? "답변을 작성 중이에요..." : "메시지를 입력하세요..."
                }
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:bg-slate-300"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 플로팅 버튼 */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "챗봇 닫기" : "챗봇 열기"}
        className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 shadow-xl shadow-blue-500/30 ring-2 ring-blue-400/30 ring-offset-2 ring-offset-white transition hover:scale-110 hover:bg-blue-700 hover:shadow-blue-600/40 active:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-400/50"
      >
        <Bot className="h-8 w-8 text-white transition group-hover:scale-110" />
        {!isOpen && (
          <div className="absolute -top-12 right-0 whitespace-nowrap rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100">
            AI 챗봇과 대화하기
            <div className="absolute -bottom-1 right-4 h-2 w-2 rotate-45 bg-slate-800"></div>
          </div>
        )}
      </button>
    </div>
  );
}
