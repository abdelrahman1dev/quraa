"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  Users,
  Heart,
  Music,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";

interface Reciter {
  id: number;
  name: string;
  image?: string;
  district: string;
  sample_link: string;
  mosque_link: string;
  created_at: string;
}

interface DashboardStats {
  totalReciters: number;
  totalFavorites: number;
  recentReciters: number;
  mostFavorited: string;
}

interface FavoritedReciter {
  reader_id: number;
  readers: {
    name: string;
  }[];
}

type FormValues = {
  name: string;
  district: string;
  sample_link: string;
  mosque_link: string;
  image: string;
};

type FormActions = {
  setSubmitting: (isSubmitting: boolean) => void;
  resetForm: () => void;
};

const ReciterSchema = Yup.object().shape({
  name: Yup.string().min(2, "الاسم يجب أن يكون على الأقل حرفين").max(50, "الاسم يجب أن يكون أقل من 50 حرف").required("الاسم مطلوب"),
  district: Yup.string().min(2, "اسم الحي يجب أن يكون على الأقل حرفين").max(50, "اسم الحي يجب أن يكون أقل من 50 حرف").required("اسم الحي مطلوب"),
  sample_link: Yup.string().url("يجب إدخال رابط صحيح").required("رابط نموذج التلاوة مطلوب"),
  mosque_link: Yup.string().url("يجب إدخال رابط صحيح").required("رابط موقع المسجد مطلوب"),
  image: Yup.string().url("يجب إدخال رابط صحيح").nullable(),
});

const initialValues: FormValues = {
  name: "",
  district: "",
  sample_link: "",
  mosque_link: "",
  image: "",
};

