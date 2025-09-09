"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
import UploadImage from "../components/UploadImage";

export default function ProfilePage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const fetchProfile = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("first_name, last_name, avatar_url")
      .eq("id", session.user.id)
      .single();

    if (data) {
      setFirstName(data.first_name || "");
      setLastName(data.last_name || "");
      setPhotoUrl(data.avatar_url || null);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [router]);

  const handleUpdate = async () => {
    setError(null);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setError("User not logged in.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        avatar_url: photoUrl,
      })
      .eq("id", session.user.id);

    if (error) {
      setError("Failed to update profile.");
      console.log(error)
    } else {
      alert("Profile updated successfully.");
      fetchProfile();
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account?")) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setError("User not logged in.");
      return;
    }

    const userId = session.user.id;

    await supabase.from("profiles").delete().eq("id", userId);
    await supabase.auth.signOut();

    alert("Account deleted successfully.");
    router.push("/");
  };

  return (
    <div className="max-w-md mx-auto mt-35 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">تعديل الملف الشخصي</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <label className="block mb-2 font-semibold">الاسم الأول</label>
      <input
        type="text"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      <label className="block mb-2 font-semibold">الاسم الأخير</label>
      <input
        type="text"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      <label className="block mb-2 font-semibold">صورة الملف الشخصي</label>
      {photoUrl && (
        <img src={photoUrl} alt="Profile" className="w-24 h-24 rounded-full mb-4 object-cover" />
      )}
      <UploadImage onUpload={setPhotoUrl} />

      <button
        onClick={handleUpdate}
        className="mt-6 w-full bg-mint text-darkgreen py-2 rounded font-semibold hover:bg-darkgreen hover:text-white transition"
      >
        تحديث الملف الشخصي
      </button>

      <button
        onClick={handleDeleteAccount}
        className="mt-4 w-full bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700 transition"
      >
        حذف الحساب
      </button>
    </div>
  );
}
