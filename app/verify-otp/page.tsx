"use client";
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useSearchParams } from "next/navigation";

export default function VerifyOtpPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("email_otps")
        .select("*")
        .eq("email", email)
        .eq("otp", otp)
        .eq("used", false)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (error || !data) throw new Error("رمز التحقق غير صحيح أو انتهت صلاحيته");

      // mark OTP as used
      await supabase.from("email_otps").update({ used: true }).eq("id", data.id);

      // create user
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw new Error(signUpError.message);

      alert("تم إنشاء الحساب بنجاح ✅");
      window.location.href = "/"; // redirect after signup
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm text-center">
        <h2 className="text-xl font-bold mb-4">تحقق من بريدك الإلكتروني</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <input
          type="text"
          placeholder="أدخل رمز التحقق"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
        <input
          type="password"
          placeholder="كلمة المرور لإنشاء الحساب"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-mint text-darkgreen py-2 rounded font-semibold hover:bg-darkgreen hover:text-white transition"
        >
          {loading ? "جاري التحقق..." : "إنشاء الحساب"}
        </button>
      </div>
    </div>
  );
}
