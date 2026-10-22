"use client";

import * as React from "react";
import { Calendar, Building2 } from "lucide-react";
import { DonutChart, DonutLegend, type DonutSlice } from "@/components/charts";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

interface GrowthItem {
  id: string;
  name: string;
  label: string;
  value: number;
  color: string;
  growth: string;
  growthVal: string;
  share: string;
  meta: string;
}

const SESSION_ITEMS: GrowthItem[] = [
  {
    id: "2026",
    name: "2026 (Current)",
    label: "2026 Academic Session",
    value: 5662,
    color: "#1e4275", // Sapphire Navy Brand
    growth: "+5.0% YoY",
    growthVal: "+5.0%",
    share: "17.4%",
    meta: "+267 new enrollments",
  },
  {
    id: "2025",
    name: "2025",
    label: "2025 Academic Session",
    value: 5395,
    color: "#2f8f6b", // Emerald Green
    growth: "+5.0% YoY",
    growthVal: "+5.0%",
    share: "16.6%",
    meta: "+255 new enrollments",
  },
  {
    id: "2024",
    name: "2024",
    label: "2024 Academic Session",
    value: 5140,
    color: "#3c6fb0", // Ocean Blue
    growth: "+5.5% YoY",
    growthVal: "+5.5%",
    share: "15.8%",
    meta: "+270 new enrollments",
  },
  {
    id: "2023",
    name: "2023",
    label: "2023 Academic Session",
    value: 4870,
    color: "#c7841f", // Warm Amber Gold
    growth: "+8.0% YoY",
    growthVal: "+8.0%",
    share: "15.0%",
    meta: "+360 new enrollments",
  },
  {
    id: "2022",
    name: "2022",
    label: "2022 Academic Session",
    value: 4510,
    color: "#7f88b8", // Lavender Slate
    growth: "+7.9% YoY",
    growthVal: "+7.9%",
    share: "13.9%",
    meta: "+330 new enrollments",
  },
  {
    id: "2021",
    name: "2021",
    label: "2021 Academic Session",
    value: 4180,
    color: "#3f6396", // Slate Blue
    growth: "+6.6% YoY",
    growthVal: "+6.6%",
    share: "12.9%",
    meta: "+260 new enrollments",
  },
  {
    id: "2020",
    name: "2020",
    label: "2020 Academic Session",
    value: 3920,
    color: "#7f9cc4", // Soft Sky Blue
    growth: "Base Year",
    growthVal: "Base",
    share: "12.1%",
    meta: "Initial baseline year",
  },
];

const CAMPUS_ITEMS: GrowthItem[] = [
  {
    id: "gulberg",
    name: "Gulberg",
    label: "Gulberg Campus",
    value: 1748,
    color: "#1e4275",
    growth: "30.9% share",
    growthVal: "30.9%",
    share: "30.9%",
    meta: "1,748 students · 61 staff",
  },
  {
    id: "dha",
    name: "DHA Phase 5",
    label: "DHA Phase 5 Campus",
    value: 1244,
    color: "#3c6fb0",
    growth: "22.0% share",
    growthVal: "22.0%",
    share: "22.0%",
    meta: "1,244 students · 52 staff",
  },
  {
    id: "f8",
    name: "F-8 Islamabad",
    label: "F-8 Islamabad Campus",
    value: 1029,
    color: "#2f8f6b",
    growth: "18.2% share",
    growthVal: "18.2%",
    share: "18.2%",
    meta: "1,029 students · 47 staff",
  },
  {
    id: "clifton",
    name: "Clifton",
    label: "Clifton Campus",
    value: 893,
    color: "#c7841f",
    growth: "15.8% share",
    growthVal: "15.8%",
    share: "15.8%",
    meta: "893 students · 58 staff",
  },
  {
    id: "bahria",
    name: "Bahria Town",
    label: "Bahria Town Campus",
    value: 381,
    color: "#7f88b8",
    growth: "6.7% share",
    growthVal: "6.7%",
    share: "6.7%",
    meta: "381 students · 20 staff",
  },
];

export function EnrollmentGrowthCard({ className }: { className?: string }) {
  const [dataSource, setDataSource] = React.useState<"sessions" | "campuses">("sessions");
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const items = dataSource === "sessions" ? SESSION_ITEMS : CAMPUS_ITEMS;
  const isHovering = hoveredIndex !== null && hoveredIndex >= 0 && hoveredIndex < items.length;
  const activeItem = isHovering ? items[hoveredIndex] : items[0];

  const chartSlices: DonutSlice[] = items.map((item) => ({
    name: item.name,
    value: item.value,
    color: item.color,
  }));

  const handleDataSourceChange = (source: "sessions" | "campuses") => {
    setDataSource(source);
    setHoveredIndex(null);
  };

  return (
    <div className={cn("flex flex-col h-full justify-between space-y-4", className)}>
      {/* Controls Bar */}
      <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
        {/* Dataset Switcher (Sessions vs Campuses) */}
        <div className="inline-flex items-center rounded-lg bg-muted/60 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => handleDataSourceChange("sessions")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all",
              dataSource === "sessions"
                ? "bg-white text-brand shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="View by Academic Sessions"
          >
            <Calendar className="size-3" />
            <span>By Session</span>
          </button>
          <button
            type="button"
            onClick={() => handleDataSourceChange("campuses")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all",
              dataSource === "campuses"
                ? "bg-white text-brand shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="View by Campus Distribution"
          >
            <Building2 className="size-3" />
            <span>By Campus</span>
          </button>
        </div>

        <span className="text-[11px] font-medium text-muted-foreground">
          {dataSource === "sessions" ? "YoY Trend" : "Branch Share"}
        </span>
      </div>

      {/* Donut Chart & Legend Display */}
      <div className="flex flex-col items-center justify-center gap-5 sm:flex-row sm:items-center sm:gap-6 py-1">
        <div className="w-full shrink-0 sm:w-[170px]">
          <DonutChart
            data={chartSlices}
            centerValue={isHovering ? formatNumber(activeItem.value) : formatNumber(5662)}
            centerLabel={
              isHovering
                ? `${activeItem.name} · ${activeItem.growthVal}`
                : dataSource === "sessions"
                ? "2026 Enrolled"
                : "Total Students"
            }
            format="compact"
            innerRadius="64%"
            className="max-w-[170px]"
            centerValueClassName="text-[15px] sm:text-base font-bold"
            centerLabelClassName="text-[10px] tracking-tight"
            showTooltip={false}
            activeIndex={hoveredIndex}
            onHoverIndex={setHoveredIndex}
          />
        </div>

        <div className="w-full flex-1 min-w-0">
          <DonutLegend
            data={chartSlices}
            format="compact"
            className="max-h-[190px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin text-xs"
            activeIndex={hoveredIndex}
            onHoverIndex={setHoveredIndex}
          />
        </div>
      </div>

      {/* Summary Footer */}
      <div className="flex items-center justify-between border-t border-border/50 pt-2.5 text-[11px] text-muted-foreground">
        <span className="font-medium">
          {dataSource === "sessions" ? "7 Academic Sessions (2020–2026)" : "5 Active Campuses"}
        </span>
        <span className="font-semibold text-foreground">
          5,662 Active Students
        </span>
      </div>
    </div>
  );
}
