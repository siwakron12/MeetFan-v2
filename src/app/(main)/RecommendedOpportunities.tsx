"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BriefcaseBusiness, ImageIcon, MapPin } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import {
  EMPTY_OPPORTUNITY_PROFILE,
  ProfileInfo,
  getMatchDetails,
  getRecommendations,
} from "@/services/opportunity-service";

// Gradient mock thumbnails per category — swap for opportunity.imageUrl when real
// event images are available.
const CATEGORY_THUMBNAIL_STYLES: Record<string, string> = {
  default: "from-rose-200 to-orange-100",
};

function getThumbnailGradient(category: string) {
  return CATEGORY_THUMBNAIL_STYLES[category] ?? CATEGORY_THUMBNAIL_STYLES.default;
}

export default function RecommendedOpportunities() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileInfo>(EMPTY_OPPORTUNITY_PROFILE);

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

  const recommendations = useMemo(() => getRecommendations(profile), [profile]);

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">แนะนำสำหรับคุณ</h1>
          <p className="mt-1 text-sm text-gray-500">
            กิจกรรมและคอมมูนิตี้ที่คัดมาให้ตรงกับความสนใจของคุณ
          </p>
        </div>
        <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-500">
          ความสนใจที่ตรงกัน
        </span>
      </div>

      <div className="grid gap-3">
        {recommendations.map((opportunity) => (
          <Link
            key={opportunity.id}
            href={`/opportunities/${opportunity.id}`}
            className="group rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-rose-100 hover:shadow-md"
          >
            <div className="flex gap-3">
              {/* Mock event thumbnail */}
              <div
                className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${getThumbnailGradient(
                  opportunity.category
                )} sm:h-20 sm:w-20`}
              >
                <ImageIcon size={22} className="text-white/80" strokeWidth={1.75} />
                <span className="absolute -bottom-1.5 -right-1.5 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                  {opportunity.matchScore}%
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-base font-semibold leading-snug text-gray-900 group-hover:text-rose-600">
                    {opportunity.title}
                  </h2>
                  <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                    {opportunity.category}
                  </span>
                </div>

                <div className="mt-1.5 flex items-center gap-1 text-sm text-gray-500">
                  <MapPin size={14} className="shrink-0" />
                  <span className="truncate">{opportunity.location}</span>
                </div>
              </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              {opportunity.description}
            </p>

            <div className="mt-3 rounded-lg bg-rose-50 p-3">
              <p className="text-xs font-bold text-rose-500">ทำไมถึงแนะนำกิจกรรมนี้?</p>
              <div className="mt-2 grid gap-1">
                {getMatchDetails(opportunity, profile)
                  .reasons.slice(0, 3)
                  .map((reason) => (
                    <p key={reason} className="text-xs font-medium text-gray-600">
                      <span className="font-bold text-emerald-500">✓</span> {reason}
                    </p>
                  ))}
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-gray-400">
              <BriefcaseBusiness size={13} className="shrink-0" />
              <span>คอมมูนิตี้ที่คล้ายกัน</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}