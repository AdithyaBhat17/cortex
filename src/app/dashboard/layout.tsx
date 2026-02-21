import { Header } from "@/components/layout/header";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main
        id="main-content"
        className="mx-auto max-w-[1400px] px-4 py-5 pb-20 sm:px-6 sm:pb-5"
      >
        {children}
      </main>
    </div>
  );
}
