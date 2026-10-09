"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

/**
 * Charts accept only serializable props (no functions) so they can be
 * rendered directly from Server Components.
 */
export type ValueFormat = "number" | "percent" | "millions" | "compact";

export interface Series {
  key: string;
  label: string;
  color: string;
}

type Row = Record<string, string | number>;

const fmt = (format: ValueFormat | undefined, v: number | string) => {
  const n = Number(v);
  switch (format) {
    case "percent":
      return `${n}%`;
    case "millions":
      return `Rs ${n}M`;
    case "compact":
      return new Intl.NumberFormat("en", { notation: "compact" }).format(n);
    default:
      return new Intl.NumberFormat("en-US").format(n);
  }
};

const toConfig = (series: Series[]): ChartConfig =>
  Object.fromEntries(series.map((s) => [s.key, { label: s.label, color: s.color }]));

interface BaseProps {
  data: Row[];
  xKey: string;
  series: Series[];
  format?: ValueFormat;
  className?: string;
  showLegend?: boolean;
  yDomain?: [number | "auto", number | "auto"];
}

export function AreaTrendChart({
  data,
  xKey,
  series,
  format,
  className,
  showLegend = true,
  yDomain,
}: BaseProps) {
  return (
    <ChartContainer config={toConfig(series)} className={cn("aspect-auto h-[280px] w-full", className)}>
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={`var(--color-${s.key})`} stopOpacity={0.28} />
              <stop offset="95%" stopColor={`var(--color-${s.key})`} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="4 4" />
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={10} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          domain={yDomain}
          tickFormatter={(v) => fmt(format, v)}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" formatter={(v, n) => (
            <div className="flex w-full items-center justify-between gap-4">
              <span className="text-muted-foreground">{toConfig(series)[n as string]?.label}</span>
              <span className="font-mono font-semibold tabular-nums">{fmt(format, v as number)}</span>
            </div>
          )} />}
        />
        {series.map((s) => (
          <Area
            key={s.key}
            dataKey={s.key}
            type="monotone"
            stroke={`var(--color-${s.key})`}
            strokeWidth={2.25}
            fill={`url(#fill-${s.key})`}
          />
        ))}
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}
      </AreaChart>
    </ChartContainer>
  );
}

export function LineTrendChart({
  data,
  xKey,
  series,
  format,
  className,
  showLegend = false,
  yDomain,
}: BaseProps) {
  return (
    <ChartContainer config={toConfig(series)} className={cn("aspect-auto h-[260px] w-full", className)}>
      <LineChart data={data} margin={{ left: 0, right: 12, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="4 4" />
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={10} />
        <YAxis tickLine={false} axisLine={false} width={48} domain={yDomain} tickFormatter={(v) => fmt(format, v)} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
        {series.map((s) => (
          <Line
            key={s.key}
            dataKey={s.key}
            type="monotone"
            stroke={`var(--color-${s.key})`}
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: "white", strokeWidth: 2 }}
            activeDot={{ r: 5 }}
          />
        ))}
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}
      </LineChart>
    </ChartContainer>
  );
}

export function BarSeriesChart({
  data,
  xKey,
  series,
  format,
  className,
  showLegend = false,
  stacked = false,
  horizontal = false,
  yDomain,
}: BaseProps & { stacked?: boolean; horizontal?: boolean }) {
  return (
    <ChartContainer config={toConfig(series)} className={cn("aspect-auto h-[260px] w-full", className)}>
      <BarChart
        data={data}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ left: horizontal ? 8 : 0, right: 12, top: 8 }}
        barCategoryGap={horizontal ? 10 : "22%"}
      >
        <CartesianGrid vertical={horizontal} horizontal={!horizontal} strokeDasharray="4 4" />
        {horizontal ? (
          <>
            <XAxis type="number" hide domain={yDomain} />
            <YAxis dataKey={xKey} type="category" tickLine={false} axisLine={false} width={96} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis tickLine={false} axisLine={false} width={48} domain={yDomain} tickFormatter={(v) => fmt(format, v)} />
          </>
        )}
        <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent />} />
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            stackId={stacked ? "a" : undefined}
            fill={`var(--color-${s.key})`}
            radius={
              stacked
                ? i === series.length - 1
                  ? horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]
                  : 0
                : horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]
            }
            maxBarSize={horizontal ? 18 : 36}
          />
        ))}
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}
      </BarChart>
    </ChartContainer>
  );
}

export interface DonutSlice {
  name: string;
  value: number;
  color: string;
}

export function DonutChart({
  data,
  centerValue,
  centerLabel,
  className,
  format,
}: {
  data: DonutSlice[];
  centerValue?: string;
  centerLabel?: string;
  className?: string;
  format?: ValueFormat;
}) {
  const config: ChartConfig = Object.fromEntries(
    data.map((d) => [d.name, { label: d.name, color: d.color }])
  );
  return (
    <div className={cn("relative mx-auto aspect-square w-full max-w-[220px]", className)}>
      <ChartContainer config={config} className="aspect-square h-full w-full">
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel formatter={(v, n) => (
              <div className="flex w-full items-center justify-between gap-4">
                <span className="text-muted-foreground">{n}</span>
                <span className="font-mono font-semibold">{fmt(format, v as number)}</span>
              </div>
            )} />}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="68%"
            outerRadius="100%"
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      {(centerValue || centerLabel) && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            {centerValue && (
              <p className="font-heading text-xl font-bold text-brand">{centerValue}</p>
            )}
            {centerLabel && (
              <p className="text-xs text-muted-foreground">{centerLabel}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Legend list rendered next to donuts. */
export function DonutLegend({
  data,
  format,
}: {
  data: DonutSlice[];
  format?: ValueFormat;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <ul className="space-y-2.5">
      {data.map((d) => (
        <li key={d.name} className="flex items-center gap-3 text-sm">
          <span className="size-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
          <span className="flex-1 text-muted-foreground">{d.name}</span>
          <span className="font-semibold tabular-nums text-foreground">{fmt(format, d.value)}</span>
          <span className="w-12 text-right text-xs tabular-nums text-muted-foreground">
            {((d.value / total) * 100).toFixed(1)}%
          </span>
        </li>
      ))}
    </ul>
  );
}
