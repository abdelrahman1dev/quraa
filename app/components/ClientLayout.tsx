"use client";

import { usePathname } from "next/navigation";
import Nav from "./nav";
import Footer from "./footer";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname.startsWith("/login");

  return (
    <>
      {!isAdminRoute && !isLoginRoute && <Nav />}
      {children}
      {!isAdminRoute &&  <Footer />}
    </>
  );
}
