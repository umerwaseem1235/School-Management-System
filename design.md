# Design System: School Management System

**Brand color:** `#6040da` (Violet)
**Stack:** Tailwind CSS + shadcn/ui (Radix) + lucide-react
**Related:** `PRD.md`, `architecture.md`, `rules.md`

This document defines the visual language and UI standards. All screens must be built from these tokens and shared components in `src/components/ui`. Do not hard-code colors, spacing or font sizes in feature modules.

---

## 1. Design Principles

1. **Clear over clever:** staff use this daily under time pressure (attendance, marks entry). Prioritize speed and readability.
2. **Consistent:** the same pattern for the same task across every module (lists, forms, detail pages).
3. **Calm and trustworthy:** a school handles sensitive data about minors. The UI should feel professional and stable, with violet used as an accent rather than a flood of color.
4. **Accessible:** WCAG 2.1 AA minimum for contrast, focus and keyboard use.
5. **Responsive:** usable on desktop, tablet and mobile browsers.

---

## 2. Color System

### 2.1 Brand Palette (Primary: Violet)

Base brand color **`#6040da`** is the `600` step. Use `600` for primary actions, `700` for hover, `800` for pressed.

| Token | Hex | Usage |
|---|---|---|
| `primary-50` | `#F4F2FE` | Subtle backgrounds, selected row tint |
| `primary-100` | `#EAE6FD` | Hover backgrounds, soft badges |
| `primary-200` | `#D8D1FB` | Borders on tinted surfaces, focus ring halo |
| `primary-300` | `#BCB0F6` | Disabled primary, decorative |
| `primary-400` | `#9A86EE` | Icons on dark, charts |
| `primary-500` | `#7A5FE4` | Secondary emphasis, links on dark |
| **`primary-600`** | **`#6040DA`** | **Brand / primary buttons / active nav** |
| `primary-700` | `#5030BF` | Hover on primary |
| `primary-800` | `#432A9A` | Pressed / active |
| `primary-900` | `#3A267B` | Dark sidebar accents, headings on tint |
| `primary-950` | `#231650` | Darkest surfaces (dark mode) |

> Contrast: white text on `#6040DA` is about **6.5:1** (passes AA for normal text). Use `primary-700` or darker for primary-colored text on white where extra contrast is needed.

### 2.2 Neutral Palette (violet-tinted slate)

Neutrals carry a slight violet tint so they harmonize with the brand.

| Token | Hex | Usage |
|---|---|---|
| `neutral-0` | `#FFFFFF` | Cards, inputs |
| `neutral-50` | `#F8F7FC` | App background |
| `neutral-100` | `#F0EFF7` | Muted surfaces, table header |
| `neutral-200` | `#E3E1EE` | Borders, dividers |
| `neutral-300` | `#CBC8DC` | Input borders, disabled borders |
| `neutral-400` | `#9C98B3` | Placeholder text, disabled text |
| `neutral-500` | `#6F6B88` | Secondary text |
| `neutral-600` | `#524E69` | Body text (secondary) |
| `neutral-700` | `#3B3850` | Body text |
| `neutral-800` | `#26243A` | Headings |
| `neutral-900` | `#16142A` | Primary text, dark mode background |

### 2.3 Semantic Colors

| Purpose | Base | Soft background | Text on soft |
|---|---|---|---|
| **Success** | `#16A34A` | `#DCFCE7` | `#166534` |
| **Warning** | `#F59E0B` | `#FEF3C7` | `#92400E` |
| **Danger** | `#DC2626` | `#FEE2E2` | `#991B1B` |
| **Info** | `#0EA5E9` | `#E0F2FE` | `#075985` |

Never rely on color alone. Pair with an icon or text label (e.g. attendance status "Absent" + icon).

### 2.4 Domain Status Colors

| Status | Color | Used in |
|---|---|---|
| Present | Success | Attendance |
| Absent | Danger | Attendance |
| Late | Warning | Attendance |
| Leave | Info | Attendance |
| Pass / Published | Success | Results |
| Fail / Rejected | Danger | Results |
| Draft / Pending | Warning | Exams, admissions |
| Locked | Neutral-600 | Results |
| Issued / Returned | Success | Library, certificates |
| Overdue | Danger | Library |

### 2.5 Chart Palette (Dashboard)

Ordered for categorical series; all are distinguishable and AA against white.

| # | Hex | Name |
|---|---|---|
| 1 | `#6040DA` | Violet (brand) |
| 2 | `#0EA5E9` | Sky |
| 3 | `#10B981` | Emerald |
| 4 | `#F59E0B` | Amber |
| 5 | `#EC4899` | Pink |
| 6 | `#64748B` | Slate |

