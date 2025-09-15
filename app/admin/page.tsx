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
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .required("Name is required"),
  district: Yup.string()
    .min(2, "District must be at least 2 characters")
    .max(50, "District must be less than 50 characters")
    .required("District is required"),
  sample_link: Yup.string()
    .url("Must be a valid URL")
    .required("Sample recitation link is required"),
  mosque_link: Yup.string()
    .url("Must be a valid URL")
    .required("Mosque link is required"),
  image: Yup.string().url("Must be a valid URL").nullable(),
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
    mostFavorited: "N/A",
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

      // Favorites with reciter info
      const { data: favoritedReciters } = await supabase
        .from("favorites")
        .select(`reader_id, readers:reader_id(name)`);

      const favoriteCounts: Record<number, number> = {};
      favoritedReciters?.forEach((fav: FavoritedReciter) => {
        const rid = fav.reader_id;
        favoriteCounts[rid] = (favoriteCounts[rid] || 0) + 1;
      });

      let mostFavoritedId: number | null = null;
      let maxCount = 0;
      for (const [idStr, count] of Object.entries(favoriteCounts)) {
        if (count > maxCount) {
          maxCount = count;
          mostFavoritedId = Number(idStr);
        }
      }

      const mostFavoritedReciter = favoritedReciters?.find(
        (fav) => fav.reader_id === mostFavoritedId
      );
      const mostFavoritedName =
        mostFavoritedReciter?.readers?.[0]?.name || "N/A";

      setStats({
        totalReciters: totalReciters || 0,
        totalFavorites: totalFavorites || 0,
        recentReciters: recentReciters || 0,
        mostFavorited: mostFavoritedName,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Error loading stats");
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
      toast.error("Error loading reciters");
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
      toast.success("Reciter added successfully");
      actions.resetForm();
      setIsAddDialogOpen(false);
      fetchReciters();
      fetchStats();
    } catch (error) {
      console.error("Error adding reciter:", error);
      toast.error("Error adding reciter");
    } finally {
      actions.setSubmitting(false);
    }
  };

  // ==================== HANDLE UPDATE ====================
  const handleUpdateReciter = async (
    values: FormValues,
    actions: FormActions
  ) => {
    if (!editingReciter) return;
    try {
      const { error } = await supabase
        .from("readers")
        .update({ ...values, image: values.image || null })
        .eq("id", editingReciter.id);
      if (error) throw error;
      toast.success("Reciter updated successfully");
      setIsEditDialogOpen(false);
      setEditingReciter(null);
      fetchReciters();
      fetchStats();
    } catch (error) {
      console.error("Error updating reciter:", error);
      toast.error("Error updating reciter");
    } finally {
      actions.setSubmitting(false);
    }
  };

  // ==================== HANDLE DELETE ====================
  const handleDeleteReciter = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this reciter?")) return;
    try {
      const { error } = await supabase.from("readers").delete().eq("id", id);
      if (error) throw error;
      toast.success("Reciter deleted successfully");
      setReciters(reciters.filter((r) => r.id !== id));
      fetchStats();
    } catch (error) {
      console.error("Error deleting reciter:", error);
      toast.error("Error deleting reciter");
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
      initialValues={
        reciter ? { ...reciter, image: reciter.image || "" } : initialValues
      }
      validationSchema={ReciterSchema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4">
          {["name", "district", "sample_link", "mosque_link", "image"].map(
            (field) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-1">
                  {field === "name"
                    ? "Name"
                    : field === "district"
                    ? "District"
                    : field === "sample_link"
                    ? "Sample Recitation Link"
                    : field === "mosque_link"
                    ? "Mosque Location Link"
                    : "Image Link (Optional)"}
                </label>
                <Field
                  name={field}
                  as={Input}
                  placeholder={
                    field === "name"
                      ? "Enter reciter name"
                      : field === "district"
                      ? "Enter district name"
                      : field === "sample_link"
                      ? "https://example.com/sample.mp3"
                      : field === "mosque_link"
                      ? "https://maps.google.com/..."
                      : "https://example.com/image.jpg"
                  }
                  className="w-full"
                />
                <ErrorMessage
                  name={field}
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
            )
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setIsEditDialogOpen(false);
                setEditingReciter(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {reciter ? "Update" : "Add"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage reciters list and statistics
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card p-6 rounded-lg border shadow-sm flex items-center justify-between">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="text-right">
              <p className="text-2xl font-bold">{stats.totalReciters}</p>
              <p className="text-sm text-muted-foreground">Total Reciters</p>
            </div>
          </div>
          <div className="bg-card p-6 rounded-lg border shadow-sm flex items-center justify-between">
            <Heart className="h-8 w-8 text-red-500" />
            <div className="text-right">
              <p className="text-2xl font-bold">{stats.totalFavorites}</p>
              <p className="text-sm text-muted-foreground">Total Favorites</p>
            </div>
          </div>
          <div className="bg-card p-6 rounded-lg border shadow-sm flex items-center justify-between">
            <Music className="h-8 w-8 text-green-500" />
            <div className="text-right">
              <p className="text-2xl font-bold">{stats.recentReciters}</p>
              <p className="text-sm text-muted-foreground">
                New Reciters This Month
              </p>
            </div>
          </div>
          <div className="bg-card p-6 rounded-lg border shadow-sm flex items-center justify-between">
            <BarChart3 className="h-8 w-8 text-purple-500" />
            <div className="text-right">
              <p className="text-lg font-bold truncate">{stats.mostFavorited}</p>
              <p className="text-sm text-muted-foreground">Most Favorited</p>
            </div>
          </div>
        </div>

        {/* Actions and Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                Add New Reciter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Reciter</DialogTitle>
              </DialogHeader>
              <ReciterForm onSubmit={handleAddReciter} />
            </DialogContent>
          </Dialog>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reciters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* Reciters Table */}
        <div className="bg-card rounded-lg border shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Reciters List</h2>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-full text-sm sm:text-base">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Name</TableHead>
                      <TableHead className="whitespace-nowrap">District</TableHead>
                      <TableHead className="whitespace-nowrap hidden sm:table-cell">
                        Added At
                      </TableHead>
                      <TableHead className="whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReciters.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          {searchTerm
                            ? "No search results"
                            : "No reciters available"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReciters.map((reciter) => (
                        <TableRow key={reciter.id}>
                          <TableCell className="font-medium">
                            {reciter.name}
                          </TableCell>
                          <TableCell>{reciter.district}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {new Date(reciter.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingReciter(reciter);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteReciter(reciter.id)}
                              >
                                <Trash2 className="h-4 w-4" />
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Update Reciter</DialogTitle>
            </DialogHeader>
            {editingReciter && (
              <ReciterForm reciter={editingReciter} onSubmit={handleUpdateReciter} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
