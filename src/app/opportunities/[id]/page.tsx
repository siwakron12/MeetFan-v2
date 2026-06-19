"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ImageIcon,
  MapPin,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import {
  EMPTY_OPPORTUNITY_PROFILE,
  ProfileInfo,
  getMatchDetails,
  getOpportunityById,
} from "@/services/opportunity-service";

export default function OpportunityDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileInfo>(EMPTY_OPPORTUNITY_PROFILE);
  const [isJoining, setIsJoining] = useState(false);
  const [joinMessage, setJoinMessage] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const opportunity = getOpportunityById(params.id);

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      if (!user) {
        setProfile(EMPTY_OPPORTUNITY_PROFILE);
        return;
      }

      const response = await fetch("/api/users/me/profile", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));

      if (isActive && data.profile) {
        setProfile({
          occupation: data.profile.occupation ?? null,
          interests: Array.isArray(data.profile.interests) ? data.profile.interests : [],
          goals: Array.isArray(data.profile.goals) ? data.profile.goals : [],
        });
      }
    }

    void loadProfile();

    return () => {
      isActive = false;
    };
  }, [user]);

  const match = useMemo(() => {
    return opportunity ? getMatchDetails(opportunity, profile) : null;
  }, [opportunity, profile]);

  function handleJoinClick() {
  if (!opportunity) return;
  setJoinMessage(null);
  setShowConfirm(true);
}

 async function handleConfirmJoin() {
  if (!opportunity) return;

  if (!opportunity.relatedEventId) {
    router.push("/Event");
    return;
  }

  if (!user) {
    router.push(`/login?eventId=${encodeURIComponent(opportunity.relatedEventId)}`);
    return;
  }

  setIsJoining(true);
  setJoinMessage(null);

  try {
    const response = await fetch(`/api/events/${opportunity.relatedEventId}/join`, {
      method: "POST",
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) {
        router.push(`/login?eventId=${encodeURIComponent(opportunity.relatedEventId)}`);
        return;
      }

      setJoinMessage(data.message || "ไม่สามารถเข้าร่วมกิจกรรมนี้ได้ ลองใหม่อีกครั้ง");
      return;
    }

    setShowConfirm(false);
    router.push(`/Event/${opportunity.relatedEventId}`);
  } finally {
    setIsJoining(false);
  }
}

  if (!opportunity || !match) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        <Link
          href="/opportunities"
          className="inline-flex items-center gap-2 text-sm font-semibold text-rose-500"
        >
          <ArrowLeft size={16} />
          กลับไปหน้าแนะนำ
        </Link>
        <div className="mt-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h1 className="text-lg font-bold text-gray-900">ไม่พบกิจกรรมที่แนะนำ</h1>
          <p className="mt-2 text-sm text-gray-500">
            กิจกรรมนี้อาจถูกลบหรือไม่พร้อมให้เข้าร่วมแล้ว
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-5">
      <Link
        href="/opportunities"
        className="inline-flex items-center gap-2 text-sm font-semibold text-rose-500"
      >
        <ArrowLeft size={16} />
        กลับไปหน้าแนะนำ
      </Link>

      <section className="mt-4 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {/* Mock event banner image */}
        <div className="relative flex h-40 w-full items-center justify-center bg-gradient-to-br from-rose-200 to-orange-100 sm:h-52">
          <ImageIcon size={36} className="text-white/80" strokeWidth={1.5} />
          <span className="absolute left-4 top-4 rounded-full bg-rose-500 px-3 py-1 text-sm font-bold text-white shadow-sm">
            {match.matchScore}% ตรงกับความสนใจ
          </span>
          <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
            {opportunity.category}
          </span>
        </div>

        <div className="p-5">
          <h1 className="text-2xl font-bold leading-tight text-gray-900">
            {opportunity.title}
          </h1>

          <div className="mt-4 grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="shrink-0 text-rose-500" />
              <span>{opportunity.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} className="shrink-0 text-rose-500" />
              <span>{opportunity.organizer}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="shrink-0 text-rose-500" />
              <span>{opportunity.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <BriefcaseBusiness size={16} className="shrink-0 text-rose-500" />
              <span>{opportunity.category}</span>
            </div>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-gray-600">
            {opportunity.description}
          </p>

          <button
            type="button"
            onClick={handleJoinClick}
            disabled={isJoining}
            className="mt-5 w-full rounded-full bg-rose-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-rose-300"
          >
            {isJoining ? "กำลังเข้าร่วม..." : "เข้าร่วมกิจกรรม"}
          </button>

          {joinMessage && !showConfirm && (
            <p className="mt-3 text-center text-sm font-medium text-rose-500">
              {joinMessage}
            </p>
          )}
        </div>
      </section>

      <section className="mt-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-gray-900">ทำไมถึงแนะนำกิจกรรมนี้ให้คุณ</h2>
        <p className="mt-1 text-sm text-gray-500">
          มาจากความสนใจที่ตรงกัน และคนที่คล้ายคุณก็เข้าร่วมด้วย
        </p>
        <div className="mt-3 grid gap-2">
          {match.reasons.length > 0 ? (
            match.reasons.map((reason) => (
              <div key={reason} className="flex items-center gap-2 text-sm text-gray-700">
                <Check size={16} className="shrink-0 text-emerald-500" />
                <span>{reason}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">
              กรอกข้อมูลโปรไฟล์ให้ครบ เพื่อดูเหตุผลการแนะนำที่ตรงกับคุณมากขึ้น
            </p>
          )}
        </div>
      </section>

      <section className="mt-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-gray-900">รายละเอียดคะแนนความสนใจ</h2>
        <div className="mt-3 grid gap-2">
          {match.breakdown.map((item, index) => (
            <div
              key={`${item.label}-${item.points}-${index}`}
              className="flex items-center gap-3 text-sm text-gray-600"
            >
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              <span className="h-px flex-1 bg-gray-100" />
              <span className="font-bold text-gray-900">+{item.points}</span>
            </div>
          ))}
          <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
            <span className="font-bold text-gray-900">คะแนนความสนใจรวม</span>
            <span className="font-bold text-rose-500">{match.matchScore}%</span>
          </div>
        </div>
      </section>

      {/* Join confirmation modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 px-6"
          onClick={() => !isJoining && setShowConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h3 className="text-base font-bold text-gray-900">ยืนยันการเข้าร่วม</h3>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={isJoining}
                className="text-gray-400 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-3 flex gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-rose-200 to-orange-100">
                <ImageIcon size={20} className="text-white/80" strokeWidth={1.75} />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold leading-snug text-gray-900">
                  {opportunity.title}
                </p>
                <p className="text-xs text-gray-500">{opportunity.date}</p>
                <p className="text-xs text-gray-500">{opportunity.location}</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              เมื่อกดยืนยัน คุณจะเข้าร่วมกิจกรรมนี้
              และสามารถดูผู้เข้าร่วมคนอื่นเพื่อจับคู่ได้
            </p>

            {joinMessage && (
              <p className="mt-3 text-xs font-medium text-rose-500">{joinMessage}</p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={isJoining}
                className="flex-1 rounded-full border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmJoin}
                disabled={isJoining}
                className="flex-1 rounded-full bg-rose-500 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-rose-300"
              >
                {isJoining ? "กำลังเข้าร่วม..." : "ยืนยัน"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}