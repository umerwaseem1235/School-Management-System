# Project Rules & Engineering Standards: School Management System

These rules apply to every contributor (human or AI assistant). Follow them for all new code and when touching existing code. Related docs: `PRD.md` (what we build) and `architecture.md` (how it is structured).

---

## 1. Technology Stack

| Concern | Technology | Notes |
|---|---|---|
| Framework | **Next.js 15+ (App Router)** | Server Components by default |
| Language | **TypeScript 5+** (`strict: true`) | No JavaScript files in `src/` |
| UI library | **React 19** | Function components only |
| Styling | **Tailwind CSS** | Utility-first, no inline styles |
| Component kit | **shadcn/ui** (Radix primitives) | Lives in `src/components/ui` |
| Icons | **lucide-react** | |
| Database | **PostgreSQL** | |
| ORM | **Prisma** | Only used in `services/` |
| Auth | **Auth.js (NextAuth)** | Credentials + session cookies |
| Validation | **Zod** | Single source of truth for types |
| Forms | **React Hook Form** + `@hookform/resolvers/zod` | |
| Client data | **TanStack Query** | Server state on the client |
| Client state | **Zustand** (only when needed) | UI state only |
| Tables | **TanStack Table** | Wrapped by shared `DataTable` |
| PDF | **@react-pdf/renderer** or **pdf-lib** | Certificates, papers, report cards |
| File storage | S3-compatible storage | Metadata in DB |
| Dates | **date-fns** | No moment.js |
| Testing | **Vitest**, **React Testing Library**, **Playwright** | |
| Lint / format | **ESLint** (next, typescript-eslint), **Prettier** | |
| Git hooks | **Husky** + **lint-staged** | |
| Package manager | **pnpm** | Do not mix with npm/yarn |
| Node | **LTS (20+)** | Pin in `.nvmrc` |

Do not add a new library without a reason and team agreement. Prefer what is already in the stack.

---

## 2. Project Structure

Component-based, feature-module architecture. Full tree is in `architecture.md`.

```
src/
├── app/            # Routing ONLY (pages, layouts, route handlers)
├── modules/        # Feature modules (all business code lives here)
├── components/     # Shared, domain-agnostic UI
├── lib/            # Infrastructure (db, auth, rbac, pdf, utils)
├── hooks/          # Shared hooks
├── providers/      # Context providers
├── config/         # navigation, permissions, constants, env
├── types/          # Global types
└── middleware.ts
```

### 2.1 Dependency Rules
```
app  →  modules  →  components / lib / hooks / types   (allowed)
modules → another module's internals                    (FORBIDDEN)
components / lib → modules                              (FORBIDDEN)
```
- A module may import another module **only through its public `index.ts`**.
- If two modules need the same code, move it to `components/`, `lib/` or `hooks/`.
- `app/` files must stay thin: fetch data, compose module components, nothing more.

### 2.2 Module Layout
Every feature follows this layout (create only the folders you need):

```
modules/<domain>/<feature>/
├── components/        # UI for this feature only
│   ├── StudentTable.tsx
│   └── index.ts
├── hooks/             # useStudents.ts (client-side)
├── services/          # student.service.ts (server-only, Prisma)
├── actions/           # student.actions.ts ('use server')
├── schemas/           # student.schema.ts (Zod)
├── types/             # student.types.ts
├── constants.ts
└── index.ts           # PUBLIC API: export only what others may use
```

### 2.3 Layer Responsibilities
| Layer | Allowed | Not allowed |
|---|---|---|
| `page.tsx` | Fetch via service, render components | Business logic, Prisma, heavy JSX |
| `components` | Render UI, local UI state | DB access, Prisma imports |
| `hooks` | Client fetching, derived state | Server-only code |
| `actions` | Validate, authorize, call service, revalidate | UI, direct Prisma queries |
| `services` | Business logic, Prisma queries | React, `window`, request/response objects |
| `schemas` | Zod schemas, inferred types | Side effects |

---

## 3. Naming Conventions

