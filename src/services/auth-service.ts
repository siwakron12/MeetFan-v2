import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, getCurrentUser } from "@/lib/session";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function publicUser(user: {
  id: string;
  name: string;
  email: string;
  createdAt?: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt?.toISOString(),
  };
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const password = input.password;

  if (name.length < 2) {
    throw new Error("INVALID_NAME");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("INVALID_EMAIL");
  }

  if (password.length < 8) {
    throw new Error("WEAK_PASSWORD");
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    throw new Error("EMAIL_EXISTS");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  await createSession(user.id);

  return publicUser(user);
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({
    where: { email: normalizeEmail(input.email) },
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const validPassword = await bcrypt.compare(input.password, user.passwordHash);
  if (!validPassword) {
    throw new Error("INVALID_CREDENTIALS");
  }

  await createSession(user.id);

  return publicUser(user);
}

export async function logoutUser() {
  await destroySession();
}

export async function currentUser() {
  const user = await getCurrentUser();
  return user ? publicUser(user) : null;
}
