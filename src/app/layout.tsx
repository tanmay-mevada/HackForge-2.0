import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // Import Navbar
import Footer from "@/components/Footer"; // Import Footer

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Printify",
  description: "Remote printing service for students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />   {/* Stays at the top of EVERY page */}
        <main>
          {children} {/* This is where Privacy, Home, Contact pages render */}
        </main>
        <Footer />   {/* Stays at the bottom of EVERY page */}
      </body>
    </html>
  );
}