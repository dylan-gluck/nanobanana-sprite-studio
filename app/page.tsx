"use client";

import { AppLayout } from "@/components/ide/app-layout";
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
  return (
    <>
      <AppLayout />
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: "bg-card border-border shadow-lg",
            title: "text-foreground",
            description: "text-muted-foreground",
          },
        }}
      />
    </>
  );
}
