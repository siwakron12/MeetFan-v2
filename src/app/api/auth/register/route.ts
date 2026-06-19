import { fail, ok } from "@/lib/api-response";
import { registerUser } from "@/services/auth-service";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.name || !body?.email || !body?.password) {
    return fail("Name, email, and password are required", 400);
  }

  try {
    const user = await registerUser({
      name: String(body.name),
      email: String(body.email),
      password: String(body.password),
    });

    return ok({ success: true, user }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    if (error instanceof Error) {
      if (error.message === "INVALID_NAME") return fail("Name is too short", 400);
      if (error.message === "INVALID_EMAIL") return fail("Invalid email", 400);
      if (error.message === "WEAK_PASSWORD") {
        return fail("Password must be at least 8 characters", 400);
      }
      if (error.message === "EMAIL_EXISTS") {
        return fail("Email is already registered", 409);
      }
    }

    return fail("Could not register user", 500);
  }
}
