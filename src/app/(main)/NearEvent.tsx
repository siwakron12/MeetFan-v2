"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, MapPin, Users } from "lucide-react";

interface EventItem {
  id: string;
  title: string;
  category: string;
  location: string;
  date: string;
  attendees: number;
  image: string;
  lat: number;
  lng: number;
  distance?: string;
}

interface NearEventProps {
  events: EventItem[];
  onJoinEvent?: (eventId: string) => void;
}

export default function NearEvent({ events, onJoinEvent }: NearEventProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="pointer-events-none absolute bottom-3 left-0 right-0 z-[400] flex justify-center px-3">
      <div className="pointer-events-auto w-full max-w-2xl rounded-2xl bg-white/95 shadow-lg backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex w-full items-center justify-between px-4 py-3"
        >
          <span className="text-sm font-semibold text-gray-900">Events near you</span>
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-rose-500">View all</span>
            {isOpen ? (
              <ChevronDown size={16} className="text-gray-400" />
            ) : (
              <ChevronUp size={16} className="text-gray-400" />
            )}
          </div>
        </button>

        {isOpen && (
          <div className="flex gap-2 overflow-x-auto px-4 pb-4 scrollbar-hide">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex w-44 flex-shrink-0 flex-col overflow-hidden rounded-xl border border-gray-100 p-1 shadow-sm"
              >
                <div className="relative h-24 w-full bg-rose-50">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="h-full w-full object-cover"
                    onError={(error) => {
                      error.currentTarget.style.display = "none";
                    }}
                  />
                  <span className="absolute left-1 top-1 rounded-full bg-emerald-600/90 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {event.distance ?? "Nearby"}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-1 p-2.5">
                  <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-gray-900">
                    {event.title}
                  </h3>

                  <div className="flex items-center gap-1 text-[11px] text-gray-500">
                    <Users size={12} className="shrink-0" />
                    <span className="truncate">{event.attendees} people joined</span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-gray-400">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onJoinEvent?.(event.id)}
                    className="mt-auto self-center rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600"
                  >
                    Join event
                  </button>
                </div>
              </div>
            ))}

            {events.length === 0 && (
              <p className="px-1 pb-1 text-xs text-gray-400">Loading nearby events...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
