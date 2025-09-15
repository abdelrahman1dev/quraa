"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Request = {
  id: string;
  name: string;
  sample_link: string;
  district: string;
  mosque_link: string;
  created_at: string;
};

function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching requests:", error.message);
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel("requests-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "requests" },
        () => fetchRequests()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ✅ Add request to reciters
  const handleAddReciter = async (req: Request) => {
    const { error } = await supabase.from("readers").insert([
      {
        name: req.name,
        sample_link: req.sample_link,
        district: req.district,
        mosque_link: req.mosque_link,
        image: "https://avatar.iran.liara.run/public/50", // default avatar
      },
    ]);

    if (error) {
      alert("خطأ في الإضافة: " + error.message);
    } else {
      toast.success("تمت الاضافة بنجاح")
      await handleDeleteRequest(req.id); // remove request after adding
    }
  };

  // ✅ Delete request
  const handleDeleteRequest = async (id: string) => {
    const { error } = await supabase.from("requests").delete().eq("id", id);
    if (error) {
      alert("خطأ في الحذف: " + error.message);
    } else {
      setRequests((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-4">طلبات إضافة قارئ</h1>

      {loading ? (
        <p>جارٍ التحميل...</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-500">لا توجد طلبات بعد.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="border rounded-lg p-4 shadow-sm bg-white flex flex-col gap-2"
            >
              <h2 className="text-lg font-semibold">{req.name}</h2>
              <p>
                <span className="font-bold">الحي:</span> {req.district}
              </p>
              <p>
                <span className="font-bold">موقع المسجد:</span>{" "}
                <a
                  href={req.mosque_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mint underline"
                >
                  افتح الخريطة
                </a>
              </p>
              <p>
                <span className="font-bold">نموذج التلاوة:</span>{" "}
                <a
                  href={req.sample_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mint underline"
                >
                  استمع
                </a>
              </p>
              <div className="flex gap-3 mt-3">
                <Button
                  onClick={() => handleAddReciter(req)}
                  className="bg-mint text-darkgreen hover:bg-darkgreen hover:text-white"
                >
                  إضافة للقائمة
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteRequest(req.id)}
                >
                  حذف
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RequestsPage;
