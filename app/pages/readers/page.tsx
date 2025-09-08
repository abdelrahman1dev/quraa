"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 6;

interface Reader {
  id: number;
  name: string;
  image?: string;
  district: string;
  sample_link: string;
  mosque_link: string;
  created_at: string;
}

enum LoadingState {
  IDLE = "idle",
  LOADING = "loading",
  ERROR = "error",
}

export default function ReadersSection() {
  const [readers, setReaders] = useState<Reader[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [loadingState, setLoadingState] = useState<LoadingState>(
    LoadingState.LOADING
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Initialize auth and load user favorites
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (mounted) setUserId(session?.user?.id || null);
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };

    initialize();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) setUserId(session?.user?.id || null);
      }
    );

    return () => {
      mounted = false;
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  // Fetch readers and favorites
  const loadData = useCallback(async () => {
    setLoadingState(LoadingState.LOADING);
    try {
      const { data: readersData, error: readersError } = await supabase
        .from("readers")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (readersError) throw readersError;
      setReaders(readersData || []);

      if (userId) {
        const { data: favData, error: favError } = await supabase
          .from("favorites")
          .select("reader_id")
          .eq("user_id", userId);
        
        if (favError) throw favError;
        setFavorites(new Set(favData?.map((f) => f.reader_id) || []));
      } else {
        setFavorites(new Set());
      }

      setLoadingState(LoadingState.IDLE);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error loading data:", err);
      setLoadingState(LoadingState.ERROR);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleFavorite = useCallback(
    async (readerId: number) => {
      if (!userId) {
        toast?.error?.("يجب تسجيل الدخول") || alert("يجب تسجيل الدخول");
        return;
      }

      const isFav = favorites.has(readerId);
      const newSet = new Set(favorites);

      try {
        if (isFav) {
          const { error } = await supabase
            .from("favorites")
            .delete()
            .eq("user_id", userId)
            .eq("reader_id", readerId);
          
          if (error) throw error;
          newSet.delete(readerId);
          toast?.success?.("تم إزالة القارئ من المفضلة");
        } else {
          const { error } = await supabase
            .from("favorites")
            .insert([{ user_id: userId, reader_id: readerId }]);
          
          if (error) throw error;
          newSet.add(readerId);
          toast?.success?.("تم إضافة القارئ إلى المفضلة");
        }
        setFavorites(newSet);
      } catch (err) {
        console.error("Error toggling favorite:", err);
        toast?.error?.("حدث خطأ أثناء تحديث المفضلة") ||
          alert("حدث خطأ أثناء تحديث المفضلة");
      }
    },
    [favorites, userId]
  );

  const toggleFavoritesView = useCallback(() => {
    setShowFavoritesOnly((prev) => !prev);
    setCurrentPage(1);
  }, []);

  const filteredReaders = useMemo(
    () =>
      showFavoritesOnly
        ? readers.filter((reader) => favorites.has(reader.id))
        : readers,
    [readers, favorites, showFavoritesOnly]
  );

  const totalPages = Math.ceil(filteredReaders.length / ITEMS_PER_PAGE);
  const currentItems = filteredReaders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  }, [totalPages]);

  // Loading state
  if (loadingState === LoadingState.LOADING) {
    return (
      <section className="flex justify-center items-center min-h-[400px] py-20">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">جاري تحميل القراء...</p>
        </div>
      </section>
    );
  }

  // Error state
  if (loadingState === LoadingState.ERROR) {
    return (
      <section className="flex flex-col justify-center items-center min-h-[400px] py-20">
        <p className="text-destructive mb-4">حدث خطأ أثناء تحميل البيانات</p>
        <Button onClick={loadData}>إعادة المحاولة</Button>
      </section>
    );
  }

  // Empty favorites state
  if (showFavoritesOnly && favorites.size === 0) {
    return (
      <section className="flex flex-col justify-center items-center min-h-[400px] py-20">
        <Heart className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-2">لا توجد مفضلة</p>
        <p className="text-muted-foreground mb-4">
          لم تقم بإضافة أي قراء إلى المفضلة بعد
        </p>
        <Button onClick={toggleFavoritesView}>عرض جميع القراء</Button>
      </section>
    );
  }

  // No readers state
  if (readers.length === 0) {
    return (
      <section className="flex flex-col justify-center items-center min-h-[400px] py-20">
        <p className="text-lg font-medium mb-2">لا يوجد قراء</p>
        <Button onClick={loadData} variant="outline">إعادة تحديث</Button>
      </section>
    );
  }

  return (
    <section className="w-full mt-30 py-10 px-6">
      <div className="flex flex-row-reverse justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-right">
          قائمة القراء
          {showFavoritesOnly && (
            <span className="text-lg font-normal text-muted-foreground mr-2">
              ({favorites.size} مفضل)
            </span>
          )}
        </h2>
        <Button
          onClick={toggleFavoritesView}
          variant={showFavoritesOnly ? "default" : "outline"}
          disabled={favorites.size === 0 && !showFavoritesOnly}
        >
          {showFavoritesOnly ? "عرض الكل" : `عرض المفضلة (${favorites.size})`}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map((reader) => (
          <Dialog key={reader.id}>
            <DialogTrigger asChild>
              <div className="relative bg-card shadow-sm rounded-2xl p-6 text-center hover:shadow-md cursor-pointer border group transition-all duration-200">
                {/* Heart button */}
                <button
                  className="absolute top-3 right-3 p-2 rounded-full hover:bg-muted transition-colors z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(reader.id);
                  }}
                  aria-label={
                    favorites.has(reader.id)
                      ? "إزالة من المفضلة"
                      : "إضافة إلى المفضلة"
                  }
                >
                  <Heart
                    className="h-5 w-5 transition-colors"
                    fill={favorites.has(reader.id) ? "#FF0000" : "none"}
                    color={favorites.has(reader.id) ? "#FF0000" : "#FF0000" }
                  />
                </button>

                <Image
                  src={
                    reader.image ||
                    `https://avatar.iran.liara.run/public/${reader.id + 20}`
                  }
                  alt={`صورة القارئ ${reader.name}`}
                  width={120}
                  height={120}
                  className="rounded-full mx-auto object-cover ring-2 ring-border group-hover:ring-primary transition-colors"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7Dh5zVlaHWR7kt9EUEDiKzDZD8xSGHxN2rji7J85nF2nDCJHLuBWO59pNJXj2xG23"
                />
                <h3 className="font-bold text-lg mt-4">{reader.name}</h3>
                <p className="text-muted-foreground text-sm">{reader.district}</p>
              </div>
            </DialogTrigger>

            <DialogContent className="text-right max-w-md">
              <DialogHeader>
                <DialogTitle>{reader.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <div>
                  <span className="font-semibold">الحي: </span>
                  {reader.district}
                </div>
                <div>
                  <span className="font-semibold">المسجد: </span>
                  <a
                    href={reader.mosque_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:no-underline"
                  >
                    افتح الخريطة
                  </a>
                </div>
                <div>
                  <span className="font-semibold">نموذج التلاوة: </span>
                  <a
                    href={reader.sample_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:no-underline"
                  >
                    استمع هنا
                  </a>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button 
            variant="outline" 
            onClick={goToPreviousPage} 
            disabled={currentPage === 1}
            size="sm"
          >
            السابق
          </Button>
          <span className="px-4 py-2 bg-muted rounded-md text-sm">
            الصفحة {currentPage} من {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            size="sm"
          >
            التالي
          </Button>
        </div>
      )}
    </section>
  );
}