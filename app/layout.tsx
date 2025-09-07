import type { Metadata } from "next";
import "./globals.css";
import { Cairo } from "next/font/google";
import Nav from "./components/nav";
import Footer from "./components/footer";

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
      <Nav />
      <body className="antialiased font-cairo font-semibold bg-beige/5">{children}</body>
      <Footer />
    </html>
  );
}