### 2.6 Module Accent Icons (optional navigation tint)

Keep all module icons in the brand color by default. If per-module tints are used on the dashboard cards only:

| Module | Accent |
|---|---|
| Administration | `#6040DA` |
| Academics | `#0EA5E9` |
| Examinations | `#F59E0B` |
| Student Life | `#10B981` |

---

## 3. Theme Tokens (CSS Variables)

Define in `src/app/globals.css`. Components use the semantic tokens (e.g. `bg-primary`), never raw hex.

```css
@layer base {
  :root {
    /* Surfaces */
    --background: #f8f7fc;
    --foreground: #16142a;
    --card: #ffffff;
    --card-foreground: #16142a;
    --popover: #ffffff;
    --popover-foreground: #16142a;
    --muted: #f0eff7;
    --muted-foreground: #6f6b88;

    /* Brand */
    --primary: #6040da;
    --primary-foreground: #ffffff;
    --primary-hover: #5030bf;
    --primary-soft: #eae6fd;
    --secondary: #eae6fd;
    --secondary-foreground: #3a267b;
    --accent: #f4f2fe;
    --accent-foreground: #3a267b;

    /* Feedback */
    --success: #16a34a;
    --success-soft: #dcfce7;
    --warning: #f59e0b;
    --warning-soft: #fef3c7;
    --destructive: #dc2626;
    --destructive-soft: #fee2e2;
    --destructive-foreground: #ffffff;
    --info: #0ea5e9;
    --info-soft: #e0f2fe;

    /* Lines & focus */
    --border: #e3e1ee;
    --input: #cbc8dc;
    --ring: #6040da;

    /* Sidebar */
    --sidebar: #ffffff;
    --sidebar-foreground: #3b3850;
    --sidebar-active: #eae6fd;
    --sidebar-active-foreground: #5030bf;

    --radius: 0.625rem; /* 10px */
  }

  .dark {
    --background: #0f0d1f;
    --foreground: #f0eff7;
    --card: #17142b;
    --card-foreground: #f0eff7;
    --popover: #17142b;
    --popover-foreground: #f0eff7;
    --muted: #211e38;
    --muted-foreground: #9c98b3;

    --primary: #7a5fe4;
    --primary-foreground: #ffffff;
    --primary-hover: #9a86ee;
    --primary-soft: #2a2250;
    --secondary: #2a2250;
    --secondary-foreground: #d8d1fb;
    --accent: #231650;
    --accent-foreground: #d8d1fb;

    --success: #22c55e;
    --success-soft: #0f2f1c;
    --warning: #fbbf24;
    --warning-soft: #33260a;
    --destructive: #ef4444;
    --destructive-soft: #3a1414;
    --destructive-foreground: #ffffff;
    --info: #38bdf8;
    --info-soft: #0c2a3a;

    --border: #2f2b4a;
    --input: #3b3860;
    --ring: #9a86ee;

    --sidebar: #120f26;
    --sidebar-foreground: #cbc8dc;
    --sidebar-active: #2a2250;
    --sidebar-active-foreground: #d8d1fb;
  }
}
```

### Tailwind mapping (Tailwind v4 `@theme`)

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-info: var(--info);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);
}
```

Also expose the full `primary-50…950` scale in the theme for charts and illustrations (`bg-primary-100`, `text-primary-700`).

### Dark mode
- Supported via the `.dark` class (`next-themes`), with a user toggle and `system` default.
- In dark mode the primary shifts to `#7A5FE4` for sufficient contrast on dark surfaces.

---

## 4. Typography

| Role | Font | Fallback |
|---|---|---|
| UI / body | **Inter** (via `next/font`) | `system-ui, sans-serif` |
| Numbers / code / IDs | **JetBrains Mono** | `ui-monospace, monospace` |
| Urdu (future, RTL) | **Noto Nastaliq Urdu** | serif |

Scale (rem / px, line-height):

| Style | Size | Weight | Line height | Use |
|---|---|---|---|---|
| Display | 2.25 / 36 | 700 | 1.2 | Login hero |
| H1 | 1.875 / 30 | 700 | 1.25 | Page title |
| H2 | 1.5 / 24 | 600 | 1.3 | Section heading |
| H3 | 1.25 / 20 | 600 | 1.4 | Card title |
| H4 | 1.125 / 18 | 600 | 1.4 | Sub-section |
| Body | 1 / 16 | 400 | 1.5 | Default text |
| Body small | 0.875 / 14 | 400 | 1.5 | Tables, helper text |
| Caption | 0.75 / 12 | 500 | 1.4 | Labels, badges, meta |

