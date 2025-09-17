import type { Metadata } from "next";
import "./globals.css";
import { Cairo } from "next/font/google";
import ClientLayout from "./components/ClientLayout";
import { Toaster } from "sonner";
import Script from "next/script"; // ✅ Import Script component

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
      <head>
        {/* ✅ Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-R1L2V9B4QS"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-R1L2V9B4QS');
            `,
          }}
        />
      </head>

      <body className="antialiased font-cairo font-semibold bg-beige/5">
        <Toaster />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
