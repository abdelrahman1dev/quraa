"use client";
import React, { useState } from "react";

function NewComment() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 👉 later: send to Supabase
    console.log("New Comment:", { name, message });
    setName("");
    setMessage("");
  };

  return (
    <section
      dir="rtl"
      className="max-w-3xl mx-auto px-6 py-12 bg-cream rounded-2xl shadow-md w-full"
      id="add-comment"
    >
      <h2 className="text-2xl font-bold text-darkgreen mb-6">إضافة تعليق</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label
            htmlFor="name"
            className="block mb-2 text-sm font-medium text-darkgreen"
          >
            اسمك
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint focus:outline-none"
            placeholder="اكتب اسمك هنا"
          />
        </div>

        {/* Message Field */}
        <div>
          <label
            htmlFor="message"
            className="block mb-2 text-sm font-medium text-darkgreen"
          >
            رسالتك
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint focus:outline-none"
            placeholder="اكتب تعليقك هنا"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="px-6 py-3 bg-mint text-darkgreen font-semibold rounded-xl shadow-md hover:bg-darkgreen hover:text-white transition"
        >
          إرسال
        </button>
      </form>
    </section>
  );
}

export default NewComment;
