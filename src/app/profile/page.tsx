"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import LoginModal from "../(Login)/LoginModal";
import { useAuth } from "@/components/AuthProvider";

interface JoinedEvent {
  id: string;
  title: string;
  location: string;
  eventDate: string;
  joinedAt: string;
  attendeeCount: number;
}

interface ProfileInfo {
  age: number | null;
  district: string | null;
  occupation: string | null;
  interests: string[];
  goals: string[];
}

const NOT_SET = "Not set";
const INTEREST_OPTIONS = [
  "AI",
  "Technology",
  "Startup",
  "Business",
  "Design",
  "Music",
  "Gaming",
  "Sports",
  "Education",
  "Volunteer",
];
const GOAL_OPTIONS = [
  "Networking",
  "Learning",
  "Career Growth",
  "Startup Opportunities",
  "Friends",
  "Volunteer Work",
];
const EMPTY_PROFILE: ProfileInfo = {
  age: null,
  district: null,
  occupation: null,
  interests: [],
  goals: [],
};

function displayProfileLabel(value: string) {
  if (value === "Career Growth") return "Shared Interests";
  if (value === "Startup Opportunities") return "Similar Community";
  if (value === "Volunteer Work") return "Community Activities";
  return value;
}

function ChipList({
  values,
  prominent = false,
}: {
  values: string[];
  prominent?: boolean;
}) {
  if (values.length === 0) {
    return <p className="mt-1 text-sm text-gray-700">{NOT_SET}</p>;
  }

  return (
    <div className={`mt-2 flex flex-wrap ${prominent ? "gap-2" : "gap-1.5"}`}>
      {values.map((value) => (
        <span
          key={value}
          className={
            prominent
              ? "rounded-full bg-rose-500 px-3.5 py-2 text-sm font-bold text-white"
              : "rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-500"
          }
        >
          {displayProfileLabel(value)}
        </span>
      ))}
    </div>
  );
}

