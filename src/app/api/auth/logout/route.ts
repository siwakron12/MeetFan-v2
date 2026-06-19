import { ok } from "@/lib/api-response";
import { logoutUser } from "@/services/auth-service";

export async function POST() {
  await logoutUser();
  return ok({ success: true });
}
