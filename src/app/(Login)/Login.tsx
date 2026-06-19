"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";

interface LoginProps {
  onSuccess?: () => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login({ email, password });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">อีเมล</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          รหัสผ่าน
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="อย่างน้อย 6 ตัวอักษร"
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-rose-500 py-2.5 font-semibold text-white hover:bg-rose-600 disabled:opacity-50"
      >
        {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
}
