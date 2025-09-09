"use client";
import React, { useState, useEffect, useRef } from "react";
import texts from "@/public/locales/texts.json";
import { CirclePlus, Menu, X } from "lucide-react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient"; 
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import Image from "next/image";
import useSetLoginMode from "../store/useSetLoginMode";

function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const setMode = useSetLoginMode((state) => state.setMode);

  // Fetch current session
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    getSession();

    // Listen for login/logout events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch role + avatar
  useEffect(() => {
    const loadProfile = async () => {
      if (session) {
        const { data, error } = await supabase
          .from("profiles")
          .select("role, avatar_url")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error loading profile:", error.message);
        }

        if (data) {
          setIsAdmin(data.role === "admin");
          setAvatarUrl(data.avatar_url);
        }
      } else {
        setIsAdmin(false);
        setAvatarUrl(null);
      }
    };

    loadProfile();
  }, [session]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    router.push("/"); 
  };

  return (
    <div className="w-full flex justify-center">
      <nav className="w-[90%] lg:w-[70%] fixed top-4 z-50 rounded-full glassmorphism flex flex-row-reverse justify-between items-center px-6 py-4 border border-beige/20 shadow-md">
        {/* Logo */}
        <h1 className="text-xl lg:text-2xl text-darkgreen font-bold">
          {texts.navbar.title}
        </h1>

        {/* Desktop Menu */}
        <ul className="hidden md:flex flex-row-reverse gap-8 text-black font-semibold items-center">
          <Link href="/">
            <li className="cursor-pointer hover:opacity-50 transition">
              {texts.navbar.home}
            </li>
          </Link>
          <Link href="/pages/about">
            <li className="cursor-pointer hover:opacity-50 transition">
              {texts.navbar.about}
            </li>
          </Link>
          <Link href="/pages/readers">
            <li className="cursor-pointer hover:opacity-50 transition">
              {texts.navbar.readers}
            </li>
          </Link>
          <Link href="/pages/add-readers">
            <li className="flex flex-row-reverse gap-1 items-center cursor-pointer hover:opacity-50 transition">
              {texts.navbar.addReader}
              <CirclePlus className="w-[1.1rem]" />
            </li>
          </Link>

          {/* Auth Buttons */}
          <div className="flex gap-3 ml-6">
            {session ? (
              <div className="flex flex-row gap-3">
                <Link href="/profile">
                  <button className="p-1 rounded-full border border-darkgreen text-darkgreen hover:bg-darkgreen hover:text-white transition">
                    <Image
                      src={avatarUrl || "/default-avatar.png"}
                      alt="Avatar"
                      width={30}
                      height={30}
                      className="inline-block rounded-full object-cover"
                    />
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition"
                >
                  تسجيل خروج
                </button>
                {isAdmin && (
                  <Link href="/admin">
                    <button className="ml-4 px-4 py-2 rounded-full bg-darkgreen text-white hover:bg-mint hover:text-darkgreen transition">
                      صفحة الادمن
                    </button>
                  </Link>
                )}
              </div>
            ) : (
              <>
                <Link href="/login">
                  <button
                    onClick={() => setMode("login")}
                    className="px-4 py-2 rounded-full border border-darkgreen text-darkgreen hover:bg-darkgreen hover:text-white transition"
                  >
                    تسجيل دخول
                  </button>
                </Link>
                <Link href="/login">
                  <button
                    onClick={() => setMode("signup")}
                    className="px-4 py-2 rounded-full bg-darkgreen text-white hover:bg-mint hover:text-darkgreen transition"
                  >
                    انشاء حساب
                  </button>
                </Link>
              </>
            )}
          </div>
        </ul>

        {/* Mobile Toggle Button */}
        <button
          className="md:hidden text-darkgreen cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        {isOpen && (
          <div
            ref={menuRef}
            className="absolute top-full right-0 mt-4 w-64 bg-white rounded-2xl shadow-lg border border-beige/40 p-6 md:hidden"
          >
            <ul className="flex flex-col gap-6 text-right text-black font-semibold">
              <Link href="/">
                <li className="cursor-pointer hover:opacity-50 transition">
                  {texts.navbar.home}
                </li>
              </Link>
              <Link href="/pages/about">
                <li className="cursor-pointer hover:opacity-50 transition">
                  {texts.navbar.about}
                </li>
              </Link>
              <Link href="/pages/readers">
                <li className="cursor-pointer hover:opacity-50 transition">
                  {texts.navbar.readers}
                </li>
              </Link>
              <Link href="/pages/add-readers">
                <li className="flex flex-row-reverse gap-1 items-center cursor-pointer hover:opacity-50 transition">
                  {texts.navbar.addReader}
                  <CirclePlus className="w-[1.1rem]" />
                </li>
              </Link>

              {/* Auth (Mobile) */}
              <div className="flex flex-col gap-3 mt-4">
                {session ? (
                  <div className="flex flex-col gap-3 justify-center">
                    <Link href="/profile">
                      <button className="w-full px-4 py-2 rounded-lg border border-darkgreen text-darkgreen hover:bg-darkgreen hover:text-white transition">
                        الملف الشخصي
                      </button>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 rounded-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition"
                    >
                      تسجيل خروج
                    </button>
                    {isAdmin && (
                      <Link href="/admin">
                        <button className="w-full px-4 py-2 rounded-full bg-darkgreen text-white hover:bg-mint hover:text-darkgreen transition">
                          صفحة الادمن
                        </button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <>
                    <Link href="/login">
                      <button
                        onClick={() => setMode("login")}
                        className="w-full px-4 py-2 rounded-lg border border-darkgreen text-darkgreen hover:bg-darkgreen hover:text-white transition"
                      >
                        تسجيل دخول
                      </button>
                    </Link>
                    <Link href="/login">
                      <button
                        onClick={() => setMode("signup")}
                        className="w-full px-4 py-2 rounded-lg bg-darkgreen text-white hover:bg-mint hover:text-darkgreen transition"
                      >
                        انشاء حساب
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </ul>
          </div>
        )}
      </nav>
    </div>
  );
}

export default Nav;
