"use client";

import { useEffect, useRef, useState } from "react";
import { useRole } from "@/lib/auth/roleContext";
import { Button } from "@/components/common/Button";

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
      setMessages([createMessage("bot", "안녕하세요! 찾고 계신 매물 조건을 자유롭게 말씀해주세요.")]);
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
      setMessages((prev) => [...prev, createMessage("bot", "로그인 후 챗봇을 사용할 수 있습니다.")]);
      return;
    }

    const userMsg = createMessage("user", trimmed);
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await authFetch("/tenant/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "챗봇 응답을 가져오지 못했습니다.");
      }

      const data = await res.json();
      const replyText =
        typeof data?.response === "string"
          ? data.response
          : "응답을 가져오지 못했습니다. 잠시 후 다시 시도해주세요.";
      setMessages((prev) => [...prev, createMessage("bot", replyText)]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        createMessage("bot", err?.message ?? "오류가 발생했습니다. 다시 시도해주세요."),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="z-50 flex flex-col items-end gap-2 md:gap-3"
      style={{
        position: "fixed",
        bottom: "60px",
        right: "60px",
      }}
    >
      {isOpen && (
        <div className="mb-3 flex w-80 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-slate-800 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">매물 챗봇</p>
              <p className="text-xs text-slate-200">의뢰 내용/조건을 입력하면 도와드려요</p>
            </div>
            <button
              className="rounded-full p-1 text-slate-200 transition hover:bg-slate-700 hover:text-white"
              onClick={() => setIsOpen(false)}
              aria-label="chatbot close"
            >
              ✕
            </button>
          </div>

          <div
            ref={viewportRef}
            className="flex h-80 flex-col gap-3 overflow-y-auto bg-slate-50 px-4 py-3"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm shadow-sm ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 bg-white p-3">
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
                placeholder={isLoading ? "응답을 기다리는 중입니다..." : "메시지를 입력하세요"}
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                {isLoading ? "응답 중..." : "전송"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "채팅 닫기" : "채팅 열기"}
        className="relative flex h-20 w-20 items-center justify-center rounded-full border border-black/30 bg-white text-black shadow-xl shadow-black/20 ring-1 ring-black/20 ring-offset-1 ring-offset-white transition hover:-translate-y-0.5 hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-black/30"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100"
            height="100"
            viewBox="0 0 24 24"
            fill="none"
            stroke="black"
            strokeWidth={3}
            className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100"
            height="100"
            viewBox="0 0 24 24"
            fill="none"
            stroke="black"
            strokeWidth={2.4}
            className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          >
            <path
              d="M4.75 5.5A1.75 1.75 0 0 1 6.5 3.75h11A1.75 1.75 0 0 1 19.25 5.5v8.25A1.75 1.75 0 0 1 17.5 15.5H10l-3.3 2.7c-.33.27-.83.04-.83-.38V5.5Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M8.5 9h7M8.5 12h5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </div>
  );
}
