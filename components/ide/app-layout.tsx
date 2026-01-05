"use client";

import { useEffect, useState } from "react";
import { LeftSidebar } from "./left-sidebar";
import { RightSidebar } from "./right-sidebar";
import { Workspace } from "./workspace";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

// Fixed sidebar widths per task-3 spec
const LEFT_SIDEBAR_WIDTH = 256;
const RIGHT_SIDEBAR_WIDTH = 400;

export function AppLayout() {
  const { leftSidebarOpen, rightSidebarOpen } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background overflow-hidden flex">
      {/* Left Sidebar - fixed width, collapsible */}
      <div
        className={cn(
          "h-full flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden",
          leftSidebarOpen ? "opacity-100" : "opacity-0"
        )}
        style={{ width: leftSidebarOpen ? LEFT_SIDEBAR_WIDTH : 0 }}
      >
        <div style={{ width: LEFT_SIDEBAR_WIDTH }} className="h-full">
          <LeftSidebar />
        </div>
      </div>

      {/* Center Workspace - flex-grow */}
      <div className="flex-1 h-full min-w-0">
        <Workspace />
      </div>

      {/* Right Sidebar - fixed width, collapsible */}
      <div
        className={cn(
          "h-full flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden",
          rightSidebarOpen ? "opacity-100" : "opacity-0"
        )}
        style={{ width: rightSidebarOpen ? RIGHT_SIDEBAR_WIDTH : 0 }}
      >
        <div style={{ width: RIGHT_SIDEBAR_WIDTH }} className="h-full">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