export default function AdminDashboard() {
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalReciters: 0,
    totalFavorites: 0,
    recentReciters: 0,
    mostFavorited: "لا يوجد",
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingReciter, setEditingReciter] = useState<Reciter | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // ==================== FETCH STATS ====================
  const fetchStats = useCallback(async () => {
    try {
      // Total reciters
      const { count: totalReciters } = await supabase
        .from("readers")
        .select("*", { count: "exact", head: true });

      // Total favorites
      const { count: totalFavorites } = await supabase
        .from("favorites")
        .select("*", { count: "exact", head: true });

      // Recent reciters (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { count: recentReciters } = await supabase
        .from("readers")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thirtyDaysAgo.toISOString());

      // Fetch favorites with reciter info - Fixed query structure
      const { data: favoritedReciters, error: favoritesError } = await supabase
        .from("favorites")
        .select(`
          reader_id,
          readers!inner (
            name
          )
        `);

      if (favoritesError) {
        console.error("Error fetching favorites:", favoritesError);
      }

      // Build a map: reciter_id => { name, count }
      const favoriteCounts: Record<number, { name: string; count: number }> = {};
      
      if (favoritedReciters && Array.isArray(favoritedReciters)) {
        favoritedReciters.forEach((fav) => {
          const rid = fav.reader_id;
          const name = fav.readers && fav.readers[0]?.name;
          
          if (rid && name) {
            if (!favoriteCounts[rid]) {
              favoriteCounts[rid] = { name, count: 0 };
            }
            favoriteCounts[rid].count += 1;
          }
        });
      }

      // Find reciter with most favorites
      let mostFavoritedName = "لا يوجد";
      let maxCount = 0;
      
      for (const [idStr, data] of Object.entries(favoriteCounts)) {
        if (data.count > maxCount) {
          maxCount = data.count;
          mostFavoritedName = data.name;
        }
      }

      setStats({
        totalReciters: totalReciters || 0,
        totalFavorites: totalFavorites || 0,
        recentReciters: recentReciters || 0,
        mostFavorited: mostFavoritedName,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("حدث خطأ أثناء تحميل الإحصائيات");
    }
  }, []);

  const fetchReciters = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("readers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setReciters((data as unknown as Reciter[]) || []);
    } catch (error) {
      console.error("Error fetching reciters:", error);
      toast.error("حدث خطأ في تحميل القراء");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReciters();
    fetchStats();
  }, [fetchReciters, fetchStats]);

  // ==================== HANDLE ADD ====================
  const handleAddReciter = async (values: FormValues, actions: FormActions) => {
    try {
      const { error } = await supabase
        .from("readers")
        .insert([{ ...values, image: values.image || null }]);
      if (error) throw error;
      toast.success("تم إضافة القارئ بنجاح");
      actions.resetForm();
      setIsAddDialogOpen(false);
      fetchReciters();
      fetchStats();
    } catch (error) {
      console.error("Error adding reciter:", error);
      toast.error("حدث خطأ أثناء إضافة القارئ");
    } finally {
      actions.setSubmitting(false);
    }
  };

  // ==================== HANDLE UPDATE ====================
  const handleUpdateReciter = async (values: FormValues, actions: FormActions) => {
    if (!editingReciter) return;
    try {
      const { error } = await supabase
        .from("readers")
        .update({ ...values, image: values.image || null })
        .eq("id", editingReciter.id);
      if (error) throw error;
      toast.success("تم تحديث القارئ بنجاح");
      setIsEditDialogOpen(false);
      setEditingReciter(null);
      fetchReciters();
      fetchStats();
    } catch (error) {
      console.error("Error updating reciter:", error);
      toast.error("حدث خطأ أثناء تحديث القارئ");
    } finally {
      actions.setSubmitting(false);
    }
  };

  // ==================== HANDLE DELETE ====================
  const handleDeleteReciter = async (id: number) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا القارئ؟")) return;
    try {
      const { error } = await supabase.from("readers").delete().eq("id", id);
      if (error) throw error;
      toast.success("تم حذف القارئ بنجاح");
      setReciters(reciters.filter((r) => r.id !== id));
      fetchStats();
    } catch (error) {
      console.error("Error deleting reciter:", error);
      toast.error("حدث خطأ أثناء حذف القارئ");
    }
  };

  const filteredReciters = reciters.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ==================== FORM COMPONENT ====================
  const ReciterForm = ({
    reciter,
    onSubmit,
  }: {
    reciter?: Reciter;
    onSubmit: (values: FormValues, actions: FormActions) => Promise<void>;
  }) => (
    <Formik
      initialValues={reciter ? { ...reciter, image: reciter.image || "" } : initialValues}
      validationSchema={ReciterSchema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4" dir="rtl">
          {["name", "district", "sample_link", "mosque_link", "image"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-1">
                {field === "name"
                  ? "اسم القارئ"
                  : field === "district"
                  ? "اسم الحي"
                  : field === "sample_link"
                  ? "رابط نموذج التلاوة"
                  : field === "mosque_link"
                  ? "رابط موقع المسجد"
                  : "رابط الصورة (اختياري)"}
              </label>
              <Field
                name={field}
                as={Input}
                placeholder={
                  field === "name"
                    ? "أدخل اسم القارئ"
                    : field === "district"
                    ? "أدخل اسم الحي"
                    : field === "sample_link"
                    ? "https://example.com/sample.mp3"
                    : field === "mosque_link"
                    ? "https://maps.google.com/..."
                    : "https://example.com/image.jpg"
                }
                className={field === "name" || field === "district" ? "text-right" : "text-left"}
              />
              <ErrorMessage name={field} component="div" className="text-red-500 text-sm mt-1" />
            </div>
          ))}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setIsAddDialogOpen(false);
                setIsEditDialogOpen(false);
                setEditingReciter(null);
              }}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {reciter ? "تحديث" : "إضافة"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-background p-3 sm:p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-right mb-2">لوحة تحكم الإدارة</h1>
          <p className="text-muted-foreground text-right text-sm sm:text-base">إدارة قائمة القراء والإحصائيات</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-4 sm:p-6 rounded-lg border border-amber-200 shadow-sm flex items-center justify-between">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <div className="text-right">
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.totalReciters}</p>
              <p className="text-xs sm:text-sm text-gray-600">إجمالي القراء</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-4 sm:p-6 rounded-lg border border-amber-200 shadow-sm flex items-center justify-between">
            <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
            <div className="text-right">
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.totalFavorites}</p>
              <p className="text-xs sm:text-sm text-gray-600">إجمالي المفضلات</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-4 sm:p-6 rounded-lg border border-amber-200 shadow-sm flex items-center justify-between">
            <Music className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
            <div className="text-right">
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.recentReciters}</p>
              <p className="text-xs sm:text-sm text-gray-600">قراء جدد هذا الشهر</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-4 sm:p-6 rounded-lg border border-amber-200 shadow-sm flex items-center justify-between">
            <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
            <div className="text-right min-w-0">
              <p className="text-sm sm:text-lg font-bold truncate text-gray-800" title={stats.mostFavorited}>
                {stats.mostFavorited}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">الأكثر إعجاباً</p>
            </div>
          </div>
        </div>

        {/* Actions and Search */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="ml-2 h-4 w-4" />
                إضافة قارئ جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle className="text-right">إضافة قارئ جديد</DialogTitle>
              </DialogHeader>
              <ReciterForm onSubmit={handleAddReciter} />
            </DialogContent>
          </Dialog>

          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث في القراء..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
        </div>

        {/* Reciters Table */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-lg border border-amber-200 shadow-sm">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-right text-gray-800">قائمة القراء</h2>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الاسم</TableHead>
                      <TableHead className="text-right hidden sm:table-cell">الحي</TableHead>
                      <TableHead className="text-right hidden md:table-cell">تاريخ الإضافة</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReciters.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          {searchTerm ? "لا توجد نتائج للبحث" : "لا يوجد قراء"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReciters.map((reciter) => (
                        <TableRow key={reciter.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div>{reciter.name}</div>
                              <div className="text-sm text-muted-foreground sm:hidden">
                                {reciter.district}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">{reciter.district}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {new Date(reciter.created_at).toLocaleDateString("ar-SA")}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 sm:gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setEditingReciter(reciter);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-8 w-8 p-0"
                                onClick={() => handleDeleteReciter(reciter.id)}
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="w-[95vw] max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="text-right">تحديث بيانات القارئ</DialogTitle>
            </DialogHeader>
            {editingReciter && <ReciterForm reciter={editingReciter} onSubmit={handleUpdateReciter} />}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}