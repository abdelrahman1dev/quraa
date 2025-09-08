"use client";
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");

  // ✅ Email/Password login or signup
  const handleAuth = async () => {
    let result;
    if (mode === "login") {
      result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
    } else {
      result = await supabase.auth.signUp({
        email,
        password,
      });
    }

    const { error } = result;
    if (error) {
      setError(error.message);
    } else {
      setError(null);
      console.log("✅ Auth success:", result);
      window.location.href = "/"; // redirect after success
    }
  };

  // ✅ Google sign-in
  const handleGoogleAuth = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin, // after login it goes back here
      },
    });

    if (error) {
      console.error("Google Auth error:", error.message);
      setError(error.message);
    } else {
      console.log("🌍 Redirecting to Google Auth:", data);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm text-center">
        <h2 className="text-xl font-bold mb-4">
          {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}
        </h2>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />

        <button
          onClick={handleAuth}
          className="w-full bg-mint text-darkgreen py-2 rounded font-semibold hover:bg-darkgreen hover:text-white transition mb-3"
        >
          {mode === "login" ? "دخول" : "تسجيل"}
        </button>

        <button
          onClick={handleGoogleAuth}
          className="w-full bg-red-500 text-white py-2 rounded font-semibold hover:bg-red-600 transition"
        >
          دخول باستخدام Google
        </button>

        <p className="mt-4 text-sm">
          {mode === "login" ? "ليس لديك حساب؟" : "لديك حساب؟"}{" "}
          <span
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-mint cursor-pointer underline"
          >
            {mode === "login" ? "سجل هنا" : "سجّل الدخول"}
          </span>
        </p>
      </div>
    </div>
  );
}
