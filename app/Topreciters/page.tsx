"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Dummy Arabic data
const reciters = [
  {
    id: 1,
    name: "الشيخ عبد الرحمن السديس",
    image: "/reciters/sudais.jpg",
    sample: "https://www.youtube.com/watch?v=dummy1",
    district: "حي العزيزية",
    mosque: "https://maps.google.com/?q=Masjid+Sudais",
  },
  {
    id: 2,
    name: "الشيخ مشاري العفاسي",
    image: "/reciters/mishary.jpg",
    sample: "https://soundcloud.com/dummy2",
    district: "حي العليا",
    mosque: "https://maps.google.com/?q=Masjid+Mishary",
  },
  {
    id: 3,
    name: "الشيخ سعد الغامدي",
    image: "/reciters/saad.jpg",
    sample: "https://www.youtube.com/watch?v=dummy3",
    district: "حي الملك فهد",
    mosque: "https://maps.google.com/?q=Masjid+Saad",
  },
];

function Topreciters() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedReciter, setSelectedReciter] = useState<typeof reciters[0] | null>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  return (
    <section dir="rtl" className="relative max-w-7xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-darkgreen">أبرز القراء</h2>

        {/* Navigation Arrows (Top Right) */}
        <div className="flex gap-2">
          <button
            onClick={() => scroll("right")}
            className="bg-mint text-darkgreen p-2 rounded-full shadow-md hover:bg-darkgreen hover:text-white transition"
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={() => scroll("left")}
            className="bg-mint text-darkgreen p-2 rounded-full shadow-md hover:bg-darkgreen hover:text-white transition"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
      </div>

      {/* Reciters List */}
      <div
        ref={scrollRef}
        className="flex gap-6  scroll-smooth"
      >
        {reciters.map((reciter) => (
          <Dialog key={reciter.id}>
            <DialogTrigger asChild>
              <div
                className="min-w-[200px] flex-shrink-0 bg-cream rounded-2xl shadow-md p-4 text-center hover:scale-105 transition cursor-pointer"
                onClick={() => setSelectedReciter(reciter)}
              >
                <div className="w-32 h-32 mx-auto relative rounded-full overflow-hidden border-4 border-mint">
                  <Image
                    src={reciter.image}
                    alt={reciter.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-darkgreen">
                  {reciter.name}
                </h3>
              </div>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle>{selectedReciter?.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-darkgreen">
                <p>
                  <span className="font-bold">اسم الحي: </span>
                  {selectedReciter?.district}
                </p>
                <p>
                  <span className="font-bold">نموذج التلاوة: </span>
                  <a
                    href={selectedReciter?.sample}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-mint underline"
                  >
                    استمع
                  </a>
                </p>
                <p>
                  <span className="font-bold">موقع المسجد: </span>
                  <a
                    href={selectedReciter?.mosque}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-mint underline"
                  >
                    افتح الخريطة
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
