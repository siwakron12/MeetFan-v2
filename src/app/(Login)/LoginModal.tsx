"use client";

import { useState } from "react";
import Login from "./Login";
import Register from "./Register";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated?: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onAuthenticated,
}: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onAuthenticated?.();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
              Meetfan
            </p>
            <h2 className="text-xl font-bold text-gray-900">
              {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-gray-400 hover:text-gray-600"
            aria-label="ปิด"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-6">
          {isLogin ? (
            <Login onSuccess={handleSuccess} />
          ) : (
            <Register onSuccess={handleSuccess} />
          )}
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
