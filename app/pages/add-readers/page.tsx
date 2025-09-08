"use client";
import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/app/lib/supabaseClient";

// ✅ Validation schema with Yup
const ReciterSchema = Yup.object().shape({
  name: Yup.string().required("اسم القارئ مطلوب"),
  sample: Yup.string()
    .url("الرابط غير صحيح")
    .required("رابط التلاوة مطلوب"),
  district: Yup.string().required("اسم الحي مطلوب"),
  mosque: Yup.string()
    .url("الرابط غير صحيح")
    .required("رابط المسجد مطلوب"),
});

function AddReciterForm() {
  return (
    <section className="w-full max-w-lg mx-auto py-12 mt-20 px-6 bg-white rounded-2xl shadow">
      <h2 className="text-2xl font-bold text-center mb-6">
        تقديم طلب إضافة قارئ
      </h2>

      <Formik
        initialValues={{
          name: "",
          sample: "",
          district: "",
          mosque: "",
        }}
        validationSchema={ReciterSchema}
        onSubmit={async (values, { resetForm }) => {
          const { data, error } = await supabase.from('requests').insert([
            {
              name: values.name,
              sample_link: values.sample,
              district: values.district,
              mosque_link: values.mosque,
            },
          ]);

          if (error) {
            console.error("Error inserting request:", error.message);
            alert("حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.");
          } else {
            console.log("Request inserted successfully:", data);
            alert("تم إرسال الطلب بنجاح ✅");
            resetForm();
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4 text-right">
            {/* Name */}
            <div>
              <label className="block mb-1 font-medium">اسم القارئ</label>
              <Field
                as={Input}
                type="text"
                name="name"
                placeholder="أدخل اسم القارئ"
              />
              <ErrorMessage
                name="name"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* Sample */}
            <div>
              <label className="block mb-1 font-medium">
                رابط نموذج التلاوة
              </label>
              <Field
                as={Input}
                type="url"
                name="sample"
                placeholder="رابط يوتيوب / ساوندكلاود"
              />
              <ErrorMessage
                name="sample"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* District */}
            <div>
              <label className="block mb-1 font-medium">اسم الحي</label>
              <Field
                as={Input}
                type="text"
                name="district"
                placeholder="أدخل اسم الحي"
              />
              <ErrorMessage
                name="district"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* Mosque */}
            <div>
              <label className="block mb-1 font-medium">رابط موقع المسجد</label>
              <Field
                as={Input}
                type="url"
                name="mosque"
                placeholder="رابط قوقل ماب"
              />
              <ErrorMessage
                name="mosque"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? "جاري الإرسال..." : "إرسال الطلب"}
            </Button>
          </Form>
        )}
      </Formik>
    </section>
  );
}

export default AddReciterForm;
