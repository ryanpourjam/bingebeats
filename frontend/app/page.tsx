"use client";
import { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import Homepage from "../homepage/Homepage";
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  return (
    <ThemeProvider attribute="data-bs-theme" enableSystem>
      <main className={inter.className}>
        <Homepage />
      </main>
    </ThemeProvider>
  );
}
