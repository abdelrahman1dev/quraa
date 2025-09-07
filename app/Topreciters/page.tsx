"use client";
import React from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const reciters = [
  {
    name: "الشيخ أحمد العجمي",
    district: "حي النزهة",
    mosque: "مسجد النور",
    sample: "https://www.youtube.com/watch?v=xyz",
    image: "https://avatar.iran.liara.run/public/37",
  },
  {
    name: "الشيخ ماهر المعيقلي",
    district: "حي الملك فهد",
    mosque: "مسجد الملك خالد",
    sample: "https://www.youtube.com/watch?v=xyz",
    image: "https://avatar.iran.liara.run/public/35",
  },
  {
    name: "الشيخ سعد الغامدي",
    district: "حي الشفا",
    mosque: "مسجد الفرقان",
    sample: "https://www.youtube.com/watch?v=xyz",
    image: "https://avatar.iran.liara.run/public/36",
  },
];

function Topreciters() {
  return (
    <section dir="rtl" className="w-full py-12 px-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-right">أبرز القراء</h2>
      </div>

      {/* Desktop grid */}
      <div className="hidden sm:grid grid-cols-3 gap-6">
        {reciters.map((reciter, idx) => (
          <Dialog key={idx}>
            <DialogTrigger>
              <div className="bg-white shadow-lg rounded-2xl p-4 text-center cursor-pointer hover:shadow-xl transition">
                <Image
                  src={reciter.image}
                  alt={reciter.name}
                  width={200}
                  height={200}
                  className="rounded-full mx-auto"
                />
                <h3 className="mt-4 font-bold text-lg">{reciter.name}</h3>
                <p className="text-gray-600">{reciter.district}</p>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{reciter.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 text-right">
                <p>
                  <strong>الحي:</strong> {reciter.district}
                </p>
                <p>
                  <strong>المسجد:</strong> {reciter.mosque}
                </p>
                <p>
                  <strong>نموذج التلاوة:</strong>{" "}
                  <a
                    href={reciter.sample}
                    className="text-mint underline"
                    target="_blank"
                  >
                    استمع هنا
                  </a>
                </p>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {/* Mobile horizontal scroll */}
      <div className="flex sm:hidden gap-4 overflow-x-auto flex-nowrap scroll-smooth pb-4 no-scrollbar">
        {reciters.map((reciter, idx) => (
          <Dialog key={idx}>
            <DialogTrigger>
              <div className="min-w-[220px] bg-white shadow-lg rounded-2xl p-4 text-center cursor-pointer hover:shadow-xl transition">
                <Image
                  src={reciter.image}
                  alt={reciter.name}
                  width={150}
                  height={150}
                  className="rounded-full mx-auto"
                />
                <h3 className="mt-4 font-bold text-lg">{reciter.name}</h3>
                <p className="text-gray-600">{reciter.district}</p>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{reciter.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 text-right">
                <p>
                  <strong>الحي:</strong> {reciter.district}
                </p>
                <p>
                  <strong>المسجد:</strong> {reciter.mosque}
                </p>
                <p>
                  <strong>نموذج التلاوة:</strong>{" "}
                  <a
                    href={reciter.sample}
                    className="text-mint underline"
                    target="_blank"
                  >
                    استمع هنا
                  </a>
                </p>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </section>
  );
}

export default Topreciters;
