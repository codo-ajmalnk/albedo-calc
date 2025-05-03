
import { useState } from "react";
import { LayoutGrid, LayoutList } from "lucide-react";
import { Toggle } from "./ui/toggle";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
  view: "grid" | "list";
  onViewChange: (view: "grid" | "list") => void;
  className?: string;
}

export const ViewToggle = ({ view, onViewChange, className }: ViewToggleProps) => {
  return (
    <div className={cn("flex items-center gap-1 rounded-lg border p-1", className)}>
      <Toggle
        aria-label="Toggle grid view"
        pressed={view === "grid"}
        onPressedChange={() => onViewChange("grid")}
        className="data-[state=on]:bg-muted"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="sr-only">Grid view</span>
      </Toggle>
      <Toggle
        aria-label="Toggle list view"
        pressed={view === "list"}
        onPressedChange={() => onViewChange("list")}
        className="data-[state=on]:bg-muted"
      >
        <LayoutList className="h-4 w-4" />
        <span className="sr-only">List view</span>
      </Toggle>
    </div>
  );
};
