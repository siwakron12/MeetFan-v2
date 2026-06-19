"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Match {
  id: string;
  event: {
    id: string;
    title: string;
    imageUrl: string;
  };
  otherUser: {
    id: string;
    name: string;
    occupation: string | null;
    district: string | null;
  };
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "เมื่อกี้";
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  if (hours < 24) return `${hours} ชม.ที่แล้ว`;
  if (days === 1) return "เมื่อวาน";
  return `${days} วันที่แล้ว`;
}

function getInitial(name: string) {
  return name?.charAt(0)?.toUpperCase() ?? "?";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ChatList() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadMatches() {
      try {
        const res = await fetch("/api/users/me/matches");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "โหลดข้อมูลไม่สำเร็จ");
        setMatches(data.matches ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      } finally {
        setIsLoading(false);
      }
    }
    loadMatches();
  }, []);

  const filtered = matches.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.otherUser.name.toLowerCase().includes(q) ||
      m.event.title.toLowerCase().includes(q)
    );
  });

  // แบ่ง "ใหม่" = match ภายใน 24 ชม.
  const newMatches = filtered.filter(
    (m) => Date.now() - new Date(m.createdAt).getTime() < 86400000
  );
  const conversations = filtered;

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-100 bg-white px-4 pb-3 pt-[calc(env(safe-area-inset-top)+12px)]">
        <h1 className="text-lg font-bold text-gray-900">แชท</h1>
        <div className="mt-3 flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5">
          <Search size={16} className="shrink-0 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ หรือ event..."
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center py-16">
            <Loader2 size={24} className="animate-spin text-rose-400" />
            <p className="mt-3 text-sm text-gray-400">กำลังโหลด...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-16">
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <p className="text-sm text-gray-400">ยังไม่มีแมทเลย</p>
            <p className="mt-1 text-xs text-gray-300">ลองกดปัดในงานที่เข้าร่วมดูนะ</p>
          </div>
        ) : (
          <>
            {/* ---------------- New Matches ---------------- */}
            {newMatches.length > 0 && (
              <div className="border-b border-gray-100 py-4">
                <div className="flex items-center justify-between px-4">
                  <h2 className="text-sm font-semibold text-gray-900">แมทใหม่</h2>
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-600">
                    {newMatches.length}
                  </span>
                </div>

                <div className="mt-3 flex gap-4 overflow-x-auto px-4 scrollbar-hide">
                  {newMatches.map((match) => (
                    <button
                      key={match.id}
                      type="button"
                      onClick={() => router.push(`/chat/${match.id}`)}
                      className="flex w-16 flex-shrink-0 flex-col items-center gap-1.5"
                    >
                      <div className="relative">
                        <div className="h-16 w-16 m-2 rounded-full ring-2 ring-rose-500 ring-offset-2 ring-offset-white flex items-center justify-center bg-rose-100">
                          <span className="text-rose-500 font-bold text-xl">
                            {getInitial(match.otherUser.name)}
                          </span>
                        </div>
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-semibold text-white shadow">
                          ใหม่
                        </span>
                      </div>
                      <span className="w-full truncate text-center text-xs font-medium text-gray-700 mt-1">
                        {match.otherUser.name.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ---------------- Conversations ---------------- */}
            <div className="px-2 py-2">
              <h2 className="px-3 py-1 text-sm font-semibold text-gray-900">ข้อความ</h2>

              <div className="flex flex-col">
                {conversations.map((match) => (
                  <button
                    key={match.id}
                    type="button"
                    onClick={() => router.push(`/chat/${match.id}`)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
                  >
                    {/* Avatar */}
                    <div className="shrink-0 h-14 w-14 rounded-full bg-rose-100 flex items-center justify-center">
                      <span className="text-rose-400 font-bold text-xl">
                        {getInitial(match.otherUser.name)}
                      </span>
                    </div>

                    {/* Text */}
                    <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-gray-800">
                          {match.otherUser.name}
                        </span>
                        <span className="shrink-0 text-[11px] text-gray-400">
                          {timeAgo(match.createdAt)}
                        </span>
                      </div>

                      <span className="truncate text-[11px] text-gray-400">
                        💬 match จาก {match.event.title}
                      </span>

                      {match.otherUser.occupation || match.otherUser.district ? (
                        <span className="truncate text-xs text-gray-400">
                          {[match.otherUser.occupation, match.otherUser.district]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      ) : (
                        <span className="truncate text-xs text-gray-300 italic">
                          เริ่มบทสนทนากันเลย!
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}