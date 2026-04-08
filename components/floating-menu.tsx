"use client";

import { Home, Upload, Share2, Heart, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingMenuProps {
  onHomeClick?: () => void;
  onUploadClick?: () => void;
  onShareClick?: () => void;
  onFavoriteClick?: () => void;
  onCenterClick?: () => void;
}

export function FloatingMenu({
  onHomeClick,
  onUploadClick,
  onShareClick,
  onFavoriteClick,
  onCenterClick,
}: FloatingMenuProps) {
  const iconButtonClass = cn(
    "relative flex items-center justify-center",
    "w-12 h-12 rounded-full",
    "bg-card/80 backdrop-blur-md",
    "border border-border/50",
    "shadow-lg shadow-black/5 dark:shadow-black/20",
    "transition-all duration-300 ease-out",
    "hover:scale-110 hover:shadow-xl hover:shadow-primary/20",
    "hover:border-primary/30",
    "active:scale-95",
    "group"
  );

  const iconClass = cn(
    "w-5 h-5 text-muted-foreground",
    "transition-colors duration-300",
    "group-hover:text-primary"
  );

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      {/* Glass container */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3",
          "bg-card/60 backdrop-blur-xl",
          "border border-border/40",
          "rounded-full",
          "shadow-2xl shadow-black/10 dark:shadow-black/30"
        )}
      >
        {/* Home button */}
        <button
          onClick={onHomeClick}
          className={iconButtonClass}
          aria-label="Home"
        >
          <Home className={iconClass} />
        </button>

        {/* Upload button */}
        <button
          onClick={onUploadClick}
          className={iconButtonClass}
          aria-label="Upload"
        >
          <Upload className={iconClass} />
        </button>

        {/* Center action button - Upload Assignment */}
        <button
          onClick={onCenterClick}
          className={cn(
            "relative flex items-center justify-center",
            "w-16 h-16 rounded-full",
            "bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-600",
            "shadow-xl shadow-indigo-500/30 dark:shadow-indigo-500/20",
            "transition-all duration-300 ease-out",
            "hover:scale-110 hover:shadow-2xl hover:shadow-indigo-500/40",
            "active:scale-95",
            "group"
          )}
          aria-label="Upload Assignment"
        >
          {/* Glow effect */}
          <div
            className={cn(
              "absolute inset-0 rounded-full",
              "bg-gradient-to-br from-indigo-400 via-blue-400 to-purple-500",
              "opacity-0 blur-md",
              "transition-opacity duration-300",
              "group-hover:opacity-60"
            )}
          />
          <Plus className="relative w-7 h-7 text-white transition-transform duration-300 group-hover:rotate-90" />
        </button>

        {/* Share button */}
        <button
          onClick={onShareClick}
          className={iconButtonClass}
          aria-label="Share"
        >
          <Share2 className={iconClass} />
        </button>

        {/* Favorite button */}
        <button
          onClick={onFavoriteClick}
          className={iconButtonClass}
          aria-label="Favorites"
        >
          <Heart className={iconClass} />
        </button>
      </div>
    </div>
  );
}
