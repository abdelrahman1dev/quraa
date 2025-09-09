"use client";
import { useState, useCallback, useEffect } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { supabase } from "../lib/supabaseClient";

interface FileWithPreview extends Partial<File> {
  preview: string;
}

interface UploadImageProps {
  onUpload: (url: string) => void;
}

export default function UploadImage({ onUpload }: UploadImageProps) {
  const [images, setImages] = useState<FileWithPreview[]>([]);
  const [errors, setErrors] = useState("");
  const [uploading, setUploading] = useState(false);

  const maxSize = 2 * 1024 * 1024;

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      images.forEach((file) => {
        if (file.preview.startsWith("blob:")) {
          URL.revokeObjectURL(file.preview);
        }
      });
      setErrors("");
      setUploading(true);

      // لو فيه ملفات مرفوضة
      if (rejectedFiles.length > 0) {
        const reason = rejectedFiles[0].errors[0];
        if (reason.code === "file-too-large") {
          setErrors("الملف كبير جداً، الحد الأقصى 2 ميجابايت");
        } else if (reason.code === "file-invalid-type") {
          setErrors("يُقبل الصور فقط");
        } else {
          setErrors("الملف غير مقبول");
        }
        setImages([]);
        setUploading(false);
        return;
      }

      // اختيار أول ملف
      const file = acceptedFiles[0];
      const imagePreview = Object.assign(file, {
        preview: URL.createObjectURL(file),
      }) as FileWithPreview;

      setImages([imagePreview]);

      // رفع الصورة لـ storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        setErrors(`فشل في رفع الصورة: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      // جلب الرابط العام
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;
      onUpload(publicUrl);

      // تحديث جدول profiles
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ avatar_url: publicUrl })
          .eq("id", user.id);

        if (updateError) {
          console.error("Update error:", updateError.message);
          setErrors(`فشل في تحديث الملف الشخصي: ${updateError.message}`);
        }
      }

      setUploading(false);
    },
    [images, onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    multiple: false,
    accept: { "image/*": [] },
  });

  // تحميل صورة المستخدم من profiles
  useEffect(() => {
    const loadUserAvatar = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", session.user.id)
        .single();

      if (data?.avatar_url) {
        setImages([
          {
            name: "avatar",
            preview: data.avatar_url,
          } as FileWithPreview,
        ]);
      }
    };

    loadUserAvatar();

    return () => {
      images.forEach((file) => {
        if (file.preview.startsWith("blob:")) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, []);

  const deleteImage = (previmage: FileWithPreview) => {
    if (previmage.preview.startsWith("blob:")) {
      URL.revokeObjectURL(previmage.preview);
    }
    setImages(images.filter((file) => file !== previmage));
  };

  return (
    <div className="my-4">
      <div
        className={`w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-gray-400 transition ${
          uploading ? "opacity-50" : ""
        }`}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <span>اسقط الصورة هنا</span>
        ) : (
          <span>
            اسحب وأسقط الصورة هنا أو <span className="font-bold">تصفح</span>
          </span>
        )}
        {errors && <p className="text-red-500 mt-2">{errors}</p>}
        {uploading && <p className="text-blue-500 mt-2">جاري الرفع...</p>}
      </div>

      {images.length > 0 && (
        <div className="mt-4 w-full mx-auto">
          <p className="font-medium text-center">معاينة:</p>
          {images.map((file, index) => (
            <div key={index} className="relative w-24 h-24 mx-auto mt-2">
              <img
                src={file.preview}
                alt="معاينة"
                className="w-full h-full rounded-full object-cover border"
              />
              <button
                onClick={() => deleteImage(file)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
