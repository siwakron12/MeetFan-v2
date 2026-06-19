


"use client";

import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./Mapview"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center text-sm text-gray-400">
      กำลังโหลดแผนที่...
    </div>
  ),
});

export default function MapPage() {
  return <MapView />;
}