Rules:
- Body text never smaller than 14px. Use tabular numerals (`tabular-nums`) for marks, fees, dates in tables.
- Max line length ~75 characters for reading text.
- Sentence case for buttons and headings ("Add student", not "Add Student").

---

## 5. Spacing, Radius, Elevation

**Spacing:** 4px base grid. Use Tailwind steps: `1 (4)`, `2 (8)`, `3 (12)`, `4 (16)`, `6 (24)`, `8 (32)`, `12 (48)`.
- Card padding: `p-4` mobile, `p-6` desktop.
- Page padding: `px-4 md:px-6 lg:px-8`.
- Form field vertical gap: `space-y-4`; section gap: `space-y-6`.

**Radius:** `sm 6px`, `md 8px`, `lg 10px` (default for cards/inputs), `xl 14px` (modals), `full` (avatars, pills).

**Elevation (violet-tinted shadows):**

| Level | Use | Style |
|---|---|---|
| 0 | Flat surfaces | border only |
| 1 | Cards | `0 1px 2px rgb(96 64 218 / 0.06)` |
| 2 | Dropdowns, popovers | `0 4px 12px rgb(22 20 42 / 0.10)` |
| 3 | Modals, sheets | `0 12px 32px rgb(22 20 42 / 0.16)` |

---

## 6. Layout

### 6.1 App Shell (`(dashboard)/layout.tsx`)

```
┌───────────────┬──────────────────────────────────────────┐
│               │  Topbar: search · notifications · user    │
│   Sidebar     ├──────────────────────────────────────────┤
│   (260px)     │  Breadcrumbs                              │
│               │  PageHeader: Title            [Actions]   │
│  Logo         │ ───────────────────────────────────────── │
│  Dashboard    │                                           │
│  Administration                  Page content             │
│  Academics    │                                           │
│  Examinations │                                           │
│  Student Life │                                           │
└───────────────┴──────────────────────────────────────────┘
```

- **Sidebar:** 260px expanded, 72px collapsed (icons only). Collapsible groups mirror `config/navigation.ts`. On mobile it becomes a slide-over sheet.
- **Active item:** `sidebar-active` background with `sidebar-active-foreground` text and a 3px left bar in `primary`.
- **Topbar:** 64px high, white surface, bottom border. Contains global search, notifications, theme toggle, user menu.
- **Content max width:** 1440px, centered on very wide screens.

### 6.2 Breakpoints
`sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`. Design mobile-first.

### 6.3 Grid
12-column grid on desktop, 4 on mobile. Dashboard cards: 1 col (mobile), 2 (md), 4 (xl).

---

## 7. Components

All built on shadcn/ui, styled with the tokens above.

### 7.1 Buttons
| Variant | Style | Use |
|---|---|---|
| **Primary** | `bg-primary` text white; hover `primary-700` | Main action, one per view |
| **Secondary** | `bg-secondary` text `primary-900` | Supporting action |
| **Outline** | Border `input`, transparent | Neutral actions |
| **Ghost** | Transparent, hover `accent` | Toolbars, icon buttons |
| **Destructive** | `bg-destructive` white text | Delete, remove |
| **Link** | Text `primary`, underline on hover | Inline navigation |

Sizes: `sm` 32px, `md` 40px (default), `lg` 48px. Min touch target 40px. Loading state shows a spinner and disables the button. Focus: 2px `ring` with 2px offset.

### 7.2 Form Controls
- Inputs 40px tall, `radius-lg`, border `input`, focus border + ring `primary`.
- Label above field (14px, 500 weight). Required marked with `*` and `aria-required`.
- Helper text 12px `muted-foreground`; error text 12px `destructive` with icon, linked via `aria-describedby`.
- Invalid state: border `destructive`.
- Use shared `FormField`, `DatePicker`, `Select`, `FileUpload`, `Combobox`.
- Long forms are grouped into titled sections with a sticky action bar (Save / Cancel).

### 7.3 Data Table (`components/data-table`)
- Header row `neutral-100`, 12px uppercase-free semibold labels.
- Row height 48px (comfortable) with an optional compact 40px.
- Hover row `primary-50`; selected row `primary-100`.
- Sortable columns, server-side pagination, column visibility, filters via URL search params.
- Toolbar: search, filter chips, export, primary action ("Add student").
- Row actions in a `…` menu; destructive actions confirmed in a dialog.
- Empty state and skeleton loading required.

### 7.4 Cards & Stat Cards
- White, 1px `border`, `radius-lg`, elevation 1.
- **Stat card:** icon tile (`primary-100` bg, `primary-700` icon), label (14px muted), value (28px bold, tabular), trend chip (success/danger).

### 7.5 Badges & Status Pills
Soft background + matching dark text + optional dot (e.g. Present = `success-soft` / `#166534`). 12px, 500 weight, `radius-full`.

