"use client";

import { Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TopLoadingBar } from "@/components/TopLoadingBar";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <Suspense fallback={null}>
          <TopLoadingBar />
        </Suspense>
        {children}
      </TooltipProvider>
    </ThemeProvider>
  );
}

