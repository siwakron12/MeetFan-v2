// app/api/events/[id]/matches/route.ts
//
// GET  -> ดึงรายชื่อผู้เข้าร่วม event นี้ที่ยังไม่เคยปัด (สำหรับหน้า Swipe deck)
// POST -> ปัด like/pass ผู้เข้าร่วมคนหนึ่ง ใน event นี้
import { fail, ok } from "@/lib/api-response";
import { requireCurrentUser } from "@/lib/session";
import { getSwipeCandidates, swipeUser } from "@/services/match-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [{ id: eventId }, user] = await Promise.all([
      params,
      requireCurrentUser(),
    ]);

    const candidates = await getSwipeCandidates(eventId, user.id);
    return ok({ candidates });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") return fail("Unauthorized", 401);
      if (error.message === "NOT_JOINED") {
        return fail("You must join this event first", 403);
      }
    }
    return fail("Could not load match candidates", 500);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [{ id: eventId }, user] = await Promise.all([
      params,
      requireCurrentUser(),
    ]);

    const body = await request.json().catch(() => null);

    if (!body?.toUserId || typeof body?.liked !== "boolean") {
      return fail("toUserId and liked (boolean) are required", 400);
    }

    const result = await swipeUser({
      eventId,
      fromUserId: user.id,
      toUserId: String(body.toUserId),
      liked: body.liked,
    });

    return ok(result);
  } catch (error) {
       console.error("POST /matches error:", error)
    if (error instanceof Error) {
    
      if (error.message === "UNAUTHENTICATED") return fail("Unauthorized", 401);
      if (error.message === "NOT_JOINED") {
        return fail("Both users must join this event first", 403);
      }
      if (error.message === "CANNOT_SWIPE_SELF") {
        return fail("Cannot swipe yourself", 400);
      }
    }
    return fail("Could not save swipe", 500);
  }
}