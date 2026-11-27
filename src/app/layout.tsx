import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Khet Ka Saathi | खेत का साथी",
  description: "A voice-first farming companion for Indian farmers.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
