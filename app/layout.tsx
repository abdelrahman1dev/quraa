import type { Metadata } from "next";
import "./globals.css";
import { Cairo } from "next/font/google";
import ClientLayout from "./components/ClientLayout";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "منصه قراء القران الكريم",
  description: "منصه قراء القران الكريم للتلاوات والقراءات",
  icons: {
    icon: "/quran.png",
  },
};

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" className={cairo.variable}>
      <Toaster />
      <body className="antialiased font-cairo font-semibold bg-beige/5">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
