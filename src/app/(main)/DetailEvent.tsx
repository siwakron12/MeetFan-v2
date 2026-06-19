"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Check, Globe, MapPin, Users, X } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { calculateInterestMatch } from "@/services/interest-match";

interface ApiEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  imageUrl: string;
  posterPng?: string;
  poster_png?: string;
  location: string;
  eventDate: string;
  date?: string;
  time?: string;
  organizer?: string;
  attendeeCount: number;
  joined: boolean;
}

interface DetailEventProps {
  onClose?: () => void;
  eventId: string;
}

interface ProfilePayload {
  interests: string[];
}

function formatDate(event: ApiEvent) {
  const label = [event.date, event.time].filter(Boolean).join(" · ");
  return label || new Date(event.eventDate).toLocaleDateString("th-TH");
}

function getEventPoster(event: ApiEvent) {
  return event.poster_png || event.posterPng || event.imageUrl;
}

function InterestMatchPanel({
  eventTags,
  userInterests,
}: {
  eventTags: string[];
  userInterests: string[];
}) {
  if (userInterests.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 p-3">
        <p className="text-sm font-semibold text-gray-900">
          Complete your profile to get better matches.
        </p>
      </div>
    );
  }

  const match = calculateInterestMatch(userInterests, eventTags);
  const reasons = [...match.reasons, "People with similar interests joined"];

  return (
    <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
        Interest Match
      </p>
      <h2 className="mt-1 text-lg font-bold text-gray-900">
        {match.score}% Interest Match
      </h2>

      {match.matchedTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {match.matchedTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-500"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3">
        <p className="text-sm font-semibold text-gray-900">Why?</p>
        <div className="mt-2 space-y-1.5">
          {reasons.map((reason) => (
            <p key={reason} className="flex items-start gap-2 text-sm text-gray-600">
              <Check size={14} className="mt-0.5 shrink-0 text-emerald-500" />
              <span>{reason}</span>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DetailEvent({ eventId, onClose }: DetailEventProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [profileInterests, setProfileInterests] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadEvent() {
      const response = await fetch(`/api/events/${eventId}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));

      if (isActive) {
        setEvent(data.event ?? null);
      }
    }

    void loadEvent();

    return () => {
      isActive = false;
    };
  }, [eventId, user]);

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      if (!user) {
        setProfileInterests([]);
        return;
      }

      const response = await fetch("/api/users/me/profile", { cache: "no-store" });

      if (!response.ok) {
        if (isActive) setProfileInterests([]);
        return;
      }

      const data = await response.json().catch(() => ({}));
      const profile = data.profile as ProfilePayload | undefined;

      if (isActive) {
        setProfileInterests(Array.isArray(profile?.interests) ? profile.interests : []);
      }
    }

    void loadProfile();

    return () => {
      isActive = false;
    };
  }, [user]);

  const handleClose = () => {
    if (onClose) onClose();
    else router.back();
  };

  const handleJoinClick = () => {
    if (!user) {
      router.push(`/login?eventId=${encodeURIComponent(eventId)}`);
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirmJoin = async () => {
    setIsJoining(true);

    try {
      const response = await fetch(`/api/events/${eventId}/join`, { method: "POST" });

      if (!response.ok) {
        if (response.status === 401) {
          router.push(`/login?eventId=${encodeURIComponent(eventId)}`);
          return;
        }

        throw new Error("Could not join event");
      }

      setEvent((current) =>
        current
          ? { ...current, joined: true, attendeeCount: current.attendeeCount + 1 }
          : current
      );
      setShowConfirm(false);
      onClose?.();
      router.push(`/Event/${eventId}`);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveEvent = async () => {
    setIsLeaving(true);

    try {
      const response = await fetch(`/api/events/${eventId}/join`, { method: "DELETE" });

      if (!response.ok) {
        if (response.status === 401) {
          router.push(`/login?eventId=${encodeURIComponent(eventId)}`);
        }
        return;
      }

      setEvent((current) =>
        current
          ? {
              ...current,
              joined: false,
              attendeeCount: Math.max(0, current.attendeeCount - 1),
            }
          : current
      );
      setShowLeaveConfirm(false);
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/25 sm:p-4"
      onClick={handleClose}
    >
      <div
        className="relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(clickEvent) => clickEvent.stopPropagation()}
      >
        {!event ? (
          <div className="p-6 text-sm text-gray-500">Loading event...</div>
        ) : (
          <>
            <div className="overflow-y-auto">
              <div className="relative w-full bg-rose-50">
                <img
                  src={getEventPoster(event)}
                  alt={event.title}
                  className="h-auto w-full"
                  onError={(error) => {
                    error.currentTarget.style.display = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Close"
                  className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md"
                >
                  <X size={20} className="text-gray-700" />
                </button>
              </div>

              <div className="px-5 pt-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-block rounded-full bg-rose-100 px-3 py-1 text-xs text-rose-600">
                    {event.category}
                  </span>
                  {event.organizer && (
                    <span className="flex items-center gap-1 text-xs font-medium text-blue-500">
                      <Globe size={16} />
                      {event.organizer}
                    </span>
                  )}
                </div>

                <h1 className="mt-2 text-xl font-bold leading-snug text-gray-900">
                  {event.title}
                </h1>

                <div className="mt-3 flex flex-col gap-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <CalendarDays size={16} className="mt-0.5 shrink-0 text-gray-400" />
                    <span>{formatDate(event)}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-gray-400" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users size={16} className="mt-0.5 shrink-0 text-gray-400" />
                    <span>{event.attendeeCount} people joined</span>
                  </div>
                </div>

                <InterestMatchPanel
                  eventTags={event.tags ?? []}
                  userInterests={profileInterests}
                />

                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                  {event.description}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 bg-white px-5 py-3">
              {event.joined ? (
                <button
                  type="button"
                  onClick={() => setShowLeaveConfirm(true)}
                  disabled={isLeaving}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-rose-200 bg-white py-3 text-sm font-semibold text-rose-500"
                >
                  <Check size={16} />
                  {isLeaving ? "Leaving..." : "Leave Event"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleJoinClick}
                  className="w-full rounded-full bg-rose-500 py-3 text-sm font-semibold text-white shadow-md"
                >
                  Join event
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {showConfirm && event && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 px-6"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
            onClick={(clickEvent) => clickEvent.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h3 className="text-base font-bold text-gray-900">Confirm join</h3>
              <button type="button" onClick={() => setShowConfirm(false)} className="text-gray-400">
                <X size={20} />
              </button>
            </div>

            <div className="mt-3 flex gap-3">
              <img
                src={getEventPoster(event)}
                alt={event.title}
                className="h-16 w-16 shrink-0 rounded-lg object-cover"
              />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold leading-snug text-gray-900">
                  {event.title}
                </p>
                <p className="text-xs text-gray-500">{formatDate(event)}</p>
                <p className="text-xs text-gray-500">{event.location}</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              After joining, you can view other attendees and start matching from the event page.
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-full border border-gray-200 py-2.5 text-sm font-semibold text-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmJoin}
                disabled={isJoining}
                className="flex-1 rounded-full bg-rose-500 py-2.5 text-sm font-semibold text-white"
              >
                {isJoining ? "Joining..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLeaveConfirm && event && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 px-6"
          onClick={() => {
            if (!isLeaving) setShowLeaveConfirm(false);
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
            onClick={(clickEvent) => clickEvent.stopPropagation()}
          >
            <h3 className="text-base font-bold text-gray-900">Leave this event?</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              You will be removed from this event and attendees list.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowLeaveConfirm(false)}
                disabled={isLeaving}
                className="flex-1 rounded-full border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLeaveEvent}
                disabled={isLeaving}
                className="flex-1 rounded-full bg-rose-500 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isLeaving ? "Leaving..." : "Leave Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