| Item | Convention | Example |
|---|---|---|
| React component file | `PascalCase.tsx` | `StudentForm.tsx` |
| Component name | `PascalCase`, matches file | `export function StudentForm` |
| Hook file / name | `useCamelCase.ts` | `useStudents.ts` |
| Service file | `<name>.service.ts` | `student.service.ts` |
| Action file | `<name>.actions.ts` | `student.actions.ts` |
| Schema file | `<name>.schema.ts` | `student.schema.ts` |
| Types file | `<name>.types.ts` | `student.types.ts` |
| Test file | `<name>.test.ts(x)` beside source | `student.service.test.ts` |
| Route folders | `kebab-case` | `tests-assessments/` |
| Variables / functions | `camelCase` | `getStudentById` |
| Types / interfaces / enums | `PascalCase` | `StudentProfile` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_UPLOAD_SIZE` |
| Zod schemas | `camelCase` + `Schema` | `createStudentSchema` |
| Boolean variables | `is`/`has`/`can`/`should` prefix | `isActive`, `canEdit` |
| DB models (Prisma) | `PascalCase` singular | `Student` |
| DB columns | `camelCase` | `admissionDate` |
| Permissions | `module:action` | `students:create` |

Use **named exports** everywhere. Default exports are allowed only where Next.js requires them (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, config files).

---

## 4. TypeScript Rules

- `strict: true`, plus `noUncheckedIndexedAccess` and `noImplicitOverride`.
- **No `any`.** Use `unknown` and narrow, or define a proper type. `@ts-ignore` is banned; `@ts-expect-error` needs a comment explaining why.
- Prefer `type` for unions/props and `interface` for extendable object contracts. Be consistent within a file.
- **Derive types from Zod schemas** instead of writing them twice:
  ```ts
  export const createStudentSchema = z.object({ /* ... */ });
  export type CreateStudentInput = z.infer<typeof createStudentSchema>;
  ```
- Use `import type { ... }` for type-only imports.
- Use `enum`-like `as const` objects or Prisma enums rather than magic strings.
- Explicit return types on exported functions and services.
- Use the path alias `@/*` → `src/*`. No deep relative imports like `../../../`.
- Import order: 1) react/next, 2) third-party, 3) `@/` aliases, 4) relative, 5) styles (enforced by ESLint).

---

## 5. TSX / React Component Rules

### 5.1 Server vs Client Components
- **Default is a Server Component.** Add `"use client"` only when the component needs state, effects, event handlers or browser APIs.
- Push `"use client"` as far down the tree as possible. Keep the interactive part small.
- Never import server-only code (`services`, Prisma, `lib/db`) into a client component. Mark server-only files with `import "server-only";`.

### 5.2 Component Format
- Function components with **named export**, one main component per file.
- Props typed with an explicit `Props` type declared above the component.
- Destructure props in the parameter list.
- No class components. No `React.FC`.

```tsx
// src/modules/administration/students/components/StudentCard.tsx
import { Badge } from "@/components/ui/badge";
import type { Student } from "../types/student.types";

type StudentCardProps = {
  student: Student;
  onSelect?: (id: string) => void;
};

export function StudentCard({ student, onSelect }: StudentCardProps) {
  return (
    <article className="rounded-lg border p-4">
      <h3 className="text-base font-semibold">{student.fullName}</h3>
      <Badge variant={student.isActive ? "default" : "secondary"}>
        {student.isActive ? "Active" : "Inactive"}
      </Badge>
      {onSelect && (
        <button type="button" onClick={() => onSelect(student.id)}>
          View
        </button>
      )}
    </article>
  );
}
```

> If `onSelect` is used, the file needs `"use client"` at the top.

### 5.3 Component Guidelines
- Keep components small and single-purpose. If a file exceeds ~200 lines, split it.
- Extract repeated JSX into components; extract repeated logic into hooks.
- Avoid prop drilling beyond 2 levels; use composition or context.
- Always provide a stable, unique `key` (never array index for dynamic lists).
- Use semantic HTML (`button`, `nav`, `main`, `section`, `label`).
- Handle all three states in data UI: **loading, empty, error**.
- Do not put business logic or data fetching in presentational components.
- Do not use `useEffect` for data fetching; use Server Components or TanStack Query.

### 5.4 Styling
- Tailwind utility classes only. No inline `style` unless the value is dynamic and cannot be expressed in Tailwind.
- Merge classes with the `cn()` helper (`clsx` + `tailwind-merge`) from `@/lib/utils`.
- Use design tokens / CSS variables for colors; no hard-coded hex values in components.
- Mobile-first, responsive classes (`sm:`, `md:`, `lg:`).

### 5.5 Accessibility
- Every input has a `<label>`. Every icon-only button has `aria-label`.
- Keyboard-reachable interactive elements, visible focus states.
- Images need meaningful `alt` text. Color is never the only indicator.
- Target WCAG 2.1 AA.

---

## 6. Routing (App Router)

- Route groups: `(auth)` for public auth pages, `(dashboard)` for the authenticated shell.
- URL paths use `kebab-case`: `/examinations/tests-assessments`.
- Each route segment may include `loading.tsx` and `error.tsx`.
- `page.tsx` example (thin):
  ```tsx
  import { StudentTable } from "@/modules/administration/students";
  import { getStudents } from "@/modules/administration/students/services/student.service";

  export default async function StudentsPage() {
    const students = await getStudents();
    return <StudentTable data={students} />;
  }
  ```
- Use `generateMetadata` / `metadata` for page titles.
- API route handlers (`route.ts`) are for webhooks, file downloads/uploads, PDFs. Prefer Server Actions for ordinary mutations.

---

## 7. Data, Services & Server Actions

### 7.1 Services
- The **only** layer allowed to import Prisma.
- Pure business logic, no React and no `FormData`/`Request` objects.
- Throw typed errors (`NotFoundError`, `ForbiddenError`, `ValidationError`).
- Use transactions (`prisma.$transaction`) for multi-step writes.
- Paginate all list queries on the server. Never return unbounded lists.
- Select only needed fields. Avoid N+1 queries (use `include`/`select`).

### 7.2 Server Actions
Every action follows the same order: **authenticate → authorize → validate → execute → revalidate**.

```ts
// student.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/rbac";
import { createStudentSchema } from "../schemas/student.schema";
import { createStudent } from "../services/student.service";
import type { ActionResult } from "@/types/action-result";

export async function createStudentAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  await requirePermission("students:create");

  const parsed = createStudentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid data", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const student = await createStudent(parsed.data);
  revalidatePath("/administration/students");
  return { success: true, data: { id: student.id } };
}
```

### 7.3 Standard Response Shape
```ts
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
```
Use this for all actions and API responses. Never leak raw database or stack errors to the client.

### 7.4 Database Rules
- All schema changes via Prisma migrations. Never edit the DB manually.
- Every table: `id`, `createdAt`, `updatedAt`; core tables also `createdBy`, `updatedBy`, `deletedAt` (soft delete).
- Use enums for fixed states (e.g. `StudentStatus`, `AttendanceStatus`).
- Add indexes for foreign keys and frequently filtered columns.
- Seed data lives in `prisma/seed.ts`.

---

## 8. Authentication & Authorization

- Auth.js with credentials provider; passwords hashed with **argon2** (or bcrypt, cost ≥ 12).
- `middleware.ts` protects all `(dashboard)` routes and does coarse role checks by path.
- **Authorization is always enforced server-side** in actions and services via `can()` / `requirePermission()`. Hiding a button in the UI is never sufficient.
- Permissions are `module:action` strings (`results:publish`, `library:issue`) defined in `config/permissions.ts` and assigned to roles in the DB.
- Principle of least privilege: new roles start with no permissions.
- Never trust client-supplied IDs or roles; resolve the user from the session.

---

## 9. Forms & Validation

- Every form uses **React Hook Form + Zod resolver**.
- The **same Zod schema** validates on the client and again in the Server Action.
- Show field-level error messages and a disabled/loading submit state.
- Use shared form components from `components/forms` (`FormField`, `DatePicker`, `FileUpload`).
- Sanitize and validate file uploads (type, size) on the server.

---

## 10. State Management & Data Fetching

1. **Server Components** fetch initial data directly via services.
2. **TanStack Query** for client-side lists, search, pagination and mutations that need cache control.
3. **URL search params** for filters, sorting, pagination so views are shareable.
4. **Zustand** only for cross-component UI state (e.g. sidebar). Never store server data in Zustand.
5. Query keys are defined in one place per module (`queryKeys.ts`).

---

## 11. Error Handling & Logging

- Use `error.tsx` and `loading.tsx` per route group.
- Server code: catch, log with context, return a safe `ActionResult`.
- Never `console.log` in committed code; use the central logger in `lib/logger.ts`.
- Never log passwords, tokens, or sensitive student data.
- User-facing messages are clear and non-technical.

---

## 12. Security Rules

- All secrets in environment variables. `.env` is git-ignored; `.env.example` is committed.
- Validate env at startup with Zod in `config/env.ts`.
- Validate and sanitize **all** input on the server.
- Use Prisma parameterized queries only; no raw SQL string concatenation.
- Never expose internal IDs or data the user lacks permission for.
- Set security headers (CSP, HSTS, X-Frame-Options) in `next.config.ts`.
- Rate-limit login and sensitive endpoints.
- Student data is personal data of minors: collect and expose the minimum necessary.
- Audit-log sensitive actions: role changes, result edits after lock, certificate issue, deletions.

---

## 13. Performance Rules

- Prefer Server Components; keep client JS small.
- Use `next/image` for images and `next/font` for fonts.
- Dynamic-import heavy client components (charts, PDF viewers, editors).
- Paginate, debounce search, and avoid fetching on every keystroke.
- Use `Suspense` and streaming for slow sections.
- Cache with `revalidatePath` / `revalidateTag` intentionally; do not cache user-specific data globally.

---

## 14. Testing Rules

| Level | Tool | What to test |
|---|---|---|
| Unit | Vitest | Services, schemas, grading/GPA logic, utilities |
| Component | React Testing Library | Forms, tables, conditional UI |
| E2E | Playwright | Admission, attendance, result publish, certificate issue, login/RBAC |

- Tests live next to the code (`*.test.ts(x)`).
- **Grading, result calculation and permission logic must have unit tests.**
- Do not merge code that breaks existing tests.
- Mock external services; do not hit real DB in unit tests (use a test DB for integration).

---

## 15. Code Quality & Style

- **Prettier** formats code (2 spaces, double quotes, semicolons, trailing commas, 100-col width).
- **ESLint** must pass with zero warnings in CI.
- Functions do one thing; prefer early returns over deep nesting.
- No dead code, commented-out code, or unresolved `TODO` without a ticket reference.
- Comments explain **why**, not what. Use JSDoc on exported service functions.
- No magic numbers or strings; use named constants.
- Prefer immutability; avoid mutating props or state.

---

## 16. Git Workflow

- **Branches:** `main` (production), `develop` (integration), feature branches `feat/<module>-<short-name>`, `fix/<short-name>`, `chore/<name>`.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/): `feat(students): add bulk CSV import`, `fix(results): correct GPA rounding`.
- **Pull requests:** small, focused, linked to a PRD requirement ID (e.g. `ST-4`). Must include description, screenshots for UI, and test notes.
- At least one review required before merge. CI (typecheck, lint, test, build) must pass.
- Never commit secrets, `.env`, or build artifacts.
- Husky pre-commit runs lint-staged (ESLint + Prettier); pre-push runs typecheck.

---

## 17. Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit",
  "format": "prettier --write .",
  "test": "vitest run",
  "test:e2e": "playwright test",
  "db:migrate": "prisma migrate dev",
  "db:generate": "prisma generate",
  "db:seed": "tsx prisma/seed.ts",
  "db:studio": "prisma studio"
}
```

---

## 18. Definition of Done

A task is complete only when:
- [ ] It meets the linked PRD requirement and acceptance criteria.
- [ ] Types are strict, with no `any`; Zod validates all inputs.
- [ ] Authorization is enforced server-side.
- [ ] Loading, empty and error states are handled.
- [ ] Responsive and accessible (keyboard + labels).
- [ ] Tests added/updated and passing; lint and typecheck clean.
- [ ] No secrets or debug logs committed.
- [ ] Docs (`architecture.md` / `PRD.md` / this file) updated if rules or structure changed.

---

## 19. Rules for AI Coding Assistants

When generating code for this project, always:
1. Use **TypeScript + TSX** with named exports and strict types.
2. Place files according to Section 2; never create code in `app/` that belongs in a module.
3. Default to Server Components; add `"use client"` only when required.
4. Follow the action pattern in Section 7.2 and return `ActionResult<T>`.
5. Validate with Zod, authorize with `requirePermission`, and keep Prisma inside `services/`.
6. Use Tailwind + shadcn/ui components and the `cn()` helper.
7. Follow the naming conventions in Section 3.
8. Ask before adding a new dependency or changing the folder structure.
