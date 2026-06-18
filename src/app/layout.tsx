import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import SplashScreen from "@/components/splash-screen";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "ERMS — Reportage Properties",
  description: "Estate Real-estate Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} h-full antialiased`}
    >
      <body className="min-h-screen">
        <SplashScreen>{children}</SplashScreen>
      </body>
    </html>
  );
}
