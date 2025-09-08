"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "../lib/supabaseClient"; // your Supabase client

interface Reciter {
  id: number;
  name: string;
  image?: string;
  district: string;
  sample: string;
  mosque: string;
  created_at: string;
}

function Latestreciters() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch latest 3 readers from Supabase
  useEffect(() => {
    const fetchLatestReciters = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("readers")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) {
        console.error("Error fetching latest reciters:", error.message);
      } else {
        setReciters(data || []);
      }
      setLoading(false);
    };

    fetchLatestReciters();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  if (loading) return <p className="text-center mt-10">جاري التحميل...</p>;

  return (
    <section dir="rtl" className="relative max-w-7xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-darkgreen">أحدث القراء</h2>

        {/* Navigation Arrows */}
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
      <div ref={scrollRef} className="flex gap-6 scroll-smooth">
        {reciters.map((reciter) => (
          <Dialog key={reciter.id}>
            <DialogTrigger asChild>
              <div
                className="min-w-[200px] flex-shrink-0 bg-cream rounded-2xl shadow-md p-4 text-center hover:scale-105 transition cursor-pointer"
                onClick={() => setSelectedReciter(reciter)}
              >
                <div className="w-32 h-32 mx-auto relative rounded-full overflow-hidden border-4 border-mint">
                  <Image
                    src={
                      reciter.image ||
                      `https://avatar.iran.liara.run/public/${reciter.id + 30}`
                    }
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

export default Latestreciters;