function ProfileSettingsForm({
  initialProfile,
  onCancel,
  onSave,
}: {
  initialProfile: ProfileInfo;
  onCancel: () => void;
  onSave: (profile: ProfileInfo) => Promise<void>;
}) {
  const [form, setForm] = useState({
    age: initialProfile.age?.toString() ?? "",
    district: initialProfile.district ?? "",
    occupation: initialProfile.occupation ?? "",
    interests: initialProfile.interests,
    goals: initialProfile.goals,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const toggleSelection = (field: "interests" | "goals", value: string) => {
    setForm((current) => {
      const selected = current[field].includes(value);
      return {
        ...current,
        [field]: selected
          ? current[field].filter((item) => item !== value)
          : [...current[field], value],
      };
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      await onSave({
        age: form.age ? Number(form.age) : null,
        district: form.district.trim() || null,
        occupation: form.occupation.trim() || null,
        interests: form.interests,
        goals: form.goals,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
        <h3 className="text-base font-bold text-gray-900">Interests</h3>
        <p className="mt-1 text-xs font-medium text-gray-500">
          Meet people who enjoy the same things.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((interest) => {
            const selected = form.interests.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleSelection("interests", interest)}
                className={`rounded-full border px-4 py-2 text-sm font-bold ${
                  selected
                    ? "border-rose-500 bg-rose-500 text-white"
                    : "border-white bg-white text-gray-700"
                }`}
              >
                {interest}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900">
          Basic Information
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="text-xs font-medium text-gray-500">Age</span>
            <input
              type="number"
              min={13}
              max={120}
              value={form.age}
              onChange={(event) =>
                setForm((current) => ({ ...current, age: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500">District</span>
            <input
              type="text"
              value={form.district}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  district: event.target.value,
                }))
              }
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500">
              Occupation
            </span>
            <input
              type="text"
              value={form.occupation}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  occupation: event.target.value,
                }))
              }
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900">Goals</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {GOAL_OPTIONS.map((goal) => {
            const selected = form.goals.includes(goal);
            return (
              <button
                key={goal}
                type="button"
                onClick={() => toggleSelection("goals", goal)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  selected
                    ? "border-rose-500 bg-rose-500 text-white"
                    : "border-gray-200 bg-white text-gray-600"
                }`}
              >
                {displayProfileLabel(goal)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-full border border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 rounded-full bg-rose-500 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </form>
  );
}

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [joinedEvents, setJoinedEvents] = useState<JoinedEvent[]>([]);
  const [leavingEventId, setLeavingEventId] = useState<string | null>(null);
  const [confirmingLeaveEventId, setConfirmingLeaveEventId] = useState<string | null>(null);
  const [profileInfo, setProfileInfo] = useState<ProfileInfo>(EMPTY_PROFILE);

  const missingFields = useMemo(() => {
    const missing: string[] = [];
    if (!profileInfo.age) missing.push("Age");
    if (!profileInfo.district) missing.push("District");
    if (!profileInfo.occupation) missing.push("Occupation");
    if (profileInfo.interests.length === 0) missing.push("Interests");
    if (profileInfo.goals.length === 0) missing.push("Goals");
    return missing;
  }, [profileInfo]);

  const completion = Math.round(((5 - missingFields.length) / 5) * 100);

  useEffect(() => {
    let isActive = true;

    async function loadProfileData() {
      if (!user) {
        setJoinedEvents([]);
        setProfileInfo(EMPTY_PROFILE);
        return;
      }

      const [eventsResponse, profileResponse] = await Promise.all([
        fetch("/api/users/me/events", { cache: "no-store" }),
        fetch("/api/users/me/profile", { cache: "no-store" }),
      ]);
      const eventsData = await eventsResponse.json().catch(() => ({}));
      const profileData = await profileResponse.json().catch(() => ({}));

      if (isActive && Array.isArray(eventsData.events)) {
        setJoinedEvents(eventsData.events);
      }

      if (isActive && profileData.profile) {
        setProfileInfo(profileData.profile);
      }
    }

    void loadProfileData();

    return () => {
      isActive = false;
    };
  }, [user]);

  const handleSaveProfile = async (profile: ProfileInfo) => {
    const response = await fetch("/api/users/me/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Could not save profile");
    }

    setProfileInfo(data.profile);
    setIsSettingsOpen(false);
  };

  const handleLeaveEvent = async (eventId: string) => {
    setLeavingEventId(eventId);

    try {
      const response = await fetch(`/api/events/${eventId}/join`, {
        method: "DELETE",
      });

      if (!response.ok) return;

      setJoinedEvents((current) =>
        current.filter((event) => event.id !== eventId)
      );
      setConfirmingLeaveEventId(null);
    } finally {
      setLeavingEventId(null);
    }
  };

  const confirmingLeaveEvent = joinedEvents.find(
    (event) => event.id === confirmingLeaveEventId
  );

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-gray-50 px-4">
        <p className="text-sm text-gray-400">กำลังโหลดโปรไฟล์...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 px-4 py-6">
      <div className="mx-auto w-full max-w-xl rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        {user ? (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
                  Profile
                </p>
                <h1 className="mt-1 text-2xl font-bold text-gray-900">
                  {user.name}
                </h1>
                <p className="mt-1 text-sm text-gray-500">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="shrink-0 rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm"
              >
                Edit Profile
              </button>
            </div>

            {completion < 100 && (
              <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">
                      Complete Your Profile
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                      Profile Completion
                    </p>
                  </div>
                  <span className="text-lg font-bold text-rose-500">
                    {completion}%
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-rose-500"
                    style={{ width: `${completion}%` }}
                  />
                </div>
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-500">Missing:</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {missingFields.map((field) => (
                      <span
                        key={field}
                        className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-600"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Profile Information
              </h2>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 sm:col-span-2">
                  <p className="text-sm font-bold text-gray-900">
                    Interests
                  </p>
                  <ChipList values={profileInfo.interests} prominent />
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-400">Age</p>
                  <p className="mt-1 text-sm text-gray-700">
                    {profileInfo.age ?? NOT_SET}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-400">District</p>
                  <p className="mt-1 text-sm text-gray-700">
                    {profileInfo.district ?? NOT_SET}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-400">
                    Occupation
                  </p>
                  <p className="mt-1 text-sm text-gray-700">
                    {profileInfo.occupation ?? NOT_SET}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3 sm:col-span-2">
                  <p className="text-xs font-medium text-gray-400">Goals</p>
                  <ChipList values={profileInfo.goals} />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Interest Profile
              </h2>
              <div className="mt-3 rounded-xl border border-gray-100 p-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium text-gray-400">
                      Shared Interests
                    </p>
                    <ChipList values={profileInfo.interests} prominent />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400">
                      Similar Community
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {joinedEvents.length} joined events
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400">
                      Occupation
                    </p>
                    <p className="mt-1 text-sm text-gray-700">
                      {profileInfo.occupation ?? NOT_SET}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Joined events
              </h2>
              <div className="mt-3 space-y-2">
                {joinedEvents.length > 0 ? (
                  joinedEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 rounded-xl border border-gray-100 p-3"
                    >
                      <Link href={`/Event/${event.id}`} className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {event.title}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {event.location}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {event.attendeeCount} people joined
                        </p>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setConfirmingLeaveEventId(event.id)}
                        disabled={leavingEventId === event.id}
                        className="shrink-0 rounded-full border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-500 disabled:opacity-60"
                      >
                        {leavingEventId === event.id ? "Leaving..." : "Leave Event"}
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-400">
                    ยังไม่ได้เข้าร่วมกิจกรรม
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="w-full rounded-full border border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              ออกจากระบบ
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
                Meetfan
              </p>
              <h1 className="mt-1 text-2xl font-bold text-gray-900">
                เข้าสู่ระบบเพื่อดูโปรไฟล์
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                ใช้บัญชีเดียวกันสำหรับสมัครกิจกรรม จับคู่ และแชท
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full rounded-full bg-rose-500 py-3 text-sm font-semibold text-white shadow-md shadow-rose-100"
            >
              เข้าสู่ระบบ / สมัครสมาชิก
            </button>
          </div>
        )}
      </div>

      {isSettingsOpen && (
        <div
          className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setIsSettingsOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
                Profile Settings
              </p>
              <h2 className="mt-1 text-xl font-bold text-gray-900">
                Edit Profile
              </h2>
            </div>
            <ProfileSettingsForm
              initialProfile={profileInfo}
              onCancel={() => setIsSettingsOpen(false)}
              onSave={handleSaveProfile}
            />
          </div>
        </div>
      )}

      {confirmingLeaveEvent && (
        <div
          className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40 px-6"
          onClick={() => {
            if (!leavingEventId) setConfirmingLeaveEventId(null);
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-base font-bold text-gray-900">Leave this event?</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              You will be removed from this event and attendees list.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmingLeaveEventId(null)}
                disabled={leavingEventId === confirmingLeaveEvent.id}
                className="flex-1 rounded-full border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleLeaveEvent(confirmingLeaveEvent.id)}
                disabled={leavingEventId === confirmingLeaveEvent.id}
                className="flex-1 rounded-full bg-rose-500 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {leavingEventId === confirmingLeaveEvent.id ? "Leaving..." : "Leave Event"}
              </button>
            </div>
          </div>
        </div>
      )}

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
