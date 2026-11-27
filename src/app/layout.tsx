import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Khet Ka Saathi | खेत का साथी", description: "A multilingual, voice-first farm diary for Indian farmers." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="hi"><body>{children}</body></html>; }
