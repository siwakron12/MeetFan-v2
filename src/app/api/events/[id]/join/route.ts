import { fail, ok } from "@/lib/api-response";
import { requireCurrentUser } from "@/lib/session";
import { joinEvent, leaveEvent } from "@/services/event-service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [{ id }, user] = await Promise.all([params, requireCurrentUser()]);
    const result = await joinEvent(user.id, id);

    return ok(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") return fail("Unauthorized", 401);
      if (error.message === "EVENT_NOT_FOUND") return fail("Event not found", 404);
    }

    return fail("Could not join event", 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [{ id }, user] = await Promise.all([params, requireCurrentUser()]);
    const result = await leaveEvent(user.id, id);

    return ok(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") return fail("Unauthorized", 401);
      if (error.message === "EVENT_NOT_FOUND") return fail("Event not found", 404);
    }

    return fail("Could not leave event", 500);
  }
}
