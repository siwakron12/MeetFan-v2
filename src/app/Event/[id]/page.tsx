"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  Check,
  Heart,
} from "lucide-react";
import MatchModal from "./MatchModal";
import { useAuth } from "@/components/AuthProvider";

interface EventParticipant {
  id: string;
  name: string;
  occupation: string | null;
  district: string | null;
  joinedAt: string;
  avatar: string;
  isMe: boolean;
}

function formatJoinedAt(joinedAt: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(joinedAt));
}

export default function EventAttendees({ onClose }: any) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const params = useParams();
  const eventId = params.id as string;
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showMatch, setShowMatch] = useState(false);
  // แสดง grid ผู้เข้าร่วมก็ต่อเมื่อเคยกดปุ่มจับคู่แล้วเท่านั้น
  const [hasOpenedMatch, setHasOpenedMatch] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}`);
        const data = await res.json();
        setEvent(data.event);
      } catch (err) {
        console.error("FETCH ERROR:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  useEffect(() => {
    let isActive = true;
    async function loadParticipants() {
      try {
        setIsLoadingParticipants(true);
        setLoadError("");
        const response = await fetch(`/api/events/${eventId}/participants`, {
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "ไม่สามารถโหลดผู้เข้าร่วมได้");
        if (isActive) {
          setParticipants(
            (data.participants ?? []).map((participant: any) => ({
              ...participant,
              avatar: `https://i.pravatar.cc/150?u=${participant.id}`,
              isMe: Boolean(user?.id && participant.id === user.id),
            }))
          );
        }
      } catch (error) {
        if (isActive) {
          setLoadError(error instanceof Error ? error.message : "ไม่สามารถโหลดผู้เข้าร่วมได้");
        }
      } finally {
        if (isActive) setIsLoadingParticipants(false);
      }
    }
    void loadParticipants();
    return () => { isActive = false; };
  }, [eventId, user?.id]);

  const handleBack = () => {
    if (onClose) onClose();
    else router.back();
  };

  const handleOpenMatch = () => {
    setHasOpenedMatch(true);
    setShowMatch(true);
  };

  const others = useMemo(
    () => participants.filter((p) => !p.isMe),
    [participants]
  );

  if (isAuthLoading || isLoadingParticipants) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-500">
        กำลังโหลดผู้เข้าร่วม...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50 px-6 text-center">
        <p className="text-sm font-semibold text-gray-900">โหลดข้อมูลไม่สำเร็จ</p>
        <p className="text-sm text-gray-500">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Hero */}
      <div className="relative h-122 w-fit lg:w-full mx-auto">
        <img
          src={event?.imageUrl}
          alt={event?.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.6),rgba(0,0,0,0.1),transparent)]" />

        <button
          onClick={handleBack}
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow"
        >
          <ArrowLeft size={18} className="text-gray-700" />
        </button>

        <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 shadow">
          <Check size={13} className="text-white" />
          <span className="text-xs font-semibold text-white">เข้าร่วมแล้ว</span>
        </div>

        <div className="absolute bottom-4 text-white left-4 right-4">
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-sm">
            {event?.category}
          </span>
          <h1 className="mt-1.5 text-lg font-bold leading-snug drop-shadow">
            {event?.title}
          </h1>
        </div>
      </div>

      {/* Meta info */}
      <div className="bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-1.5 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <CalendarDays size={15} className="text-gray-400" />
            <span>{event?.date}</span>
            <span>{event?.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={15} className="text-gray-400" />
            <span>{event?.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={15} className="text-gray-400" />
            <span>ผู้เข้าร่วม {participants.length} คน</span>
          </div>
        </div>
      </div>

      {/* Match CTA */}
      <div className="mx-4 mt-4">
        <button
          onClick={handleOpenMatch}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-500 py-4 shadow-md shadow-rose-200 transition-transform active:scale-[0.98]"
        >
          <Heart size={18} className="fill-white text-white" />
          <span className="text-sm font-bold text-white">จับคู่กับคนในงาน</span>
          <span className="ml-1 rounded-full bg-white/25 px-2 py-0.5 text-xs font-semibold text-white">
            {others.length} คน
          </span>
        </button>
      </div>

      {/* Participants grid — แสดงหลังจากเคยกดปุ่มจับคู่แล้วเท่านั้น */}
      {hasOpenedMatch && (
        <div className="mx-4 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Users size={15} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">ผู้เข้าร่วมกิจกรรม</h2>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
              {participants.length}
            </span>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="grid grid-cols-4 gap-3">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex flex-col items-center gap-1.5 text-center"
                >
                  <div className="relative">
                    <img
                      src={participant.avatar}
                      alt={participant.name}
                      className={`h-16 w-16 rounded-full border-2 object-cover ${
                        participant.isMe ? "border-rose-400" : "border-gray-100"
                      }`}
                    />
                    {participant.isMe && (
                      <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 ring-2 ring-white">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-semibold ${
                      participant.isMe ? "text-rose-500" : "text-gray-600"
                    }`}
                  >
                    {participant.isMe ? "คุณ" : participant.name}
                  </span>
                  {participant.district && (
                    <span className="text-[10px] text-gray-400">
                      {participant.district}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-500">
                    {formatJoinedAt(participant.joinedAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom padding */}
      <div className="h-8" />

      {/* Match Modal */}
      {showMatch && (
        <MatchModal eventId={eventId} onClose={() => setShowMatch(false)} />
      )}
    </div>
  );
}