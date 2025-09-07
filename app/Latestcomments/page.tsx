"use client";
import React from "react";

// Dummy Arabic comments
const comments = [
  {
    id: 1,
    name: "أحمد",
    message: "جزاكم الله خيرًا على هذه المنصة الرائعة!",
    date: "قبل ٣ أيام",
  },
  {
    id: 2,
    name: "فاطمة",
    message: "استمعت لتلاوة جميلة جدًا، بارك الله فيكم.",
    date: "قبل يوم",
  },
  {
    id: 3,
    name: "محمد",
    message: "موقع ممتاز وسهل الاستخدام، بالتوفيق إن شاء الله.",
    date: "الآن",
  },
];

function Latestcomments() {
  return (
    <section dir="rtl" className="max-w-7xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold text-darkgreen mb-6">أحدث التعليقات</h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-cream rounded-2xl shadow-md p-6 hover:shadow-lg transition"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-darkgreen">
                {comment.name}
              </h3>
              <span className="text-sm text-gray-500">{comment.date}</span>
            </div>
            <p className="text-gray-700 leading-relaxed">{comment.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Latestcomments;
