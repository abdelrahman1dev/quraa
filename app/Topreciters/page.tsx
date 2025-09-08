"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "../lib/supabaseClient";

interface Reciter {
  id: number;
  name: string;
  image?: string;
  district: string;
  sample_link: string;
  mosque_link: string;
  created_at: string;
  favorite_count: number;
}

interface FavoriteWithReciter {
  reader_id: number;
  readers: {
    id: number;
    name: string;
    image?: string;
    district: string;
    sample_link: string;
    mosque_link: string;
    created_at: string;
  };
}

enum LoadingState {
  IDLE = "idle",
  LOADING = "loading",
  ERROR = "error",
}

function TopReciters() {
  const [topReciters, setTopReciters] = useState<Reciter[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.LOADING);

  const fetchTopReciters = useCallback(async () => {
    setLoadingState(LoadingState.LOADING);
    
    try {
      // Get favorites with reader information
      const { data: favoritesData, error: favoritesError } = await supabase
        .from("favorites")
        .select(`
          reader_id,
          readers:reader_id (
            id,
            name,
            image,
            district,
            sample_link,
            mosque_link,
            created_at
          )
        `);

      if (favoritesError) throw favoritesError;

      if (!favoritesData || favoritesData.length === 0) {
        // If no favorites, get the 3 most recent reciters
        const { data: recentReciters, error: recentError } = await supabase
          .from("readers")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(3);

        if (recentError) throw recentError;

        const recitersWithCount = (recentReciters || []).map(reciter => ({
          ...reciter,
          favorite_count: 0
        }));

        setTopReciters(recitersWithCount);
        setLoadingState(LoadingState.IDLE);
        return;
      }

      // Count favorites for each reciter
      const favoriteCountsMap: { [key: number]: number } = {};
      const recitersMap: { [key: number]: Reciter } = {};

      favoritesData.forEach((favorite: FavoriteWithReciter) => {
        if (favorite.readers) {
          const readerId = favorite.reader_id;
          favoriteCountsMap[readerId] = (favoriteCountsMap[readerId] || 0) + 1;
          
          if (!recitersMap[readerId]) {
            recitersMap[readerId] = {
              ...favorite.readers,
              favorite_count: 0
            };
          }
        }
      });

      // Create array of reciters with their favorite counts
      const recitersWithCounts = Object.keys(recitersMap).map(readerId => {
        const id = parseInt(readerId);
        return {
          ...recitersMap[id],
          favorite_count: favoriteCountsMap[id] || 0
        };
      });

      // Sort by favorite count and take top 3
      const topThree = recitersWithCounts
        .sort((a, b) => b.favorite_count - a.favorite_count)
        .slice(0, 3);

      // If we have less than 3, fill with recent reciters
      if (topThree.length < 3) {
        const existingIds = topThree.map(r => r.id);
        const { data: additionalReciters } = await supabase
          .from("readers")
          .select("*")
          .not("id", "in", `(${existingIds.join(",")})`)
          .order("created_at", { ascending: false })
          .limit(3 - topThree.length);

        if (additionalReciters) {
          const additionalWithCount = additionalReciters.map(reciter => ({
            ...reciter,
            favorite_count: 0
          }));
          topThree.push(...additionalWithCount);
        }
      }

      setTopReciters(topThree);
      setLoadingState(LoadingState.IDLE);
    } catch (error) {
      console.error("Error fetching top reciters:", error);
      setLoadingState(LoadingState.ERROR);
    }
  }, []);

  useEffect(() => {
    fetchTopReciters();
  }, [fetchTopReciters]);

  // Loading state
  if (loadingState === LoadingState.LOADING) {
    return (
      <section dir="rtl" className="w-full py-12 px-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-right">أبرز القراء</h2>
        </div>
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">جاري تحميل أبرز القراء...</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (loadingState === LoadingState.ERROR) {
    return (
      <section dir="rtl" className="w-full py-12 px-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-right">أبرز القراء</h2>
        </div>
        <div className="flex flex-col justify-center items-center min-h-[300px]">
          <p className="text-destructive mb-4">حدث خطأ أثناء تحميل أبرز القراء</p>
          <Button onClick={fetchTopReciters} variant="outline">
            إعادة المحاولة
          </Button>
        </div>
      </section>
    );
  }

  // Empty state
  if (topReciters.length === 0) {
    return (
      <section dir="rtl" className="w-full py-12 px-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-right">أبرز القراء</h2>
        </div>
        <div className="flex flex-col justify-center items-center min-h-[300px]">
          <p className="text-muted-foreground mb-4">لا يوجد قراء حالياً</p>
          <Button onClick={fetchTopReciters} variant="outline">
            إعادة تحديث
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section dir="rtl" className="w-full py-12 px-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-right">
          أبرز القراء
          <span className="text-sm font-normal text-muted-foreground mr-2">
            (الأكثر إعجاباً)
          </span>
        </h2>
      </div>

      {/* Desktop grid */}
      <div className="hidden sm:grid grid-cols-3 gap-6">
        {topReciters.map((reciter, idx) => (
          <Dialog key={reciter.id}>
            <DialogTrigger asChild>
              <div className="bg-card shadow-lg rounded-2xl p-4 text-center cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200 border relative">
                {/* Ranking badge */}
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                  {idx + 1}
                </div>
                
                {/* Favorite count badge */}
                {reciter.favorite_count > 0 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                    ❤️ {reciter.favorite_count}
                  </div>
                )}

                <Image
                  src={
                    reciter.image ||
                    `https://avatar.iran.liara.run/public/${reciter.id + 20}`
                  }
                  alt={`صورة القارئ ${reciter.name}`}
                  width={200}
                  height={200}
                  className="rounded-full mx-auto object-cover ring-2 ring-border"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7Dh5zVlaHWR7kt9EUEDiKzDZD8xSGHxN2rji7J85nF2nDCJHLuBWO59pNJXj2xG23"
                />
                <h3 className="mt-4 font-bold text-lg">{reciter.name}</h3>
                <p className="text-muted-foreground">{reciter.district}</p>
              </div>
            </DialogTrigger>
            
            <DialogContent className="text-right">
              <DialogHeader>
                <DialogTitle>{reciter.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <div>
                  <span className="font-semibold">الحي: </span>
                  <span className="text-muted-foreground">{reciter.district}</span>
                </div>
                <div>
                  <span className="font-semibold">عدد الإعجابات: </span>
                  <span className="text-red-500 font-medium">{reciter.favorite_count}</span>
                </div>
                <div>
                  <span className="font-semibold">نموذج التلاوة: </span>
                  <a
                    href={reciter.sample_link}
                    className="text-primary underline hover:no-underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    استمع هنا
                  </a>
                </div>
                <div>
                  <span className="font-semibold">موقع المسجد: </span>
                  <a
                    href={reciter.mosque_link}
                    className="text-primary underline hover:no-underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    افتح الخريطة
                  </a>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {/* Mobile horizontal scroll */}
      <div className="flex sm:hidden gap-4 overflow-x-auto flex-nowrap scroll-smooth pb-4 scrollbar-hide">
        {topReciters.map((reciter, idx) => (
          <Dialog key={reciter.id}>
            <DialogTrigger asChild>
              <div className="min-w-[220px] bg-card shadow-lg rounded-2xl p-4 text-center cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200 border relative flex-shrink-0">
                {/* Ranking badge */}
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                  {idx + 1}
                </div>
                
                {/* Favorite count badge */}
                {reciter.favorite_count > 0 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                    ❤️ {reciter.favorite_count}
                  </div>
                )}

                <Image
                  src={
                    reciter.image ||
                    `https://avatar.iran.liara.run/public/${reciter.id + 20}`
                  }
                  alt={`صورة القارئ ${reciter.name}`}
                  width={150}
                  height={150}
                  className="rounded-full mx-auto object-cover ring-2 ring-border"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7Dh5zVlaHWR7kt9EUEDiKzDZD8xSGHxN2rji7J85nF2nDCJHLuBWO59pNJXj2xG23"
                />
                <h3 className="mt-4 font-bold text-lg">{reciter.name}</h3>
                <p className="text-muted-foreground">{reciter.district}</p>
              </div>
            </DialogTrigger>
            
            <DialogContent className="text-right">
              <DialogHeader>
                <DialogTitle>{reciter.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <div>
                  <span className="font-semibold">الحي: </span>
                  <span className="text-muted-foreground">{reciter.district}</span>
                </div>
                <div>
                  <span className="font-semibold">عدد الإعجابات: </span>
                  <span className="text-red-500 font-medium">{reciter.favorite_count}</span>
                </div>
                <div>
                  <span className="font-semibold">نموذج التلاوة: </span>
                  <a
                    href={reciter.sample_link}
                    className="text-primary underline hover:no-underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    استمع هنا
                  </a>
                </div>
                <div>
                  <span className="font-semibold">موقع المسجد: </span>
                  <a
                    href={reciter.mosque_link}
                    className="text-primary underline hover:no-underline"
                    target="_blank"
                    rel="noopener noreferrer"
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

export default TopReciters;