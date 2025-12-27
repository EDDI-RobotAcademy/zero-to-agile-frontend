"use client";

import { useEffect, useRef, useState } from "react";
import { useRole } from "@/lib/auth/roleContext";

type Message = {
  id: string;
  sender: "bot" | "user";
  text: string;
};

function createMessage(sender: Message["sender"], text: string): Message {
  return { id: `${sender}-${Date.now()}-${Math.random()}`, sender, text };
}

export function ChatbotWidget() {
  const { isAuthenticated, authFetch } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (messages.length === 0) {
      setMessages([
        createMessage(
          "bot",
          "안녕하세요! 이 매물에 대해 궁금한 점이 있으신가요?",
        ),
      ]);
    }
  }, [isOpen, messages.length]);

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
        createMessage("bot", "챗봇을 사용하려면 로그인해 주세요."),
      ]);
      return;
    }

    const userMsg = createMessage("user", trimmed);
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await authFetch("/finder/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "챗봇 요청에 실패했습니다.");
      }

      const data = await res.json();
      const replyText =
        typeof data?.response === "string"
          ? data.response
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
          <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-sky-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <p className="text-base font-bold text-white">AI 파인더 챗봇</p>
                  <p className="text-xs text-blue-100">
                    궁금한 점을 편하게 물어보세요
                  </p>
                </div>
              </div>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
                onClick={() => setIsOpen(false)}
                aria-label="챗봇 닫기"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
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
                  <div className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-md">
                    <span className="text-base">🤖</span>
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md ${
                    msg.sender === "user"
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 font-medium text-white"
                      : "border-2 border-blue-100 bg-white font-medium text-slate-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-md">
                  <span className="text-base">🤖</span>
                </div>
                <div className="max-w-[75%] rounded-2xl border-2 border-blue-100 bg-white px-4 py-3">
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
          <div className="border-t-2 border-blue-100 bg-white p-4">
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
                className="flex-1 rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md transition hover:from-blue-700 hover:to-blue-800 disabled:from-slate-300 disabled:to-slate-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
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
        className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 shadow-2xl shadow-blue-500/50 ring-2 ring-blue-400/50 ring-offset-2 ring-offset-white transition hover:scale-110 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-600/60 focus:outline-none focus:ring-4 focus:ring-blue-400/50"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <span className="text-3xl group-hover:scale-110 transition">🤖</span>
        </div>
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
