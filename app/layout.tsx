import type { Metadata } from "next";
import { ToastProvider } from "@/contexts/ToastContext";
import { ProfilesSearchProvider } from "@/contexts/ProfilesSearchContext";
import { Navbar } from "@/components/layout/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "EchoDate",
  description: "Preview their vibe before you say hi — chat with AI avatars",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen text-slate-900">
        <ToastProvider>
          <ProfilesSearchProvider>
            <Navbar />
            <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
          </ProfilesSearchProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
