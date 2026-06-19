// components/MatchModal.tsx
import { useEffect, useState } from "react";
import MatchCard from "./Matchcard";
import { Heart, Sparkles, X, Loader2 } from "lucide-react";
import Link from "next/link";
type MatchCandidate = {
  id: string;
  name: string;
  occupation?: string | null;
  district?: string | null;
  joinedAt?: string;
  avatar?: string;
};

type SwipeResult = {
  liked: boolean;
  matched: boolean;
  match?: {
    id: string;
    event: { id: string; title: string; imageUrl: string };
    userA: { id: string; name: string };
    userB: { id: string; name: string };
  };
};

export default function MatchModal({
  eventId,
  onClose,
}: {
  eventId: string;
  onClose: () => void;
}) {
  // ---------------------------------------------------------------------
  // โหลดรายชื่อ candidate จาก backend ตอนเปิด modal
  // ---------------------------------------------------------------------
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState<string[]>([]);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedUserName, setMatchedUserName] = useState<string>("");

  // ป้องกันกดรัว ๆ ระหว่างรอ API ตอบ (เช่น double-tap like)
  const [isSwiping, setIsSwiping] = useState(false);

  const current = candidates[index];
  const isDone = !isLoading && index >= candidates.length;

  useEffect(() => {
    let cancelled = false;

    async function loadCandidates() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const res = await fetch(`/api/events/${eventId}/matches`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "โหลดรายชื่อไม่สำเร็จ");
        }

        if (!cancelled) {
          setCandidates(data.candidates ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : "เกิดข้อผิดพลาด"
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadCandidates();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  // ---------------------------------------------------------------------
  // ส่ง swipe จริงไป backend แล้วเช็คผล mutual match จาก response
  // ---------------------------------------------------------------------
  const sendSwipe = async (toUserId: string, isLike: boolean) => {
    const res = await fetch(`/api/events/${eventId}/matches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId, liked: isLike }),
    });

    const data: SwipeResult & { message?: string } = await res.json();
    console.log("SWIPE RESULT:", data);
    if (!res.ok) {
      throw new Error(data?.message || "บันทึกการปัดไม่สำเร็จ");
    }

    return data;
  };

  const handleLike = async () => {
    if (!current || isSwiping) return;
    setIsSwiping(true);

    try {
      const result = await sendSwipe(current.id, true);
      setLiked((prev) => [...prev, current.id]);

      if (result.matched) {
        setMatchedUserName(current.name);
        setShowMatch(true);
      } else {
        setIndex((i) => i + 1);
      }
    } catch (err) {
      // เทาๆ ไว้ก่อน: แจ้ง error แบบเบา ๆ ไม่บัง flow การปัด
      alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
    } finally {
      setIsSwiping(false);
    }
  };

  const handlePass = async () => {
    if (!current || isSwiping) return;
    setIsSwiping(true);

    try {
      await sendSwipe(current.id, false);
      setIndex((i) => i + 1);
    } catch (err) {
      alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
    } finally {
      setIsSwiping(false);
    }
  };

  const handleMatchNext = () => {
    setShowMatch(false);
    setIndex((i) => i + 1);
  };

  return (
    <div
      className="fixed inset-0 z-1200 flex items-center justify-center bg-black/40 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[88vh] w-full max-w-sm flex-col overflow-hidden rounded-3xl bg-white px-6 pb-8 pt-6 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">จับคู่ในงาน</h3>
          <button onClick={onClose} className="text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* Progress dots - แสดงเฉพาะตอนโหลดเสร็จแล้วและยังไม่ done */}
        {!isLoading && !isDone && candidates.length > 0 && (
          <div className="mb-6 flex justify-center gap-1.5">
            {candidates.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i < index
                    ? "w-3 bg-rose-300"
                    : i === index
                      ? "w-5 bg-rose-500"
                      : "w-3 bg-gray-200"
                }`}
              />
            ))}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          /* Loading state */
          <div className="flex flex-col items-center py-12">
            <Loader2 size={28} className="animate-spin text-rose-400" />
            <p className="mt-3 text-sm text-gray-400">กำลังโหลดรายชื่อ...</p>
          </div>
        ) : loadError ? (
          /* Error state */
          <div className="flex flex-col items-center py-12">
            <p className="text-sm text-gray-500">{loadError}</p>
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-full bg-rose-500 py-3 text-sm font-semibold text-white"
            >
              ปิด
            </button>
          </div>
        ) : showMatch ? (
          /* Match! screen */
          <div className="flex flex-col items-center py-4">
            <div className="flex -space-x-4">
              <img
                src="https://i.pravatar.cc/150?img=47"
                className="h-24 w-24 rounded-full border-4 border-white object-cover"
                alt="me"
              />
              <img
                src={current?.avatar}
                className="h-24 w-24 rounded-full border-4 border-rose-100 object-cover"
                alt={matchedUserName}
              />
            </div>
            <div className="mt-5 flex items-center gap-2">
              <Sparkles size={18} className="text-rose-500" />
              <span className="text-lg font-bold text-rose-500">
                It&apos;s a Match!
              </span>
              <Sparkles size={18} className="text-rose-500" />
            </div>
            <p className="mt-2 text-center text-sm text-gray-500">
              คุณและ{matchedUserName} ต่างชื่นชอบกัน
              <br />
              เริ่มคุยกันได้เลย!
            </p>
            <Link href={`/chat`} className="mt-6 w-full rounded-full bg-rose-500 py-3 text-sm text-center font-semibold  shadow-md shadow-rose-200">
              <p className="text-white">ส่งข้อความหา{matchedUserName}</p>
            </Link>
            <button
              onClick={handleMatchNext}
              className="mt-3 w-full rounded-full border border-gray-200 py-3 text-sm font-semibold text-gray-600"
            >
              ดูคนต่อไป
            </button>
          </div>
        ) : isDone ? (
          /* Done screen */
          <div className="flex flex-col items-center py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
              <Heart size={28} className="fill-rose-400 text-rose-400" />
            </div>
            <p className="mt-4 text-base font-semibold text-gray-900">
              ดูครบทุกคนแล้ว!
            </p>
            <p className="mt-1 text-sm text-gray-400">
              ชอบ {liked.length} คน จาก {candidates.length} คน
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-full bg-rose-500 py-3 text-sm font-semibold text-white"
            >
              กลับ
            </button>
          </div>
        ) : candidates.length === 0 ? (
          /* ไม่มีผู้เข้าร่วมคนอื่นให้ swipe เลย */
          <div className="flex flex-col items-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
              <Heart size={28} className="text-gray-300" />
            </div>
            <p className="mt-4 text-sm text-gray-500 text-center">
              ยังไม่มีผู้เข้าร่วมคนอื่นให้จับคู่ในขณะนี้
              <br />
              รอเพื่อนใหม่เข้าร่วม event นี้เพิ่มเติม
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-full bg-rose-500 py-3 text-sm font-semibold text-white"
            >
              กลับ
            </button>
          </div>
        ) : (
          <MatchCard
            attendee={current}
            onLike={handleLike}
            onPass={handlePass}
          />
        )}
      </div>
    </div>
  );
}