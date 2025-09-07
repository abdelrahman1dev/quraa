"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Dummy reciters data
const reciters = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  name: `القارئ ${i + 1}`,
  district: `حي ${i + 1}`,
  mosque: `مسجد ${i + 1}`,
  sample: `https://www.youtube.com/watch?v=demo${i + 1}`,
  image: `https://avatar.iran.liara.run/public/${i + 30}`,
}));

const ITEMS_PER_PAGE = 6;

function RecitersSection() {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(reciters.length / ITEMS_PER_PAGE);
  const startIdx = (page - 1) * ITEMS_PER_PAGE;
  const currentItems = reciters.slice(startIdx, startIdx + ITEMS_PER_PAGE);

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
                  src={reciter.image}
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
                  <strong>المسجد:</strong> {reciter.mosque}
                </p>
                <p>
                  <strong>نموذج التلاوة:</strong>{" "}
                  <a
                    href={reciter.sample}
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
