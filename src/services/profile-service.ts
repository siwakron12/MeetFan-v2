import { prisma } from "@/lib/prisma";

export const INTEREST_OPTIONS = [
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
] as const;

export const GOAL_OPTIONS = [
  "Networking",
  "Learning",
  "Career Growth",
  "Startup Opportunities",
  "Friends",
  "Volunteer Work",
] as const;

export interface ProfilePayload {
  age: number | null;
  district: string | null;
  occupation: string | null;
  interests: string[];
  goals: string[];
}

function parseList(value: string | null | undefined) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function cleanString(value: unknown) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function cleanAge(value: unknown) {
  if (value === null || value === undefined || value === "") return null;

  const age = Number(value);
  if (!Number.isInteger(age) || age < 13 || age > 120) {
    throw new Error("INVALID_AGE");
  }

  return age;
}

function cleanSelection(value: unknown, allowed: readonly string[]) {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value.filter(
        (item): item is string =>
          typeof item === "string" && allowed.includes(item)
      )
    )
  );
}

function serializeProfile(user: {
  age: number | null;
  district: string | null;
  occupation: string | null;
  interests: string;
  goals: string;
}): ProfilePayload {
  return {
    age: user.age,
    district: user.district,
    occupation: user.occupation,
    interests: parseList(user.interests),
    goals: parseList(user.goals),
  };
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      age: true,
      district: true,
      occupation: true,
      interests: true,
      goals: true,
    },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return serializeProfile(user);
}

export async function updateUserProfile(userId: string, input: unknown) {
  if (!input || typeof input !== "object") {
    throw new Error("INVALID_PROFILE");
  }

  const body = input as Record<string, unknown>;
  const profile = {
    age: cleanAge(body.age),
    district: cleanString(body.district),
    occupation: cleanString(body.occupation),
    interests: cleanSelection(body.interests, INTEREST_OPTIONS),
    goals: cleanSelection(body.goals, GOAL_OPTIONS),
  };

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      age: profile.age,
      district: profile.district,
      occupation: profile.occupation,
      interests: JSON.stringify(profile.interests),
      goals: JSON.stringify(profile.goals),
    },
    select: {
      age: true,
      district: true,
      occupation: true,
      interests: true,
      goals: true,
    },
  });

  return serializeProfile(user);
}
