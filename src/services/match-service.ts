// services/match-service.ts
import { prisma } from "@/lib/prisma";
import { findCsvEvent } from "@/services/event-data";

function orderPair(idOne: string, idTwo: string): [string, string] {
  return idOne < idTwo ? [idOne, idTwo] : [idTwo, idOne];
}

export async function getSwipeCandidates(eventId: string, userId: string) {
  const myParticipation = await prisma.eventParticipant.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });

  if (!myParticipation) {
    throw new Error("NOT_JOINED");
  }

  const alreadySwiped = await prisma.swipe.findMany({
    where: { eventId, fromUserId: userId },
    select: { toUserId: true },
  });
  const swipedIds = alreadySwiped.map((s) => s.toUserId);

  const participants = await prisma.eventParticipant.findMany({
    where: {
      eventId,
      userId: { notIn: [userId, ...swipedIds] },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          age: true,
          district: true,
          occupation: true,
          interests: true,
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  return participants.map((p) => ({
    id: p.user.id,
    name: p.user.name,
    age: p.user.age,
    district: p.user.district,
    occupation: p.user.occupation,
    interests: JSON.parse(p.user.interests || "[]"),
    joinedAt: p.joinedAt,
  }));
}

export async function swipeUser(params: {
  eventId: string;
  fromUserId: string;
  toUserId: string;
  liked: boolean;
}) {
  const { eventId, fromUserId, toUserId, liked } = params;

  if (fromUserId === toUserId) {
    throw new Error("CANNOT_SWIPE_SELF");
  }

  const [fromJoined, toJoined] = await Promise.all([
    prisma.eventParticipant.findUnique({
      where: { userId_eventId: { userId: fromUserId, eventId } },
    }),
    prisma.eventParticipant.findUnique({
      where: { userId_eventId: { userId: toUserId, eventId } },
    }),
  ]);

  if (!fromJoined || !toJoined) {
    throw new Error("NOT_JOINED");
  }

  await prisma.swipe.upsert({
    where: {
      eventId_fromUserId_toUserId: { eventId, fromUserId, toUserId },
    },
    update: { liked },
    create: { eventId, fromUserId, toUserId, liked },
  });

  if (!liked) {
    return { liked: false, matched: false };
  }

  const reciprocal = await prisma.swipe.findUnique({
    where: {
      eventId_fromUserId_toUserId: {
        eventId,
        fromUserId: toUserId,
        toUserId: fromUserId,
      },
    },
  });

  if (!reciprocal?.liked) {
    return { liked: true, matched: false };
  }

  // mutual like -> สร้าง Match
  const [userAId, userBId] = orderPair(fromUserId, toUserId);

  const [upserted, csvEvent] = await Promise.all([
    prisma.match.upsert({
      where: { eventId_userAId_userBId: { eventId, userAId, userBId } },
      update: {},
      create: { eventId, userAId, userBId },
      include: {
        userA: { select: { id: true, name: true } },
        userB: { select: { id: true, name: true } },
      },
    }),
    findCsvEvent(eventId), // ดึง event จาก CSV แทน DB relation
  ]);

  const match = {
    id: upserted.id,
    event: csvEvent
      ? { id: csvEvent.id, title: csvEvent.title, imageUrl: csvEvent.imageUrl }
      : { id: eventId, title: "", imageUrl: "" },
    userA: upserted.userA,
    userB: upserted.userB,
  };

  return { liked: true, matched: true, match };
}

export async function listMyMatches(userId: string) {
  const matches = await prisma.match.findMany({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    include: {
      userA: {
        select: { id: true, name: true, occupation: true, district: true },
      },
      userB: {
        select: { id: true, name: true, occupation: true, district: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // ดึง event ทั้งหมดที่ match อ้างถึงจาก CSV
  const { loadCsvEvents } = await import("@/services/event-data");
  const csvEvents = await loadCsvEvents();
  const eventById = new Map(csvEvents.map((e) => [e.id, e]));

  return matches.map((m) => {
    const otherUser = m.userAId === userId ? m.userB : m.userA;
    const csvEvent = eventById.get(m.eventId);

    return {
      id: m.id,
      event: csvEvent
        ? { id: csvEvent.id, title: csvEvent.title, imageUrl: csvEvent.imageUrl }
        : { id: m.eventId, title: "", imageUrl: "" },
      otherUser,
      createdAt: m.createdAt,
    };
  });
}