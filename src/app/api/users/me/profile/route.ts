import { fail, ok } from "@/lib/api-response";
import { requireCurrentUser } from "@/lib/session";
import { getUserProfile, updateUserProfile } from "@/services/profile-service";

export async function GET() {
  try {
    const user = await requireCurrentUser();
    const profile = await getUserProfile(user.id);

    return ok({ profile });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return fail("Unauthorized", 401);
    }

    return fail("Could not load profile", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireCurrentUser();
    const body = await request.json().catch(() => null);
    const profile = await updateUserProfile(user.id, body);

    return ok({ profile });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") return fail("Unauthorized", 401);
      if (error.message === "INVALID_AGE") return fail("Invalid age", 400);
      if (error.message === "INVALID_PROFILE") return fail("Invalid profile", 400);
    }

    return fail("Could not save profile", 500);
  }
}
