import { fail, ok } from "@/lib/api-response";
import { requireCurrentUser } from "@/lib/session";
import { listJoinedEvents } from "@/services/event-service";

export async function GET() {
  try {
    const user = await requireCurrentUser();
    const events = await listJoinedEvents(user.id);

    return ok({ events });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return fail("Unauthorized", 401);
    }

    return fail("Could not load joined events", 500);
  }
}
