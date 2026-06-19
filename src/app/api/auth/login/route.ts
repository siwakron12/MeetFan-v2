import { fail, ok } from "@/lib/api-response";
import { loginUser } from "@/services/auth-service";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.email || !body?.password) {
    return fail("Email and password are required", 400);
  }

  try {
    const user = await loginUser({
      email: String(body.email),
      password: String(body.password),
    });

    return ok({ user });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      return fail("Invalid email or password", 401);
    }

    return fail("Could not login", 500);
  }
}
