"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CornerDownLeft,
  Search,
  Building2,
  GraduationCap,
  Wallet,
  UserPlus,
  Megaphone,
  X,
  Compass,
} from "lucide-react";
import { NAV_GROUPS, ALL_NAV_ITEMS, type NavItem } from "@/config/navigation";
import { CAMPUSES } from "@/lib/mock/institution";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface SearchAction {
  id: string;
  title: string;
  category: "Modules" | "Actions" | "Campuses";
  icon: React.ElementType;
  href: string;
  badge?: string;
  subtitle?: string;
}

export function CommandSearch() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [cursor, setCursor] = React.useState(0);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Build searchable index of Modules, Actions, and Campuses
  const allSearchable = React.useMemo<SearchAction[]>(() => {
    const items: SearchAction[] = [];

    // Modules
    NAV_GROUPS.forEach((group) => {
      group.items.forEach((item) => {
        items.push({
          id: `mod-${item.href}`,
          title: item.title,
          category: "Modules",
          icon: item.icon,
          href: item.href,
          subtitle: `${group.label} module`,
          badge: item.badge,
        });
      });
    });

    // Quick Actions
    items.push(
      {
        id: "act-admission",
        title: "New Admission Inquiry",
        category: "Actions",
        icon: UserPlus,
        href: "/admissions",
        subtitle: "Register candidate application",
        badge: "Action",
      },
      {
        id: "act-fee",
        title: "Record Fee Payment / Challan",
        category: "Actions",
        icon: Wallet,
        href: "/fees",
        subtitle: "Finance & Accounts collection",
        badge: "Action",
      },
      {
        id: "act-student",
        title: "Add New Student Record",
        category: "Actions",
        icon: GraduationCap,
        href: "/students",
        subtitle: "Enroll student to class",
        badge: "Action",
      },
      {
        id: "act-announcement",
        title: "Broadcast Announcement",
        category: "Actions",
        icon: Megaphone,
        href: "/communication",
        subtitle: "Send SMS or portal circular",
        badge: "Action",
      }
    );

    // Campuses
    CAMPUSES.forEach((c) => {
      items.push({
        id: `camp-${c.id}`,
        title: c.campusName,
        category: "Campuses",
        icon: Building2,
        href: "/campuses",
        subtitle: `${c.city} · ${c.campusCode} · ${c.students} students`,
        badge: c.campusCode,
      });
    });

    return items;
  }, []);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Prioritize modules and top quick actions when query is empty
      return allSearchable.slice(0, 10);
    }
    return allSearchable.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        (item.badge && item.badge.toLowerCase().includes(q))
    );
  }, [allSearchable, query]);

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="gap-0 overflow-hidden p-0 sm:max-w-xl border-border/80 shadow-[0_24px_50px_-12px_rgba(53,57,85,0.25)] rounded-2xl bg-white"
        >
          <DialogTitle className="sr-only">Quick Command Search</DialogTitle>
          
          {/* Search Header */}
          <div className="relative flex items-center border-b border-border/70 px-4 bg-muted/20">
            <Search className="size-4 text-brand-400 shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCursor(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setCursor((c) => Math.min(c + 1, results.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setCursor((c) => Math.max(c - 1, 0));
                } else if (e.key === "Enter" && results[cursor]) {
                  e.preventDefault();
                  go(results[cursor].href);
                }
              }}
              placeholder="Type a module name, campus, or action (e.g. Fees, Admissions, LHR-01)..."
              className="h-13 flex-1 bg-transparent px-3 text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/70"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Results list */}
          <div className="max-h-88 overflow-y-auto p-2 scrollbar-thin">
            {results.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <Compass className="mx-auto size-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm font-medium text-foreground">No matching results found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try searching for “Admissions”, “Fees”, “Attendance”, or campus names.
                </p>
              </div>
            ) : (
              <ul className="space-y-1">
                {results.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = idx === cursor;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onMouseEnter={() => setCursor(idx)}
                        onClick={() => go(item.href)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                          isSelected
                            ? "bg-brand text-white shadow-xs"
                            : "text-foreground hover:bg-muted/60"
                        )}
                      >
                        <span
                          className={cn(
                            "grid size-8 shrink-0 place-items-center rounded-lg transition-colors",
                            isSelected
                              ? "bg-white/15 text-gold"
                              : "bg-brand-50 text-brand ring-1 ring-brand/10"
                          )}
                        >
                          <Icon className="size-4" />
                        </span>
                        
                        <div className="min-w-0 flex-1 leading-tight">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-xs font-semibold">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span
                                className={cn(
                                  "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                                  isSelected
                                    ? "bg-white/20 text-cream"
                                    : "bg-muted text-muted-foreground"
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.subtitle && (
                            <p
                              className={cn(
                                "truncate text-[11px] mt-0.5",
                                isSelected ? "text-cream/80" : "text-muted-foreground"
                              )}
                            >
                              {item.subtitle}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5">
                          <span
                            className={cn(
                              "text-[10px] font-medium uppercase tracking-wider rounded px-1.5 py-0.5",
                              isSelected
                                ? "bg-white/10 text-white/80"
                                : "text-muted-foreground"
                            )}
                          >
                            {item.category}
                          </span>
                          {isSelected && (
                            <CornerDownLeft className="size-3.5 text-gold shrink-0" />
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer Navigation Hints */}
          <div className="flex items-center justify-between border-t border-border/70 bg-muted/30 px-4 py-2.5 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-white px-1 py-0.5 font-mono text-[10px]">↑</kbd>
                <kbd className="rounded border border-border bg-white px-1 py-0.5 font-mono text-[10px]">↓</kbd>
                <span>to navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-white px-1 py-0.5 font-mono text-[10px]">↵</kbd>
                <span>to open</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-white px-1 py-0.5 font-mono text-[10px]">ESC</kbd>
                <span>to dismiss</span>
              </span>
            </div>
            <span className="hidden sm:inline font-medium text-brand/80">EduSphere Quick Command</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
