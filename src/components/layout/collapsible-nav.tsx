"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavGroup, NavItem } from "@/config/navigation";

interface CollapsibleNavGroupProps {
  group: NavGroup;
  collapsed: boolean;
  onNavigate?: () => void;
}

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard" || href === "/") {
    return pathname === "/" || pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/* ---------------------------------- Tree sub-item ---------------------------------- */

function TreeSubItem({
  item,
  active,
  index,
  expanded,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  index: number;
  expanded: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      style={{ transitionDelay: expanded ? `${index * 40}ms` : "0ms" }}
      className={cn(
        "relative flex h-9 items-center gap-2.5 rounded-lg px-3 text-[13px] font-medium transition-all duration-300 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
        expanded ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0",
        active
          ? "bg-white/[0.14] text-white"
          : "text-white/65 hover:bg-white/10 hover:text-white"
      )}
    >
      {/* Horizontal tick connecting the vertical tree rail to this item */}
      <span
        aria-hidden
        className={cn(
          "absolute -left-3 top-1/2 h-px w-3 -translate-y-1/2 transition-colors duration-300",
          active ? "bg-white/60" : "bg-white/20"
        )}
      />
      <Icon className="size-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{item.title}</span>
      {item.badge && (
        <span
          className={cn(
            "shrink-0 rounded-full px-1.5 py-px text-[10px] font-bold tabular-nums",
            active ? "bg-white text-primary" : "bg-white/15 text-white"
          )}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}

/* --------------------------------- Rail flyout (collapsed) --------------------------------- */

function RailGroupFlyout({
  group,
  onNavigate,
}: {
  group: NavGroup;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const GroupIcon = group.icon;
  const hasActive = group.items.some((item) => isNavActive(pathname, item.href));

  // Single-item groups navigate directly — no flyout needed.
  if (group.items.length === 1) {
    const item = group.items[0];
    const active = isNavActive(pathname, item.href);
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        title={item.title}
        aria-current={active ? "page" : undefined}
        className={cn(
          "mx-auto grid size-10 place-items-center rounded-xl transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
          active
            ? "bg-white text-primary shadow-[0_4px_14px_-4px_rgb(0_0_0/0.35)]"
            : "text-white/70 hover:bg-white/10 hover:text-white"
        )}
      >
        <GroupIcon className="size-[18px]" />
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        title={group.label}
        aria-label={group.label}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "mx-auto grid size-10 place-items-center rounded-xl transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
          hasActive || open
            ? "bg-white/[0.14] text-white"
            : "text-white/70 hover:bg-white/10 hover:text-white"
        )}
      >
        <GroupIcon className="size-[18px]" />
      </button>

      {/* Floating submenu card — transparent padding bridges the hover gap */}
      <div
        className={cn(
          "absolute left-full top-0 z-50 pl-3 transition-all duration-200 ease-out",
          open
            ? "visible translate-x-0 opacity-100"
            : "invisible -translate-x-1 opacity-0"
        )}
      >
        <div className="w-60 overflow-hidden rounded-2xl border border-border/60 bg-white p-1.5 shadow-[0_24px_60px_-16px_rgb(30_20_80/0.45)]">
          <p className="px-2.5 pb-1 pt-2 text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {group.label}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = isNavActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium transition-colors duration-150",
                    active
                      ? "bg-primary text-white shadow-sm"
                      : "text-foreground/80 hover:bg-brand-50 hover:text-primary"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{item.title}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-1.5 py-px text-[10px] font-bold tabular-nums",
                        active ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Expandable module group --------------------------------- */

export function CollapsibleNavGroup({
  group,
  collapsed,
  onNavigate,
}: CollapsibleNavGroupProps) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = React.useState(group.defaultExpanded ?? false);

  const hasActiveItem = group.items.some((item) => isNavActive(pathname, item.href));

  React.useEffect(() => {
    if (hasActiveItem) {
      setIsExpanded(true);
    }
  }, [hasActiveItem]);

  // Collapsed rail — one icon per module with a floating submenu card.
  if (collapsed) {
    return <RailGroupFlyout group={group} onNavigate={onNavigate} />;
  }

  // Single-item modules render as a direct link (no redundant header).
  if (group.items.length === 1) {
    const item = group.items[0];
    const active = isNavActive(pathname, item.href);
    const Icon = item.icon;
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[13.5px] font-semibold transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
          active
            ? "bg-white/[0.14] text-white"
            : "text-white/80 hover:bg-white/[0.07] hover:text-white"
        )}
      >
        <Icon className="size-[18px] shrink-0" />
        <span className="min-w-0 flex-1 truncate text-left">{item.title}</span>
        {item.badge && (
          <span className="shrink-0 rounded-full bg-white px-1.5 py-px text-[10px] font-bold tabular-nums text-primary">
            {item.badge}
          </span>
        )}
      </Link>
    );
  }

  const GroupIcon = group.icon;

  return (
    <div>
      {/* Module header row */}
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        aria-expanded={isExpanded}
        className={cn(
          "group flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[13.5px] font-semibold transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
          isExpanded
            ? "bg-white/[0.07] text-white"
            : "text-white/80 hover:bg-white/[0.07] hover:text-white"
        )}
      >
        <GroupIcon className="size-[18px] shrink-0" />
        <span className="min-w-0 flex-1 truncate text-left">{group.label}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-white/50 transition-transform duration-300 ease-out group-hover:text-white/80",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {/* Submodules — smooth height animation with staggered item entrance */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="relative ml-[26px] mt-1 space-y-0.5 border-l border-white/15 pl-3">
            {group.items.map((item, index) => (
              <TreeSubItem
                key={item.href}
                item={item}
                index={index}
                expanded={isExpanded}
                active={isNavActive(pathname, item.href)}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

