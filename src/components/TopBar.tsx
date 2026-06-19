"use client";

/**
 * TopBar
 * -----------------------------------------------------------------------
 * แถบด้านบนสุดของแอป: logo ซ้าย, แจ้งเตือน + รูปโปรไฟล์ ขวา
 * เขียนด้วย Tailwind ทั้งหมด, ตอนนี้เป็น static UI ก่อน
 *
 * ใช้ icon จาก lucide-react:
 *   npm install lucide-react
 *
 * วิธีใช้:
 *   import TopBar from "@/components/layout/TopBar";
 *   ...
 *   <TopBar />
 *
 * โลโก้: ใส่ไฟล์รูปไว้ที่ /public/logo.png แล้วแก้ path ด้านล่าง
 * (ตอนนี้ใส่ placeholder ไว้ก่อน ถ้ายังไม่มีไฟล์รูปจะไม่เห็นอะไร/error icon)
 *
 * รูปโปรไฟล์: เปลี่ยน src ของ <img> รูป avatar เป็น URL จริงของผู้ใช้
 * -----------------------------------------------------------------------
 */

import { Bell } from "lucide-react";

export default function TopBar() {
  return (
    <header className="relative z-50 flex items-center justify-between  px-4 py-1  shadow-sm">
      {/* Logo */}
      <div className="flex items-center">
        <img
          src="/logo/logo.png"
          alt="Meet Fan"
          className="h-12 w-auto "
        />
      </div>

      {/* Right side: notification + profile */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative flex items-center justify-center text-gray-600"
        >
          <Bell size={22} />
          {/* จุดแดงแจ้งเตือน (mock) - ลบ span นี้ถ้ายังไม่มี notification */}
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-rose-500" />
        </button>

        <img
          src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=80&h=80&fit=crop&crop=faces"
          alt="Profile"
          className="h-9 w-9 rounded-full object-cover ring-2 ring-white"
        />
      </div>
    </header>
  );
}