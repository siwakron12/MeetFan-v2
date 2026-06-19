"use client";



import { Search, SlidersHorizontal } from "lucide-react";

export default function TopSearchBar() {
  return (
    <div className="fixed z-[500] top-16 left-0 right-0  px-4 pt-[calc(env(safe-area-inset-top)+12px)] pb-3">
      <div className="flex items-center gap-2 rounded-full bg-white mx-auto lg:w-2/4 shadow-md px-4 py-2.5">
        
        <Search size={18} className="text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="ค้นหา Event ใกล้คุณ..."
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none"
          readOnly
        />
        <button
          type="button"
          className="flex items-center justify-center rounded-full bg-gray-100 p-2 shrink-0"
        >
          <SlidersHorizontal size={16} className="text-gray-500" />
        </button>
      </div>
    </div>
  );
}