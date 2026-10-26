"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavGroup, NavItem } from "@/config/navigation";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export interface CollapsibleNavGroupProps {
  group: NavGroup;
  collapsed?: boolean;
  sidebarExpanded?: boolean;
  onNavigate?: () => void;
}

export function isNavActive(
  pathname: string,
  href: string,
  exact?: boolean
): boolean {
  if (exact) {
    return pathname === href;
  }
  if (href === "/dashboard" || href === "/") {
    return pathname === "/" || pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/* --------------------------------- Hover Tooltip Wrapper --------------------------------- */

function NavTooltip({
  title,
  badge,
  disabled,
  children,
}: {
  title: string;
  badge?: string;
  disabled?: boolean;
  children: React.ReactElement;
}) {
  if (disabled) {
    return children;
  }

  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent
        side="right"
        sideOffset={14}
        className="z-50 flex items-center gap-2 rounded-lg border border-white/15 bg-[#0c2038]/95 px-3 py-1.5 text-xs font-medium text-white shadow-xl backdrop-blur-md"
      >
        <span>{title}</span>
        {badge && (
          <span className="rounded-full bg-white/20 px-1.5 py-px text-[10px] font-bold tabular-nums text-white">
            {badge}
          </span>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

/* ---------------------------------- Tree Sub-Item ---------------------------------- */

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
      className={cn(
        "group relative flex h-8.5 items-center gap-2.5 rounded-lg px-2 text-[13px] font-medium transition-colors duration-150 motion-reduce:transition-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
        active
          ? "bg-white/[0.14] text-white shadow-xs font-semibold"
          : "text-white/65 hover:bg-white/[0.08] hover:text-white"
      )}
    >
      {/* Horizontal tick connecting the vertical tree rail to this item */}
      <span
        aria-hidden
        className={cn(
          "absolute -left-3 top-1/2 h-px w-3 -translate-y-1/2 transition-colors duration-150",
          active
            ? "bg-white shadow-[0_0_6px_rgba(255,255,255,0.7)]"
            : "bg-white/30 group-hover:bg-white/60"
        )}
      />
      <Icon
        className={cn(
          "size-4 shrink-0 transition-colors duration-150",
          active
            ? "text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]"
            : "text-white/70 group-hover:text-white"
        )}
      />
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

/* ----------------------------- Collapsible Navigation Group ----------------------------- */

export function CollapsibleNavGroup({
  group,
  collapsed,
  sidebarExpanded,
  onNavigate,
}: CollapsibleNavGroupProps) {
  const pathname = usePathname();
  const hasActiveItem = group.items.some((item) =>
    isNavActive(pathname, item.href, item.exact)
  );

  const [isExpanded, setIsExpanded] = React.useState(
    hasActiveItem || (group.defaultExpanded ?? false)
  );

  React.useEffect(() => {
    if (hasActiveItem) {
      setIsExpanded(true);
    }
  }, [hasActiveItem]);

  // Determine whether the parent sidebar is currently expanded
  const isNavExpanded =
    sidebarExpanded !== undefined
      ? sidebarExpanded
      : collapsed !== undefined
        ? !collapsed
        : true;

  // Single-item groups (e.g. Dashboard) render as a direct navigation link
  if (group.items.length === 1) {
    const item = group.items[0];
    const active = isNavActive(pathname, item.href, item.exact);
    const Icon = item.icon;

    return (
      <div className="relative">
        <NavTooltip
          title={item.title}
          badge={item.badge}
          disabled={isNavExpanded}
        >
          <Link
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex h-10 w-full items-center rounded-xl text-[13.5px] font-medium transition-colors duration-150 motion-reduce:transition-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
              "px-2.5",
              active
                ? "bg-white/[0.14] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_4px_12px_-2px_rgba(0,0,0,0.35)] font-semibold"
                : "text-white/75 hover:bg-white/[0.08] hover:text-white"
            )}
          >
            {/* Sliding active indicator bar */}
            {active && (
              <span
                aria-hidden
                className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              />
            )}
            <div className="grid size-5 shrink-0 place-items-center">
              <Icon
                className={cn(
                  "size-[18px] shrink-0 transition-colors duration-150",
                  active
                    ? "text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]"
                    : "text-white/80 group-hover:text-white"
                )}
              />
            </div>
            <div
              className={cn(
                "flex flex-1 items-center justify-between min-w-0 overflow-hidden whitespace-nowrap pl-2.5 transition-all duration-200 ease-out motion-reduce:transition-none",
                isNavExpanded
                  ? "opacity-100 translate-x-0 delay-75"
                  : "opacity-0 -translate-x-2 pointer-events-none"
              )}
            >
              <span className="truncate text-left">{item.title}</span>
              {item.badge && (
                <span
                  className={cn(
                    "ml-2 shrink-0 rounded-full px-1.5 py-px text-[10px] font-bold tabular-nums",
                    active ? "bg-white text-primary" : "bg-white/20 text-white"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </div>
          </Link>
        </NavTooltip>
      </div>
    );
  }

  // Multi-item module group
  const GroupIcon = group.icon;

  return (
    <div className="relative">
      <NavTooltip
        title={group.label}
        badge={group.items.length > 0 ? `${group.items.length}` : undefined}
        disabled={isNavExpanded}
      >
        <button
          type="button"
          onClick={() => {
            if (isNavExpanded) {
              setIsExpanded((v) => !v);
            }
          }}
          aria-expanded={isExpanded}
          className={cn(
            "group relative flex h-10 w-full items-center rounded-xl text-[13.5px] font-medium transition-colors duration-150 motion-reduce:transition-none",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
            "px-2.5",
            hasActiveItem || (isNavExpanded && isExpanded)
              ? "bg-white/[0.10] text-white"
              : "text-white/75 hover:bg-white/[0.08] hover:text-white"
          )}
        >
          {/* Active indicator bar when group contains the active route */}
          {hasActiveItem && (
            <span
              aria-hidden
              className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            />
          )}
          <div className="grid size-5 shrink-0 place-items-center">
            <GroupIcon
              className={cn(
                "size-[18px] shrink-0 transition-colors duration-150",
                hasActiveItem
                  ? "text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]"
                  : "text-white/80 group-hover:text-white"
              )}
            />
          </div>
          <div
            className={cn(
              "flex flex-1 items-center justify-between min-w-0 overflow-hidden whitespace-nowrap pl-2.5 transition-all duration-200 ease-out motion-reduce:transition-none",
              isNavExpanded
                ? "opacity-100 translate-x-0 delay-75"
                : "opacity-0 -translate-x-2 pointer-events-none"
            )}
          >
            <span className="truncate text-left">{group.label}</span>
            <ChevronDown
              className={cn(
                "ml-2 size-4 shrink-0 text-white/50 transition-transform duration-200 ease-out group-hover:text-white/80",
                isExpanded && "rotate-180"
              )}
            />
          </div>
        </button>
      </NavTooltip>

      {/* Submodules Accordion — smoothly revealed when sidebar is expanded */}
      <div
        className={cn(
          "grid transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
          isNavExpanded && isExpanded
            ? "grid-rows-[1fr] opacity-100 mt-1"
            : "grid-rows-[0fr] opacity-0 mt-0 pointer-events-none overflow-hidden"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="relative ml-[22px] space-y-0.5 border-l border-white/20 pl-3">
            {group.items.map((item, index) => (
              <TreeSubItem
                key={item.href}
                item={item}
                index={index}
                expanded={isNavExpanded && isExpanded}
                active={isNavActive(pathname, item.href, item.exact)}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
