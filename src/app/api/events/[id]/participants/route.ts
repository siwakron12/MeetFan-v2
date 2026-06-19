import { fail, ok } from "@/lib/api-response";
import { getEventParticipants } from "@/services/event-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const participants = await getEventParticipants(id);

    return ok({ participants });
  } catch (error) {
    return fail("Could not load participants", 500);
  }
}