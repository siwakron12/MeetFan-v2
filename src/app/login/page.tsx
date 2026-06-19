"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Login from "../(Login)/Login";
import Register from "../(Login)/Register";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const [isLogin, setIsLogin] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleAuthenticated = async () => {
    if (!eventId) {
      router.replace("/profile");
      return;
    }

    setStatus("Joining event...");
    setError("");

    const response = await fetch(`/api/events/${eventId}/join`, {
      method: "POST",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setStatus("");
      setError(data.message || "Could not join event");
      return;
    }

    router.replace(`/Event/${eventId}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md rounded-lg bg-white shadow-sm ring-1 ring-gray-100">
        <div className="border-b px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
            Meetfan
          </p>
          <h1 className="mt-1 text-xl font-bold text-gray-900">
            {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </h1>
          {eventId && (
            <p className="mt-1 text-sm text-gray-500">
              เข้าสู่ระบบเพื่อเข้าร่วมกิจกรรมนี้
            </p>
          )}
        </div>

        <div className="px-6 py-6">
          {isLogin ? (
            <Login onSuccess={handleAuthenticated} />
          ) : (
            <Register onSuccess={handleAuthenticated} />
          )}

          {status && <p className="mt-4 text-sm text-gray-500">{status}</p>}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>

        <div className="border-t px-6 py-4 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? "ยังไม่มีบัญชี?" : "มีบัญชีอยู่แล้ว?"}
            <button
              type="button"
              onClick={() => setIsLogin((value) => !value)}
              className="ml-2 font-semibold text-rose-500 hover:text-rose-600"
            >
              {isLogin ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <p className="text-sm text-gray-400">กำลังโหลด...</p>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
