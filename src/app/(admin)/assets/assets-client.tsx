"use client";

import * as React from "react";
import {
  Box,
  Download,
  Edit,
  Layers,
  MapPin,
  Plus,
  Printer,
  ShieldCheck,
  Trash2,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import {
  DataTable,
  type Column,
  type FilterDef,
} from "@/components/shared/data-table";
import { ActionButton } from "@/components/shared/action-button";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import {
  CONDITION_COLORS,
  INITIAL_ASSETS,
  type AssetCondition,
  type AssetRecord,
} from "@/lib/mock/assets";
import { exportAssetsPdf, printAssetRegister } from "./assets-export";
import { AssetFormModal, DeleteAssetModal } from "./assets-form-modals";

/* ═══════════════════════════════════════════════════════════════════════════
 *  Condition Badge Component (colored dot + label — matches screenshot)
 * ═══════════════════════════════════════════════════════════════════════════ */

function ConditionBadge({ condition }: { condition: AssetCondition }) {
  const colors = CONDITION_COLORS[condition];
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize",
        colors.bg,
        colors.text
      )}
    >
      {condition.toLowerCase()}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  Main Client Component
 * ═══════════════════════════════════════════════════════════════════════════ */

export function AssetsClient() {
  /* ─── State ─── */
  const [assets, setAssets] = React.useState<AssetRecord[]>(INITIAL_ASSETS);

  // Add / Edit Modal
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingAsset, setEditingAsset] = React.useState<AssetRecord | null>(
    null
  );

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = React.useState<{
    id: string;
    name: string;
  } | null>(null);

  /* ─── KPI Aggregates ─── */
  const kpis = React.useMemo(() => {
    const total = assets.length;
    const totalValue = assets.reduce((s, a) => s + a.purchaseCost, 0);

    const conditionCounts = { New: 0, Good: 0, Fair: 0, Poor: 0 };
    assets.forEach((a) => {
      conditionCounts[a.condition]++;
    });

    const uniqueLocations = new Set(assets.map((a) => a.location)).size;

    return { total, totalValue, conditionCounts, uniqueLocations };
  }, [assets]);

  /* ─── CRUD Handlers ─── */
  const handleSave = React.useCallback((record: AssetRecord) => {
    setAssets((prev) => {
      const exists = prev.some((a) => a.id === record.id);
      return exists
        ? prev.map((a) => (a.id === record.id ? record : a))
        : [record, ...prev];
    });
  }, []);

  const handleDelete = React.useCallback((id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  }, []);

  /* ─── Table Columns ─── */
  const columns = React.useMemo<Column<AssetRecord>[]>(
    () => [
      {
        key: "assetCode",
        header: "Code",
        cell: (r) => (
          <span className="font-mono text-[11px] font-semibold text-brand/80">
            {r.assetCode}
          </span>
        ),
        sortValue: (r) => r.assetCode,
        className: "w-[90px]",
      },
      {
        key: "name",
        header: "Name",
        cell: (r) => (
          <div className="min-w-0">
            <div className="text-xs font-semibold text-foreground truncate">
              {r.name}
            </div>
            {r.remarks && (
              <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                {r.remarks}
              </div>
            )}
          </div>
        ),
        sortValue: (r) => r.name,
      },
      {
        key: "location",
        header: "Location",
        cell: (r) => (
          <span className="text-xs text-foreground/80">{r.location}</span>
        ),
        sortValue: (r) => r.location,
      },
      {
        key: "category",
        header: "Category",
        cell: (r) => (
          <span className="text-xs text-foreground/80">{r.category}</span>
        ),
        sortValue: (r) => r.category,
      },
      {
        key: "condition",
        header: "Condition",
        cell: (r) => <ConditionBadge condition={r.condition} />,
        sortValue: (r) => r.condition,
        headerAlign: "center",
        align: "center",
        className: "w-[110px]",
      },
      {
        key: "purchaseDate",
        header: "Purchase Date",
        cell: (r) => (
          <span className="text-xs text-foreground/70">
            {formatDate(r.purchaseDate)}
          </span>
        ),
        sortValue: (r) => r.purchaseDate,
      },
      {
        key: "purchaseCost",
        header: "Cost",
        align: "right",
        headerAlign: "right",
        cell: (r) => (
          <span className="text-xs font-semibold text-foreground">
            {formatCurrency(r.purchaseCost)}
          </span>
        ),
        sortValue: (r) => r.purchaseCost,
        className: "w-[120px]",
      },
      {
        key: "actions",
        header: "Actions",
        align: "center",
        headerAlign: "center",
        className: "w-[100px]",
        cell: (r) => (
          <div className="flex items-center justify-center gap-1">
            <ActionButton
              tone="outline"
              size="xs"
              onClick={() => {
                setEditingAsset(r);
                setFormOpen(true);
              }}
            >
              <Edit className="h-3 w-3" />
            </ActionButton>
            <ActionButton
              tone="danger"
              size="xs"
              onClick={() =>
                setDeleteTarget({ id: r.id, name: r.name })
              }
            >
              <Trash2 className="h-3 w-3" />
            </ActionButton>
          </div>
        ),
      },
    ],
    []
  );

  /* ─── Filters ─── */
  const filters = React.useMemo<FilterDef<AssetRecord>[]>(
    () => [
      {
        key: "condition",
        label: "Condition",
        allLabel: "All Conditions",
        options: ["New", "Good", "Fair", "Poor"],
        getValue: (r: AssetRecord) => r.condition,
      },
      {
        key: "category",
        label: "Category",
        allLabel: "All Categories",
        options: [
          "IT & Computing",
          "Power & Energy",
          "Furniture",
          "Lab Equipment",
          "Transport",
          "Sports & Recreation",
          "Appliance",
          "AV & Multimedia",
          "Security",
          "Other",
        ],
        getValue: (r: AssetRecord) => r.category,
      },
    ],
    []
  );

  /* ─── Render ─── */
  return (
    <div className="flex flex-col gap-6">
      {/* ─── Page Header ─── */}
      <PageHeader
        title="Asset Register"
        className="mb-0 lg:mb-0"
        actions={
          <>
            <ActionButton tone="outline" size="md" onClick={() => printAssetRegister(assets)}>
              <Printer />
              <span>Print</span>
            </ActionButton>
            <ActionButton tone="pdf" size="md" onClick={() => exportAssetsPdf(assets)}>
              <Download />
              <span>Export PDF</span>
            </ActionButton>
            <ActionButton
              tone="primary"
              size="md"
              onClick={() => {
                setEditingAsset(null);
                setFormOpen(true);
              }}
            >
              <Plus />
              <span>Add Asset</span>
            </ActionButton>
          </>
        }
      />

      {/* ─── KPI Cards ─── */}
      <StatGrid>
        <StatCard
          icon={Box}
          label="Total Assets"
          value={formatNumber(kpis.total)}
          title={`${kpis.total} assets registered in the system`}
        />
        <StatCard
          icon={ShieldCheck}
          label="Good / New"
          value={formatNumber(
            kpis.conditionCounts.Good + kpis.conditionCounts.New
          )}
          title={`${kpis.conditionCounts.New} new · ${kpis.conditionCounts.Good} good condition`}
        />
        <StatCard
          icon={Wrench}
          label="Fair / Poor"
          value={formatNumber(
            kpis.conditionCounts.Fair + kpis.conditionCounts.Poor
          )}
          title={`${kpis.conditionCounts.Fair} fair · ${kpis.conditionCounts.Poor} poor condition`}
        />
        <StatCard
          icon={MapPin}
          label="Locations"
          value={formatNumber(kpis.uniqueLocations)}
          title={`PKR ${(kpis.totalValue / 1_000_000).toFixed(1)}M total asset value`}
        />
      </StatGrid>

      {/* ─── Data Table ─── */}
      <SectionCard flush contentClassName="pt-5">
        <DataTable<AssetRecord>
          data={assets}
          columns={columns}
          getRowId={(r) => r.id}
          filters={filters}
          searchFn={(r, q) => {
            const lower = q.toLowerCase();
            return (
              r.name.toLowerCase().includes(lower) ||
              r.location.toLowerCase().includes(lower) ||
              r.assetCode.toLowerCase().includes(lower) ||
              r.category.toLowerCase().includes(lower) ||
              r.condition.toLowerCase().includes(lower)
            );
          }}
          pageSize={10}
        />
      </SectionCard>

      {/* ─── Modals ─── */}
      <AssetFormModal
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditingAsset(null);
        }}
        totalCount={assets.length}
        initialData={editingAsset}
        onSave={handleSave}
      />

      {deleteTarget && (
        <DeleteAssetModal
          open={true}
          onOpenChange={(v) => {
            if (!v) setDeleteTarget(null);
          }}
          assetName={deleteTarget.name}
          onConfirm={() => {
            handleDelete(deleteTarget.id);
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
}
