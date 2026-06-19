import { ok } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/session";
import { listEvents } from "@/services/event-service";

export async function GET() {

  const user = await getCurrentUser();
  const events = await listEvents(user?.id);

  return ok({ events });
}
