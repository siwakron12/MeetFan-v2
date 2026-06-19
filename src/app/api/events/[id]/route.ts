import { fail, ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { getEvent } from "@/services/event-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  const event = await getEvent(id, user?.id);

  if (!event) {
    return fail("Event not found", 404);
  }

  return ok({ event });
}
