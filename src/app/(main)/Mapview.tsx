"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import BottomNav from "../../components/Bottomnav";
import TopSearchBar from "./TopSearchBar";
import TopBar from "../../components/TopBar";
import NearEvent from "./NearEvent";
import DetailEvent from "./DetailEvent";
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
  latitude: number;
  longitude: number;
}

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
}

const BANGKOK_CENTER: [number, number] = [13.7563, 100.5018];

const userIcon = L.divIcon({
  className: "user-location-marker",
  html: `<div style="
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #3B82F6;
    border: 3px solid #ffffff;
    box-shadow: 0 0 0 4px rgba(59,130,246,0.25), 0 2px 6px rgba(0,0,0,0.3);
  "></div>`,
  iconAnchor: [8, 8],
  iconSize: [16, 16],
});

function formatDate(event: ApiEvent) {
  return [event.date, event.time].filter(Boolean).join(" · ");
}

function toEventItem(event: ApiEvent): EventItem {
  return {
    id: event.id,
    title: event.title,
    category: event.category,
    location: event.location,
    date: formatDate(event) || new Date(event.eventDate).toLocaleDateString("th-TH"),
    attendees: event.attendeeCount,
    image:  event.imageUrl,
    lat: event.latitude,
    lng: event.longitude,
  };
}

function createEventIcon(event: EventItem) {
  return L.divIcon({
    className: "event-photo-marker",
    html: `
      <div style="
        width: 55px;
        height: 55px;
        border-radius: 50%;
        overflow: hidden;
        border: 4px solid #f43f5e;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        background: #ffe4e6;
      ">
        <img src="${event.image}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" />
      </div>
      <div style="
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid #f43f5e;
        margin: -1px auto 0;
        filter: drop-shadow(0 1px 1px rgba(0,0,0,0.2));
      "></div>
    `,
    iconAnchor: [27.5, 65],
    iconSize: [55, 65],
    popupAnchor: [0, -65],
  });
}

function FlyToUserLocation({ position }: { position: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (position) map.setView(position, 15);
  }, [position, map]);

  return null;
}

export default function EventMapPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadEvents() {
      const response = await fetch("/api/events", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      console.log("API EVENTS:", data);
      if (isActive && Array.isArray(data.events)) {
        setEvents(data.events.map(toEventItem));
      }
    }

    void loadEvents();

    return () => {
      isActive = false;
    };
  }, [user]);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const markerIcons = useMemo(
    () => new Map(events.map((event) => [event.id, createEventIcon(event)])),
    [events]
  );

  const handleJoinEvent = (eventId: string) => {
    if (!user) {
      router.push(`/login?eventId=${encodeURIComponent(eventId)}`);
      return;
    }

    setSelectedEventId(eventId);
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <TopBar />
      </div>
      <TopSearchBar />

      <div className="relative flex-1">
        <MapContainer
          center={BANGKOK_CENTER}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
          attributionControl={false}
          zoomControl={false}
        >
          <TileLayer attribution="" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FlyToUserLocation position={userPosition} />

          {userPosition && (
            <Marker position={userPosition} icon={userIcon}>
              <Popup>You are here</Popup>
            </Marker>
          )}

          {events.map((event) => (
            <Marker
              key={event.id}
              position={[event.lat, event.lng]}
              icon={markerIcons.get(event.id)}
            >
              <Popup maxWidth={190} autoPan autoPanPadding={[0, 120]}>
                <div>
                  <img src={event.image} alt={event.title} className="h-auto w-full object-cover" />
                  <div className="p-2.5">
                    <span className="rounded-full bg-rose-100 px-1 py-0.5 text-[10px] text-rose-600">
                      {event.category}
                    </span>
                    <h3 className="mt-1 text-sm font-semibold leading-snug text-gray-900">
                      {event.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500">{event.location}</p>
                    <p className="text-xs text-gray-500">{event.date}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {event.attendees} people joined
                    </p>
                    <button
                      type="button"
                      onClick={() => handleJoinEvent(event.id)}
                      className="mt-2 w-full rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600"
                    >
                      Join event
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <NearEvent events={events.slice(0, 10)} onJoinEvent={handleJoinEvent} />
      </div>

      <div className="flex-shrink-0">
        <BottomNav />
      </div>

      {selectedEventId != null && (
        <DetailEvent eventId={selectedEventId} onClose={() => setSelectedEventId(null)} />
      )}
    </div>
  );
}
