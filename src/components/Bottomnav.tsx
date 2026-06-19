"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { BriefcaseBusiness, MapPin, Calendar, MessageCircle, User } from "lucide-react";

const NAV_ITEMS = [
  { key: "map", label: "Map", icon: MapPin, href: "/" },
  { key: "events", label: "Events", icon: Calendar, href: "/Event" },
  {
    key: "opportunities",
    label: "Opportunities",
    icon: BriefcaseBusiness,
    href: "/opportunities",
  },

  { key: "chat", label: "Chat", icon: MessageCircle, href: "/chat" },
  { key: "profile", label: "Profile", icon: User, href: "/profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="relative z-50 flex items-center justify-around h-16 pb-[env(safe-area-inset-bottom)] bg-white border-t border-gray-200">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.key}
            href={item.href}
            className="flex flex-1 flex-col items-center justify-center gap-0.5"
          >
            <Icon
              size={22}
              strokeWidth={isActive ? 2.4 : 2}
              className={isActive ? "text-rose-500" : "text-gray-400"}
            />
            <span
              className={`text-[10px] leading-none ${isActive ? "text-rose-500 font-semibold" : "text-gray-400 font-medium"
                }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
