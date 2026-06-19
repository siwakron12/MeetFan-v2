"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";

interface RegisterProps {
  onSuccess?: () => void;
}

export default function Register({ onSuccess }: RegisterProps) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
      });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "สมัครสมาชิกไม่สำเร็จ");
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">ชื่อ</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            นามสกุล
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">อีเมล</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
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
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="อย่างน้อย 6 ตัวอักษร"
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          ยืนยันรหัสผ่าน
        </label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="พิมพ์รหัสผ่านอีกครั้ง"
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-rose-500 py-2.5 font-semibold text-white hover:bg-rose-600 disabled:opacity-50"
      >
        {isLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
      </button>
    </form>
  );
}
