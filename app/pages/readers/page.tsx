"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "../../lib/supabaseClient"; // your supabase client

const ITEMS_PER_PAGE = 6;

interface Reciter {
  id: number;
  name: string;
  image?: string;
  district: string;
  sample_link: string;
  mosque_link: string;
  created_at: string;
}

function RecitersSection() {
  const [readers, setReaders] = useState<Reciter[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Fetch readers from Supabase
  useEffect(() => {
    const fetchReaders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("readers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching readers:", error.message);
      } else {
        setReaders(data || []);
      }
      setLoading(false);
    };

    fetchReaders();
  }, []);

  const totalPages = Math.ceil(readers.length / ITEMS_PER_PAGE);
  const startIdx = (page - 1) * ITEMS_PER_PAGE;
  const currentItems = readers.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  if (loading) return <p className="text-center mt-10">جاري التحميل...</p>;

  return (
    <section className="w-full py-35 px-6">
      <h2 className="text-2xl font-bold text-right mb-6">قائمة القراء</h2>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map((reciter) => (
          <Dialog key={reciter.id}>
            <DialogTrigger asChild>
              <div className="bg-white shadow-md rounded-2xl p-4 text-center hover:shadow-lg transition cursor-pointer">
                <Image
                  src={reciter.image || `https://avatar.iran.liara.run/public/${reciter.id + 20}`} // fallback image
                  alt={reciter.name}
                  width={120}
                  height={120}
                  className="rounded-full mx-auto"
                />
                <h3 className="mt-4 font-bold text-lg">{reciter.name}</h3>
                <p className="text-gray-600">{reciter.district}</p>
              </div>
            </DialogTrigger>
            <DialogContent className="text-right">
              <DialogHeader>
                <DialogTitle>{reciter.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <p>
                  <strong>الحي:</strong> {reciter.district}
                </p>
                <p>
                  <strong>المسجد:</strong> {reciter.mosque_link}
                </p>
                <p>
                  <strong>نموذج التلاوة:</strong>{" "}
                  <a
                    href={reciter.sample_link}
                    target="_blank"
                    className="text-mint underline"
                  >
                    استمع هنا
                  </a>
                </p>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-4 mt-8">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          السابق
        </Button>
        <span className="text-sm font-medium">
          الصفحة {page} من {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          التالي
        </Button>
      </div>
    </section>
  );
}

export default RecitersSection;
