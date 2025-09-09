"use client";
import React from "react";
import { supabase } from "../lib/supabaseClient";
import GoogleButton from "react-google-button";
import useSetLoginMode from "../store/useSetLoginMode";
import { useFormik } from "formik";
import * as Yup from "yup";

export default function AuthPage() {
  const { mode, setMode } = useSetLoginMode();

  const validationSchema = Yup.object({
    first_name: mode === "signup" ? Yup.string().required("الاسم الأول مطلوب") : Yup.string(),
    last_name: mode === "signup" ? Yup.string().required("الاسم الأخير مطلوب") : Yup.string(),
    email: Yup.string()
      .email("البريد الإلكتروني غير صالح")
      .required("البريد الإلكتروني مطلوب"),
    password: Yup.string()
      .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل")
      .required("كلمة المرور مطلوبة"),
    confirmPassword: mode === "signup" ? Yup.string()
      .oneOf([Yup.ref("password")], "كلمات المرور غير متطابقة")
      .required("تأكيد كلمة المرور مطلوب") : Yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      setSubmitting(true);
      let result;
      if (mode === "login") {
        result = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
      } else {
        result = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              first_name: values.first_name,
              last_name: values.last_name,
            },
          },
        });
      }

      if (result.error) {
        setErrors({ email: result.error.message });
      } else {
        window.location.href = "/";
      }
      setSubmitting(false);
    },
  });

  const handleGoogleAuth = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      formik.setErrors({ email: error.message });
    } else {
      console.log("🌍 Redirecting to Google Auth:", data);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm text-right">
        <h2 className="text-xl font-bold mb-4">
          {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}
        </h2>

 

        {mode === "signup" && (
          <>
            <input
              type="text"
              placeholder="الاسم الأول"
              name="first_name"
              value={formik.values.first_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full mb-3 p-2 border rounded ${
                formik.touched.first_name && formik.errors.first_name
                  ? "border-red-500"
                  : ""
              }`}
            />
            {formik.touched.first_name && formik.errors.first_name && (
              <p className="text-red-500 mb-2 ">{formik.errors.first_name}</p>
            )}

            <input
              type="text"
              placeholder="الاسم الأخير"
              name="last_name"
              value={formik.values.last_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full mb-3 p-2 border rounded ${
                formik.touched.last_name && formik.errors.last_name
                  ? "border-red-500"
                  : ""
              }`}
            />
            {formik.touched.last_name && formik.errors.last_name && (
              <p className="text-red-500 mb-2">{formik.errors.last_name}</p>
            )}
          </>
        )}

        <input
          type="email"
          placeholder="البريد الإلكتروني"
          name="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`w-full mb-3 p-2 border rounded ${
            formik.touched.email && formik.errors.email ? "border-red-500" : ""
          }`}
        />
        {formik.touched.email && formik.errors.email && (
          <p className="text-red-500 mb-2">{formik.errors.email}</p>
        )}

        <input
          type="password"
          placeholder="كلمة المرور"
          name="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`w-full mb-3 p-2 border rounded ${
            formik.touched.password && formik.errors.password
              ? "border-red-500"
              : ""
          }`}
        />
        {formik.touched.password && formik.errors.password && (
          <p className="text-red-500 mb-2">{formik.errors.password}</p>
        )}

        {mode === "signup" && (
          <>
            <input
              type="password"
              placeholder="تأكيد كلمة المرور"
              name="confirmPassword"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full mb-3 p-2 border rounded ${
                formik.touched.confirmPassword && formik.errors.confirmPassword
                  ? "border-red-500"
                  : ""
              }`}
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <p className="text-red-500 mb-2">{formik.errors.confirmPassword}</p>
            )}
          </>
        )}

        <button
          onClick={() => formik.handleSubmit()}
          disabled={formik.isSubmitting}
          className="w-full bg-mint text-darkgreen py-2 rounded font-semibold hover:bg-darkgreen hover:text-white transition mb-3 disabled:opacity-50"
        >
          {mode === "login" ? "دخول" : "تسجيل"}
        </button>

        <GoogleButton
          onClick={handleGoogleAuth}
          className="w-full justify-center"
          label={mode === "login" ? "الدخول عبر جوجل" : "سجل عبر جوجل"}
        />

        <p className="mt-4 text-sm">
          {mode === "login" ? "ليس لديك حساب؟" : "لديك حساب؟"}{" "}
          <span
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-mint cursor-pointer underline"
          >
            {mode === "login" ? "سجل هنا" : "سجّل الدخول"}
          </span>
        </p>
      </div>
    </div>
  );
}
