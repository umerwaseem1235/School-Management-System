import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

const palette = [
  "bg-brand text-cream",
  "bg-gold-soft text-gold",
  "bg-success-soft text-success",
  "bg-info-soft text-info",
  "bg-brand-100 text-brand",
  "bg-warning-soft text-warning",
];

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function UserAvatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = { sm: "size-7 text-[10px]", md: "size-9 text-xs", lg: "size-12 text-sm" };
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-heading font-bold",
        sizes[size],
        palette[hash(name) % palette.length],
        className
      )}
    >
      {initials(name.replace(/^(Dr|Mr|Mrs|Ms)\.?\s/, ""))}
    </span>
  );
}

export function PersonCell({
  name,
  subtitle,
}: {
  name: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <UserAvatar name={name} />
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{name}</p>
        {subtitle && (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
