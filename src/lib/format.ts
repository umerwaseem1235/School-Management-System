const pkr = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});

const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const number = new Intl.NumberFormat("en-US");

/** Rs 1,250,000 */
export const formatCurrency = (value: number) =>
  pkr.format(value).replace("PKR", "Rs").replace(/\s+/, " ");

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
