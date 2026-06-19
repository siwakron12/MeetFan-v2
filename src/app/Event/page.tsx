"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Heart, MapPin, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

interface ApiEvent {
  id: string;
  title: string;
  category: string;
  location: string;
  eventDate: string;
  date?: string;
  time?: string;
  attendeeCount: number;
  imageUrl: string;
  posterPng?: string;
  poster_png?: string;
  joined: boolean;
}

interface EventItem {
  id: string;
  title: string;
  category: string;
  location: string;
  date: string;
  attendees: number;
  image: string;
  joined: boolean;
}

function formatDate(event: ApiEvent) {
  const label = [event.date, event.time].filter(Boolean).join(" · ");
  if (label) return label;

  return new Date(event.eventDate).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function toEventItem(event: ApiEvent): EventItem {
  return {
    id: event.id,
    title: event.title,
    category: event.category,
    location: event.location,
    date: formatDate(event),
    attendees: event.attendeeCount,
    image: event.poster_png || event.posterPng || event.imageUrl,
    joined: event.joined,
  };
}

function EventCard({
  event,
  onClick,
}: {
  event: EventItem;
  onClick: () => void;
}) {
  const content = (
    <>
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-rose-100">
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover"
          onError={(error) => {
            error.currentTarget.style.display = "none";
          }}
        />
        {event.joined && (
          <div className="absolute right-1 top-1 flex items-center gap-0.5 rounded-full bg-emerald-500 px-1.5 py-0.5">
            <Check size={9} className="text-white" />
            <span className="text-[9px] font-bold text-white">Joined</span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          <span className="inline-block rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-500">
            {event.category}
          </span>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
            {event.title}
          </h3>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-400">
            <CalendarDays size={11} />
            <span className="truncate">{event.date}</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-400">
            <MapPin size={11} />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] text-gray-400">
            {event.attendees} people joined
          </span>
          {event.joined ? (
            <span className="flex items-center gap-1 rounded-xl bg-rose-500 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm shadow-rose-200">
              <Heart size={11} className="fill-white text-white" />
              Match
            </span>
          ) : (
            <span className="flex items-center gap-0.5 text-[11px] font-semibold text-rose-400">
              <Sparkles size={11} />
              Join to match
            </span>
          )}
        </div>
      </div>
    </>
  );

  if (event.joined) {
    return (
      <Link
        href={`/Event/${event.id}`}
        className="flex w-full gap-3 rounded-2xl bg-white p-3 text-left shadow-sm ring-1 ring-gray-100 active:opacity-90"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full gap-3 rounded-2xl bg-white p-3 text-left shadow-sm ring-1 ring-gray-100 active:opacity-90"
    >
      {content}
    </button>
  );
}

export default function EventsPage({
  onSelectEvent,
}: {
  onSelectEvent?: (eventId: string) => void;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joiningEventId, setJoiningEventId] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadEvents() {
      setIsLoading(true);
      const response = await fetch("/api/events", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));

      if (isActive && Array.isArray(data.events)) {
        setEvents(data.events.map(toEventItem));
      }

      if (isActive) setIsLoading(false);
    }

    void loadEvents();

    return () => {
      isActive = false;
    };
  }, [user]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return events;

    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(q) ||
        event.category.toLowerCase().includes(q) ||
        event.location.toLowerCase().includes(q)
    );
  }, [events, query]);

  const joined = filtered.filter((event) => event.joined);
  const all = filtered.filter((event) => !event.joined);

  const handleSelect = async (id: string) => {
    if (!user) {
      router.push(`/login?eventId=${encodeURIComponent(id)}`);
      return;
    }

    setJoiningEventId(id);
    const response = await fetch(`/api/events/${id}/join`, { method: "POST" });
    setJoiningEventId(null);

    if (!response.ok) {
      if (response.status === 401) {
        router.push(`/login?eventId=${encodeURIComponent(id)}`);
      }
      return;
    }

    onSelectEvent?.(id);
    router.push(`/Event/${id}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="bg-white px-4 pb-3 pt-4 shadow-sm">
        <h1 className="mb-3 text-xl font-bold text-gray-900">Events</h1>
        <div className="flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2.5">
          <Search size={16} className="shrink-0 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24 pt-4">
        {isLoading && (
          <p className="mb-3 text-sm text-gray-400">Loading events...</p>
        )}

        {joined.length > 0 && (
          <section className="mb-5">
            <h2 className="mb-2.5 text-sm font-semibold text-gray-500">
              Joined events ({joined.length})
            </h2>
            <div className="flex flex-col gap-2.5">
              {joined.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => {
                    if (joiningEventId !== event.id) void handleSelect(event.id);
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {all.length > 0 && (
          <section>
            <h2 className="mb-2.5 text-sm font-semibold text-gray-500">
              Events near you ({all.length})
            </h2>
            <div className="flex flex-col gap-2.5">
              {all.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => {
                    if (joiningEventId !== event.id) void handleSelect(event.id);
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <Search size={36} className="text-gray-200" />
            <p className="mt-3 text-sm text-gray-400">No matching events found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
