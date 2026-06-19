// app/api/users/me/matches/route.ts
//
// GET -> ดึงรายการ Match ทั้งหมดของ user ปัจจุบัน (ทุก event)
// ใช้สำหรับหน้า "แมทใหม่ / ข้อความ" ในแอป
import { fail, ok } from "@/lib/api-response";
import { requireCurrentUser } from "@/lib/session";
import { listMyMatches } from "@/services/match-service";

export async function GET() {
  try {
    const user = await requireCurrentUser();
    const matches = await listMyMatches(user.id);

    return ok({ matches });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return fail("Unauthorized", 401);
    }
    return fail("Could not load matches", 500);
  }
}