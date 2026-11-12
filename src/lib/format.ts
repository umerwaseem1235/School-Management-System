const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const number = new Intl.NumberFormat("en-US");

/** Rs 1,250,000 - Deterministic formatting for SSR consistency */
export const formatCurrency = (value: number) => {
  // Use a deterministic approach to avoid hydration mismatches
  const num = Number(value) || 0;
  const formatted = num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `Rs ${formatted}`;
};

/** Rs 1.3M */
export const formatCurrencyCompact = (value: number) =>
  `Rs ${compact.format(value)}`;

export const formatNumber = (value: number) => number.format(value);

export const formatCompact = (value: number) => compact.format(value);

export const formatPercent = (value: number, digits = 1) =>
  `${value.toFixed(digits)}%`;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

export interface CampusDisplayInfo {
  label: string;
  primary: string;
  secondary: string;
}

const CAMPUS_DISPLAY_MAP: Record<string, CampusDisplayInfo> = {
  "Main Campus — Gulberg": {
    label: "Main Campus (Gulberg)",
    primary: "Main Campus",
    secondary: "Gulberg, Lahore",
  },
  "DHA Phase 5 Campus": {
    label: "DHA Phase 5 (Lahore)",
    primary: "DHA Phase 5",
    secondary: "Sector C, Lahore",
  },
  "F-8 Islamabad Campus": {
    label: "F-8 Campus (Islamabad)",
    primary: "F-8 Campus",
    secondary: "Sector F-8, Islamabad",
  },
  "Clifton Karachi Campus": {
    label: "Clifton Campus (Karachi)",
    primary: "Clifton Campus",
    secondary: "Block 5, Karachi",
  },
  "Bahria Town Campus": {
    label: "Bahria Town (Rawalpindi)",
    primary: "Bahria Town",
    secondary: "Phase 7, Rawalpindi",
  },
};

export const formatCampusDisplay = (name: string): CampusDisplayInfo => {
  if (!name) {
    return { label: "", primary: "", secondary: "" };
  }
  if (name === "All Campuses") {
    return {
      label: "All Campuses",
      primary: "All Campuses",
      secondary: "System-wide",
    };
  }
  if (CAMPUS_DISPLAY_MAP[name]) {
    return CAMPUS_DISPLAY_MAP[name];
  }
  const clean = name.replace(/\s+Campus$/i, "").replace(/—\s*/g, " · ").trim();
  return {
    label: clean,
    primary: clean,
    secondary: "",
  };
};

/** Formats an integer ordinal label (e.g. 1 -> "1st", 2 -> "2nd", 3 -> "3rd"). */
export const formatOrdinal = (n: number): string => {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
};
