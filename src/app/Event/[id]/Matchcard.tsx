// components/MatchCard.tsx
import { useRef, useState } from "react";
import { Heart, X } from "lucide-react";

type MatchAttendee = {
  id: string;
  name: string;
  occupation?: string | null;
  district?: string | null;
  joinedAt?: string;
  avatar?: string;
};

const SWIPE_THRESHOLD = 100; // ลากเกินกี่ px ถึงถือว่า swipe สำเร็จ
const FLY_OUT_DISTANCE = 500; // ระยะที่การ์ดบินออกจอตอนปล่อย/ตัดสินผล

export default function MatchCard({
  attendee,
  onLike,
  onPass,
}: {
  attendee: MatchAttendee;
  onLike: () => void;
  onPass: () => void;
}) {
  // ตำแหน่งลากปัจจุบัน (x, y) และสถานะกำลังลากอยู่ไหม
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  // ทิศที่ตัดสินใจแล้ว ใช้เล่น animation บินออกจอก่อนเรียก callback จริง
  const [exiting, setExiting] = useState<"like" | "pass" | null>(null);

  const startPos = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const getPoint = (e: React.PointerEvent) => ({ x: e.clientX, y: e.clientY });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (exiting) return; // กันลากซ้ำตอนกำลังเล่น exit animation
    setIsDragging(true);
    startPos.current = getPoint(e);
    cardRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || exiting) return;
    const point = getPoint(e);
    setDrag({
      x: point.x - startPos.current.x,
      y: point.y - startPos.current.y,
    });
  };

  const finishSwipe = (direction: "like" | "pass") => {
    setExiting(direction);
    // เล่น animation บินออกจอก่อน แล้วค่อยเรียก callback จริงตอนจบ transition
    const flyX = direction === "like" ? FLY_OUT_DISTANCE : -FLY_OUT_DISTANCE;
    setDrag({ x: flyX, y: drag.y });
  };

  const handlePointerUp = () => {
    if (!isDragging || exiting) return;
    setIsDragging(false);

    if (drag.x > SWIPE_THRESHOLD) {
      finishSwipe("like");
    } else if (drag.x < -SWIPE_THRESHOLD) {
      finishSwipe("pass");
    } else {
      // ลากไม่พอ ดีดกลับตำแหน่งเดิม
      setDrag({ x: 0, y: 0 });
    }
  };

  const handleTransitionEnd = () => {
    if (exiting === "like") onLike();
    if (exiting === "pass") onPass();
  };

  // ปุ่มกด: เล่น animation บินออกฝั่งเดียวกับปุ่มที่กด เพื่อความรู้สึกต่อเนื่องกับ swipe
  const handleButtonLike = () => finishSwipe("like");
  const handleButtonPass = () => finishSwipe("pass");

  const rotation = drag.x / 12; // ยิ่งลากไกล ยิ่งเอียงมาก
  const opacity = exiting ? 0 : 1;
  const likeOpacity = Math.min(Math.max(drag.x / SWIPE_THRESHOLD, 0), 1);
  const nopeOpacity = Math.min(Math.max(-drag.x / SWIPE_THRESHOLD, 0), 1);

  return (
    <div className="flex flex-col items-center">
      {/* การ์ดที่ลากได้ */}
      <div
        ref={cardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onTransitionEnd={handleTransitionEnd}
        className="relative cursor-grab touch-none select-none active:cursor-grabbing"
        style={{
          transform: `translate(${drag.x}px, ${drag.y}px) rotate(${rotation}deg)`,
          opacity,
          transition: isDragging
            ? "none"
            : "transform 0.35s ease, opacity 0.35s ease",
        }}
      >
        <img
          src={attendee.avatar || "https://i.pravatar.cc/150?img=47"}
          alt={attendee.name}
          className="size-64 rounded-lg border-4 object-cover"
          draggable={false}
        />

        {/* ป้าย LIKE - โผล่ตอนลากไปทางขวา */}
        <div
          className="absolute -right-1 top-2 rotate-[-12deg] rounded-lg border-3 border-emerald-500 px-2.5 py-1 text-sm font-extrabold tracking-wide text-emerald-500"
          style={{ opacity: likeOpacity }}
        >
          LIKE
        </div>

        {/* ป้าย NOPE - โผล่ตอนลากไปทางซ้าย */}
        <div
          className="absolute -left-2 top-2 rotate-[12deg] rounded-lg border-3 border-rose-500 px-2.5 py-1 text-sm font-extrabold tracking-wide text-rose-500"
          style={{ opacity: nopeOpacity }}
        >
          NOPE
        </div>
      </div>

      <h2 className="mt-4 text-lg font-bold text-gray-900">{attendee.name}</h2>

      <p className="mt-1 text-xs text-gray-400">ลากการ์ดซ้าย/ขวา หรือกดปุ่มด้านล่าง</p>

      {/* Buttons - ยังกดได้เหมือนเดิม เป็นทางเลือกเสริมจาก swipe */}
      <div className="mt-6 flex gap-6">
        <button
          onClick={handleButtonPass}
          className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-200 bg-white shadow-md transition-transform active:scale-95"
          aria-label="ผ่าน"
        >
          <X size={28} className="text-gray-400" />
        </button>
        <button
          onClick={handleButtonLike}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500 shadow-md shadow-rose-200 transition-transform active:scale-95"
          aria-label="ชอบ"
        >
          <Heart size={28} className="fill-white text-white" />
        </button>
      </div>
    </div>
  );
}