"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "../lib/supabaseClient";

interface Reciter {
  id: number;
  name: string;
  image?: string;
  district: string;
  sample_link: string; // Updated to match your schema
  mosque_link: string; // Updated to match your schema
  created_at: string;
}

enum LoadingState {
  IDLE = "idle",
  LOADING = "loading",
  ERROR = "error",
}

function LatestReciters() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.LOADING);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position to show/hide navigation arrows
  const checkScrollPosition = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // 10px tolerance
    }
  }, []);

  // Fetch latest 3 readers from Supabase
  const fetchLatestReciters = useCallback(async () => {
    setLoadingState(LoadingState.LOADING);
    try {
      const { data, error } = await supabase
        .from("readers")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) {
        throw error;
      }
      
      setReciters(data || []);
      setLoadingState(LoadingState.IDLE);
      
      // Check scroll position after data loads
      setTimeout(checkScrollPosition, 100);
    } catch (error) {
      console.error("Error fetching latest reciters:", error);
      setLoadingState(LoadingState.ERROR);
    }
  }, [checkScrollPosition]);

  useEffect(() => {
    fetchLatestReciters();
  }, [fetchLatestReciters]);

  // Add scroll event listener
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", checkScrollPosition);
      // Initial check
      checkScrollPosition();
      
      return () => {
        scrollElement.removeEventListener("scroll", checkScrollPosition);
      };
    }
  }, [checkScrollPosition, reciters.length]);

  const scroll = useCallback((direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  }, []);

  // Loading state
  if (loadingState === LoadingState.LOADING) {
    return (
      <section className="relative max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">جاري تحميل أحدث القراء...</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (loadingState === LoadingState.ERROR) {
    return (
      <section className="relative max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col justify-center items-center min-h-[200px]">
          <p className="text-destructive mb-4">حدث خطأ أثناء تحميل أحدث القراء</p>
          <button
            onClick={fetchLatestReciters}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </section>
    );
  }

  // Empty state
  if (reciters.length === 0) {
    return (
      <section className="relative max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col justify-center items-center min-h-[200px]">
          <p className="text-muted-foreground mb-4">لا يوجد قراء حالياً</p>
          <button
            onClick={fetchLatestReciters}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            إعادة تحديث
          </button>
        </div>
      </section>
    );
  }

  return (
    <section dir="rtl" className="relative max-w-7xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary">أحدث القراء</h2>

        {/* Navigation Arrows - Only show if there are items to scroll */}
        {reciters.length > 1 && (
          <div className="flex gap-2">
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="bg-secondary text-secondary-foreground p-2 rounded-full shadow-md hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="التالي"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="bg-secondary text-secondary-foreground p-2 rounded-full shadow-md hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="السابق"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Reciters List */}
      <div 
        ref={scrollRef} 
        className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {reciters.map((reciter) => (
          <Dialog key={reciter.id}>
            <DialogTrigger asChild>
              <div
                className="min-w-[200px] flex-shrink-0 bg-card rounded-2xl shadow-md p-4 text-center hover:scale-105 hover:shadow-lg transition-all duration-200 cursor-pointer border"
                onClick={() => setSelectedReciter(reciter)}
              >
                <div className="w-32 h-32 mx-auto relative rounded-full overflow-hidden ring-2 ring-border">
                  <Image
                    src={
                      reciter.image ||
                      `https://avatar.iran.liara.run/public/${reciter.id + 30}`
                    }
                    alt={`صورة القارئ ${reciter.name}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 128px, 128px"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7Dh5zVlaHWR7kt9EUEDiKzDZD8xSGHxN2rji7J85nF2nDCJHLuBWO59pNJXj2xG23"
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {reciter.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {reciter.district}
                </p>
              </div>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md text-right">
              <DialogHeader>
                <DialogTitle>{selectedReciter?.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <span className="font-semibold">اسم الحي: </span>
                  <span className="text-muted-foreground">{selectedReciter?.district}</span>
                </div>
                <div>
                  <span className="font-semibold">نموذج التلاوة: </span>
                  <a
                    href={selectedReciter?.sample_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:no-underline"
                  >
                    استمع
                  </a>
                </div>
                <div>
                  <span className="font-semibold">موقع المسجد: </span>
                  <a
                    href={selectedReciter?.mosque_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:no-underline"
                  >
                    افتح الخريطة
                  </a>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

export default LatestReciters;