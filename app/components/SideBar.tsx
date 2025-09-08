"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Home, MessageSquare, FilePlus2, LogOut } from "lucide-react";
import { supabase } from "../lib/supabaseClient"; // ✅ make sure you have this client

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleIsActive = (href: string) => {
    return pathname === href
      ? "bg-mint text-darkgreen"
      : "text-gray-700 hover:bg-mint hover:text-darkgreen";
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Comments", href: "/admin/comments", icon: MessageSquare },
    { name: "Requests", href: "/admin/requests", icon: FilePlus2 },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login"); // redirect home (or to /login if you prefer)
  };

  return (
    <div className="flex">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="p-3 md:hidden fixed top-4 right-4 z-50 rounded-lg bg-mint text-darkgreen shadow"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 p-4 transform 
        transition-transform duration-300 ease-in-out z-40 
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <h2 className="text-2xl font-bold text-darkgreen mb-6">Admin Panel</h2>
        <nav className="flex flex-col gap-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg font-semibold ${handleIsActive(item.href)}`}
              onClick={() => setOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          ))}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 rounded-lg font-semibold text-red-600 hover:bg-red-100 mt-6"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>
    </div>
  );
}
