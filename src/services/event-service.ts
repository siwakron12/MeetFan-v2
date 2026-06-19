import { prisma } from "@/lib/prisma";
import { findCsvEvent, loadCsvEvents, type CsvEvent } from "@/services/event-data";
export async function getEventParticipants(eventId: string) {
  const participants = await prisma.eventParticipant.findMany({
    where: { eventId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          occupation: true,
          district: true,
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  return participants.map((p) => ({
    ...p.user,
    joinedAt: p.joinedAt,
  }));
}
async function getParticipantCounts() {
  try {
    const counts = await prisma.eventParticipant.groupBy({
      by: ["eventId"],
      _count: { eventId: true },
    });

    return new Map(
      counts.map((count) => [count.eventId, count._count.eventId])
    );
  } catch {
    return new Map<string, number>();
  }
}

async function getJoinedEventIds(userId?: string) {
  if (!userId) return new Set<string>();

  try {
    const participants = await prisma.eventParticipant.findMany({
      where: { userId },
      select: { eventId: true },
    });

    return new Set(participants.map((participant) => participant.eventId));
  } catch {
    return new Set<string>();
  }
}

function serializeEvent(
  event: CsvEvent,
  attendeeCount: number,
  joinedEventIds: Set<string>
) {
  return {
    ...event,
    attendeeCount,
    joined: joinedEventIds.has(event.id),
  };
}

export async function listEvents(userId?: string) {
  const [events, counts, joinedEventIds] = await Promise.all([
    loadCsvEvents(),
    getParticipantCounts(),
    getJoinedEventIds(userId),
  ]);

  return events.map((event) =>
    serializeEvent(event, counts.get(event.id) ?? 0, joinedEventIds)
  );
}

export async function getEvent(eventId: string, userId?: string) {
  const [event, counts, joinedEventIds] = await Promise.all([
    findCsvEvent(eventId),
    getParticipantCounts(),
    getJoinedEventIds(userId),
  ]);

  return event
    ? serializeEvent(event, counts.get(event.id) ?? 0, joinedEventIds)
    : null;
}

export async function joinEvent(userId: string, eventId: string) {
  const event = await findCsvEvent(eventId);

  if (!event) {
    throw new Error("EVENT_NOT_FOUND");
  }

  await prisma.$executeRawUnsafe("PRAGMA foreign_keys = OFF");
  await prisma.eventParticipant.upsert({
    where: { userId_eventId: { userId, eventId } },
    update: {},
    create: { userId, eventId },
  });

  return { joined: true };
}

export async function leaveEvent(userId: string, eventId: string) {
  const event = await findCsvEvent(eventId);

  if (!event) {
    throw new Error("EVENT_NOT_FOUND");
  }

  await prisma.eventParticipant.deleteMany({
    where: { userId, eventId },
  });

  return { success: true };
}

export async function listJoinedEvents(userId: string) {
  const [events, participants, counts] = await Promise.all([
    loadCsvEvents(),
    prisma.eventParticipant.findMany({
      where: { userId },
      orderBy: { joinedAt: "desc" },
      select: { eventId: true, joinedAt: true },
    }),
    getParticipantCounts(),
  ]);
  const eventById = new Map(events.map((event) => [event.id, event]));
  const joinedEventIds = new Set(participants.map((participant) => participant.eventId));

  return participants
    .map((participant) => {
      const event = eventById.get(participant.eventId);
      if (!event) return null;

      return {
        ...serializeEvent(event, counts.get(event.id) ?? 0, joinedEventIds),
        joinedAt: participant.joinedAt.toISOString(),
      };
    })
    .filter((event): event is NonNullable<typeof event> => Boolean(event));
}