### 7.6 Navigation
- Breadcrumbs on all nested pages.
- Tabs for sub-sections within a record (e.g. student: Profile · Guardians · Documents · Results · Attendance).
- Active tab underline in `primary`.

### 7.7 Feedback
- **Toast** (success/error/info) bottom-right, auto-dismiss 5s; errors persist until closed.
- **Dialogs:** confirm destructive actions, name the item in the message.
- **Alerts/banners:** soft semantic background with icon.
- **Skeletons** for loading; avoid full-page spinners.
- **Empty states:** icon, one-line explanation, primary action.

### 7.8 Avatars
Circle, initials fallback on `primary-100` / `primary-700`. Sizes 24 / 32 / 40 / 64.

### 7.9 Icons
**lucide-react**, 20px default (16px in tables, 24px in empty states), stroke 1.75, inherit text color.

Suggested module icons: Dashboard `LayoutDashboard`, Reception `ConciergeBell`, Students `GraduationCap`, Staff `Users`, Users & Roles `ShieldCheck`, Academic Management `BookOpen`, LMS `MonitorPlay`, Examinations `ClipboardList`, Tests & Assessments `FileCheck`, Admission Tests `UserPlus`, Paper Generator `FilePen`, Results `BarChart3`, Certificates `Award`, Attendance `CalendarCheck`, Sports `Trophy`, Library `Library`, Hostel `BedDouble`.

---

## 8. Key Screen Patterns

| Pattern | Structure |
|---|---|
| **List page** | PageHeader (title + primary action) → toolbar (search, filters) → DataTable → pagination |
| **Create / Edit** | PageHeader → sectioned form in cards → sticky footer (Cancel, Save) |
| **Detail page** | Header with avatar/title + status badge + actions → tabs → content cards |
| **Dashboard** | Greeting → stat cards row → charts (attendance trend, enrolment) → recent activity + quick actions |
| **Marks entry** | Class/exam selector → editable table with keyboard navigation (Tab/Enter) → autosave indicator |
| **Attendance** | Class selector + date → student list with segmented Present/Absent/Late/Leave → "Mark all present" → Save |
| **Report card / Certificate** | Print-optimized layout (see 10), preview before PDF export |
| **Auth** | Centered card on `primary-50` background, brand logo, single primary button |

---

## 9. Motion

- Durations: 120ms (hover), 200ms (dropdown, tabs), 300ms (modals, sheets).
- Easing: `cubic-bezier(0.2, 0, 0, 1)`.
- Animate opacity/transform only. Respect `prefers-reduced-motion` and disable non-essential animation.

---

## 10. Print & PDF Design

Applies to report cards, certificates, generated papers, admit cards.

- A4, 15mm margins, black text on white, no background fills except subtle header.
- School header: logo, name, address, session. Brand color `#6040DA` used only for the header rule and title accents (still readable in grayscale).
- Fonts: Inter (body) and a serif (e.g. Playfair Display) for certificate titles.
- Include unique document number and QR/verification code (certificates).
- Hide navigation, buttons and interactive UI with `@media print`.

---

## 11. Accessibility Checklist

- Text contrast ≥ 4.5:1 (3:1 for large text and UI borders/icons).
- Visible focus ring (`ring` token) on every interactive element; never remove outlines without replacement.
- Full keyboard operability: tables, dialogs (focus trap, Esc to close), menus.
- Form errors announced (`aria-live`) and tied to inputs.
- Status never conveyed by color alone.
- Touch targets ≥ 40×40px.
- Support 200% zoom without horizontal scroll.
- RTL-ready: use logical properties (`ms-`, `me-`, `ps-`, `pe-`, `text-start`) instead of left/right so Urdu support can be added.

---

## 12. Content & Tone

- Plain, friendly, professional language. Short labels; verbs for actions ("Save changes", "Issue certificate").
- Error messages say what happened and how to fix it ("Roll number already exists. Use a different one.").
- Dates `dd MMM yyyy` (e.g. 09 Oct 2026); times 12-hour with AM/PM; numbers with thousand separators.
- Confirm destructive actions by naming the record.

---

## 13. Implementation Notes

1. Install shadcn/ui and paste the tokens from Section 3 into `globals.css`.
2. Set `--primary` to `#6040da`; the rest of the scale derives from it.
3. Build shared primitives first (`Button`, `Input`, `Badge`, `DataTable`, `PageHeader`, `Sidebar`), then feature screens.
4. Use `cn()` for class merging and never write raw hex in components.
5. Add a `/design-system` dev-only route showing all components and states for review.
6. Any new color, spacing or component pattern must be added to this document first.
