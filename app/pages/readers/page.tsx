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
import { supabase } from "../../lib/supabaseClient";
import { Heart } from "lucide-react"; // icon for favorite

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

function ReadersSection() {
  const [readers, setReaders] = useState<Reader[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]); // reader IDs user favorited
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);

  // ✅ Get logged in user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) setUserId(data.user.id);
    };
    getUser();
  }, []);

  // ✅ Fetch readers
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

  // ✅ Fetch favorites of current user
  useEffect(() => {
    if (!userId) return;

    const fetchFavorites = async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("reader_id")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching favorites:", error.message);
      } else {
        setFavorites(data.map((f) => f.reader_id));
      }
    };

    fetchFavorites();
  }, [userId]);

  // ✅ Toggle favorite
  const toggleFavorite = async (readerId: number) => {
    if (!userId) {
      alert("يجب تسجيل الدخول لإضافة المفضلة ⭐");
      return;
    }

    const isFavorited = favorites.includes(readerId);

    if (isFavorited) {
      // remove favorite
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("reader_id", readerId);

      if (!error) {
        setFavorites((prev) => prev.filter((id) => id !== readerId));
      }
    } else {
      // add favorite
      const { error } = await supabase
        .from("favorites")
        .insert([{ user_id: userId, reader_id: readerId }]);

      if (!error) {
        setFavorites((prev) => [...prev, readerId]);
      }
    }
  };

  const totalPages = Math.ceil(readers.length / ITEMS_PER_PAGE);
  const startIdx = (page - 1) * ITEMS_PER_PAGE;
  const currentItems = readers.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  if (loading) return <p className="text-center mt-40">جاري التحميل...</p>;

  return (
    <section className="w-full py-35 px-6">
      <h2 className="text-2xl font-bold text-right mb-6">قائمة القراء</h2>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map((reader) => (
          <Dialog key={reader.id}>
            <DialogTrigger asChild>
              <div className="bg-white shadow-md rounded-2xl p-4 text-center hover:shadow-lg transition cursor-pointer relative">
                <Image
                  src={
                    reader.image ||
                    `https://avatar.iran.liara.run/public/${reader.id + 20}`
                  }
                  alt={reader.name}
                  width={120}
                  height={120}
                  className="rounded-full mx-auto"
                />
                <h3 className="mt-4 font-bold text-lg">{reader.name}</h3>
                <p className="text-gray-600">{reader.district}</p>

                {/* ⭐ Favorite button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // prevent dialog opening
                    toggleFavorite(reader.id);
                  }}
                  className="absolute top-3 right-3"
                >
                  <Heart
                    className={`w-6 h-6 ${
                      favorites.includes(reader.id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-400"
                    }`}
                  />
                </button>
              </div>
            </DialogTrigger>
            <DialogContent className="text-right">
              <DialogHeader>
                <DialogTitle>{reader.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <p>
                  <strong>الحي:</strong> {reader.district}
                </p>
                <p>
                  <strong>المسجد:</strong>{" "}
                  <a
                    href={reader.mosque_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-mint underline"
                  >
                    افتح الخريطة
                  </a>
                </p>
                <p>
                  <strong>نموذج التلاوة:</strong>{" "}
                  <a
                    href={reader.sample_link}
                    target="_blank"
                    rel="noopener noreferrer"
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

export default ReadersSection;
