"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Message {
  id: string;
  text: string;
  fromMe: boolean;
  time: string;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_OTHER_USER = {
  name: "user2 user2",
  initial: "U",
  eventName: "นิทรรศการ Spirit Animal",
};

const MOCK_MESSAGES: Message[] = [
  { id: "1", text: "สวัสดีครับ เจอกันในงานนิทรรศการเลย 😄", fromMe: false, time: "10:00" },
  { id: "2", text: "สวัสดีค่ะ ใช่เลย งานนี้สนุกมากเลยนะ", fromMe: true, time: "10:01" },
  { id: "3", text: "ชอบโซนไหนมากที่สุดครับ?", fromMe: false, time: "10:02" },
  { id: "4", text: "ชอบโซนสุดท้ายมากเลยค่ะ บรรยากาศดีมาก", fromMe: true, time: "10:03" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text, fromMe: true, time },
    ]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center  gap-3 border-b border-gray-100 bg-white px-4 pb-3 pt-[calc(env(safe-area-inset-top)+12px)]">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Avatar */}
        <div className="h-9 w-9 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
          <span className="text-rose-500 font-bold text-sm">
            {MOCK_OTHER_USER.initial}
          </span>
        </div>

        {/* Name + event */}
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-semibold text-gray-900 truncate">
            {MOCK_OTHER_USER.name}
          </span>
          <span className="text-[11px] text-gray-400 truncate">
            💬 match จาก {MOCK_OTHER_USER.eventName}
          </span>
        </div>
      </div>

      {/* Messages */}
        {/* <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
            {messages.map((msg) => (
            <div
                key={msg.id}
                className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}
            >
                <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    msg.fromMe
                    ? "rounded-br-sm bg-rose-500 text-white"
                    : "rounded-bl-sm bg-gray-100 text-gray-800"
                }`}
                >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p
                    className={`mt-1 text-[10px] text-right ${
                    msg.fromMe ? "text-rose-200" : "text-gray-400"
                    }`}
                >
                    {msg.time}
                </p>
                </div>
            </div>
            ))}
            <div ref={bottomRef} />
        </div> */}
  <div className="h-[60%] w-full "></div>
      {/* Input */}
      <div className="flex-shrink-0 border-t border-gray-100 bg-white px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)] ">
        <div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2">
          <input
            type="text"
            placeholder="พิมพ์ข้อความ..."
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim()}
            className="text-rose-500 disabled:text-gray-300 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}