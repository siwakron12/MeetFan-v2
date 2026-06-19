import { ok } from "@/lib/api-response";
import { currentUser } from "@/services/auth-service";

export async function GET() {
  const user = await currentUser();
  return ok({ user });
}
