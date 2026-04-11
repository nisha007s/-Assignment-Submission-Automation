"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Search, UserRound } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export interface UniversityHeaderProps {
  userName: string;
  onLogout: () => void;
  /** e.g. "Student Dashboard" / "Teacher Dashboard" */
  roleLabel?: string;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

const HEADER_BG = "#e53935";

export function UniversityHeader({
  userName,
  onLogout,
  roleLabel,
  showSearch = false,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search…",
}: UniversityHeaderProps) {
  return (
    <header
      className="sticky top-0 z-[100] w-full border-b border-white/10 shadow-md"
      style={{ backgroundColor: HEADER_BG }}
    >
      <div className="container mx-auto flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {/* Left: logo + title */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-white shadow-sm ring-2 ring-white/30">
            <img
              src="/iilm-logo.svg"
              alt="IILM University"
              width={44}
              height={44}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold tracking-tight text-white drop-shadow-sm">
              IILM University
            </p>
            {roleLabel ? (
              <p className="truncate text-xs font-medium text-white/85">{roleLabel}</p>
            ) : null}
          </div>
        </div>

        {/* Center: search (optional) */}
        {showSearch ? (
          <div className="relative w-full sm:max-w-md sm:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="h-10 rounded-xl border-white/20 bg-white/15 pl-10 text-sm text-white placeholder:text-white/60 focus-visible:ring-2 focus-visible:ring-white/40"
              aria-label="Search"
            />
          </div>
        ) : (
          <div className="hidden flex-1 sm:block" aria-hidden />
        )}

        {/* Right: profile + theme + logout */}
        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
          <div className="hidden max-w-[140px] items-center gap-2 sm:flex" title={userName}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/25">
              <UserRound className="h-5 w-5 text-white" aria-hidden />
            </div>
            <span className="truncate text-sm font-medium text-white">{userName}</span>
          </div>
          <ThemeToggle className="border-white/35 bg-white/10 text-white hover:border-white/50 hover:bg-white/20 hover:text-white" />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="rounded-xl border-white/40 bg-white/10 text-white shadow-sm backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white"
          >
            <LogOut className="mr-1.5 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
