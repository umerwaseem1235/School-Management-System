# School Management System: Architecture

**Stack:** Next.js (App Router) + TypeScript, component-based (feature-module) structure, web.

This document maps the planned modules to a folder structure, layering rules, and conventions.

---

## 1. Modules

| Module | Sub-modules |
|---|---|
| **Dashboard** | Overview widgets, role-based summaries |
| **Administration** | Reception, Students, Staff, Users & Roles |
| **Academics** | Academic Management, LMS |
| **Examinations** | Examinations, Tests & Assessments, Admission Tests, Paper Generator, Results, Certificates |
| **Student Life** | Attendance, Sports, Library, Hostel Management |

---

## 2. Architectural Principles

1. **Feature-based modules**: each domain lives in `src/modules/<module>/<feature>`, owning its own components, hooks, services, types, schemas and constants.
2. **Thin routes**: files under `src/app` only compose pages from module components. No business logic in route files.
3. **Shared code is generic**: `src/components`, `src/lib`, `src/hooks` hold things used by 2+ modules and know nothing about a specific domain.
4. **One-way dependencies**: `app → modules → shared`. Modules must not import from each other's internals; use a module's public `index.ts` only, or lift the shared piece to `shared`.
5. **Server-first**: use Server Components for data fetching; Client Components only for interactivity. Mutations go through Server Actions or API route handlers.
6. **Type safety end to end**: Zod schemas are the single source of truth for validation and inferred TypeScript types.

---

## 3. Folder Structure

```
school-management-system/
├── prisma/                         # DB schema, migrations, seed
│   ├── schema.prisma
│   └── seed.ts
├── public/                         # static assets
├── src/
│   ├── app/                        # Next.js App Router (routing only)
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── (dashboard)/            # authenticated shell (sidebar + topbar)
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── administration/
│   │   │   │   ├── reception/page.tsx
│   │   │   │   ├── students/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── new/page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── staff/page.tsx
│   │   │   │   └── users-roles/page.tsx
│   │   │   ├── academics/
│   │   │   │   ├── management/page.tsx
│   │   │   │   └── lms/page.tsx
│   │   │   ├── examinations/
│   │   │   │   ├── exams/page.tsx
│   │   │   │   ├── tests-assessments/page.tsx
│   │   │   │   ├── admission-tests/page.tsx
│   │   │   │   ├── paper-generator/page.tsx
│   │   │   │   ├── results/page.tsx
│   │   │   │   └── certificates/page.tsx
│   │   │   └── student-life/
│   │   │       ├── attendance/page.tsx
│   │   │       ├── sports/page.tsx
│   │   │       ├── library/page.tsx
│   │   │       └── hostel/page.tsx
│   │   ├── api/                    # route handlers (webhooks, uploads, PDFs)
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   └── certificates/[id]/pdf/route.ts
│   │   ├── layout.tsx
│   │   ├── not-found.tsx
│   │   └── globals.css
│   │
│   ├── modules/                    # FEATURE MODULES (the core of the app)
│   │   ├── dashboard/
│   │   │   ├── components/         # StatCard, RecentActivity, role widgets
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   ├── administration/
│   │   │   ├── reception/          # visitors, enquiries, gate log
│   │   │   ├── students/           # admission, profile, guardians
│   │   │   ├── staff/              # profiles, departments, payroll hooks
│   │   │   └── users-roles/        # users, roles, permissions matrix
│   │   ├── academics/
│   │   │   ├── academic-management/  # classes, sections, subjects, timetable, sessions
│   │   │   └── lms/                  # courses, lessons, assignments, submissions
│   │   ├── examinations/
│   │   │   ├── examinations/
│   │   │   ├── tests-assessments/
│   │   │   ├── admission-tests/
│   │   │   ├── paper-generator/      # question bank, paper templates, export
│   │   │   ├── results/
│   │   │   └── certificates/
│   │   └── student-life/
│   │       ├── attendance/
│   │       ├── sports/
│   │       ├── library/
│   │       └── hostel/
│   │
│   ├── components/                 # shared, domain-agnostic UI
│   │   ├── ui/                     # primitives: Button, Input, Modal, Badge...
│   │   ├── layout/                 # Sidebar, Topbar, Breadcrumbs, PageHeader
│   │   ├── data-table/             # generic table w/ sort, filter, pagination
│   │   ├── forms/                  # FormField, DatePicker, FileUpload
│   │   └── feedback/               # Toast, EmptyState, Skeleton, ErrorBoundary
│   │
│   ├── lib/                        # infrastructure & utilities
│   │   ├── db.ts                   # Prisma client singleton
│   │   ├── auth.ts                 # session helpers
│   │   ├── rbac.ts                 # permission checks
│   │   ├── api-client.ts
│   │   ├── pdf.ts                  # certificate / paper PDF generation
│   │   ├── validators.ts
│   │   └── utils.ts
│   │
│   ├── hooks/                      # shared hooks (useDebounce, usePagination...)
│   ├── providers/                  # QueryProvider, ThemeProvider, AuthProvider
│   ├── config/
│   │   ├── navigation.ts           # sidebar tree built from the modules
│   │   ├── permissions.ts          # role → permission map
│   │   └── constants.ts
│   ├── types/                      # global types (ApiResponse, Pagination...)
│   └── middleware.ts               # auth + role-based route protection
│
├── .env.example
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Anatomy of a Feature Module

Every sub-module (e.g. `administration/students`) follows the same internal layout:

```
modules/administration/students/
├── components/
│   ├── StudentTable.tsx
│   ├── StudentForm.tsx
│   ├── StudentProfileCard.tsx
│   └── index.ts
├── hooks/
│   └── useStudents.ts
├── services/
│   └── student.service.ts       # data access / business logic (server-side)
├── actions/
│   └── student.actions.ts      # Server Actions ('use server')
├── schemas/
│   └── student.schema.ts       # Zod schemas + inferred types
├── types/
│   └── student.types.ts
├── constants.ts
└── index.ts                    # PUBLIC API of the module
```

**Layer responsibilities**

| Layer | Responsibility |
|---|---|
| `app/**/page.tsx` | Route entry. Fetches via service, renders module components. |
| `components` | UI for this feature only. |
| `hooks` | Client-side state / data fetching (React Query). |
| `actions` | Server Actions: validate (Zod) → authorize (RBAC) → call service. |
| `services` | Business logic and DB access (Prisma). No React. |
| `schemas` / `types` | Validation and shared types. |

**Example route file (thin):**

```tsx
// src/app/(dashboard)/administration/students/page.tsx
import { StudentTable, getStudents } from "@/modules/administration/students";

export default async function StudentsPage() {
  const students = await getStudents();
  return <StudentTable data={students} />;
}
```

---

## 5. Module Details

### 5.1 Dashboard
Role-aware landing page (Admin, Teacher, Student, Parent, Librarian, Warden). Widgets pull aggregate data from other modules' **services** (read-only), e.g. attendance %, fee/enrolment counts, upcoming exams.

### 5.2 Administration
- **Reception**: visitor log, admission enquiries, call/appointment log. Enquiries convert into admission-test candidates or student records.
- **Students**: admission, profile, guardians, documents, class/section assignment, status (active/alumni).
- **Staff**: profiles, departments, designations, qualifications, subject assignments.
- **Users & Roles**: accounts, role definitions, permission matrix (feeds `config/permissions.ts` and `lib/rbac.ts`).

### 5.3 Academics
- **Academic Management**: academic sessions, classes, sections, subjects, class-subject-teacher mapping, timetable, syllabus.
- **LMS**: courses, lessons/materials, assignments, submissions, grading, announcements.

### 5.4 Examinations
- **Examinations**: exam schedules, datesheets, seating, invigilation.
- **Tests & Assessments**: class tests, quizzes, continuous assessment entries.
- **Admission Tests**: candidate registration, test scheduling, scoring, merit list → convert to Student.
- **Paper Generator**: question bank (subject/chapter/difficulty/type), paper templates, auto/manual paper build, PDF export.
- **Results**: marks entry, grading scheme, GPA/percentage, report cards, publish/lock.
- **Certificates**: templates (character, transfer, merit), generation from student data, PDF + verification code.

### 5.5 Student Life
- **Attendance**: daily/period attendance for students and staff, leave requests, reports.
- **Sports**: teams, events, participation, achievements.
- **Library**: catalogue, members, issue/return, fines, reservations.
- **Hostel Management**: hostels, rooms, bed allocation, mess, hostel attendance, visitors.

---

## 6. Data Model (high-level entities)

```
User ─┬─ Role ── Permission
      ├─ StaffProfile
      └─ StudentProfile ── Guardian

AcademicSession ── Class ── Section ── Subject ── TimetableEntry
Course ── Lesson ── Assignment ── Submission            (LMS)

Exam ── ExamSchedule ── Mark ── Result ── Certificate
Test/Assessment ── Mark
AdmissionTest ── Candidate ──(converts to)──► StudentProfile
QuestionBank ── Question ── PaperTemplate ── GeneratedPaper

Attendance (student/staff)
SportsTeam ── SportsEvent ── Participation
Book ── BookIssue ── LibraryMember
Hostel ── Room ── Bed ── HostelAllocation
VisitorLog / Enquiry                                     (Reception)
```

Shared foreign keys: `studentId`, `staffId`, `sessionId`, `classId`, `sectionId`.

---

## 7. Cross-Cutting Concerns

### Authentication & Authorization
- **Auth.js (NextAuth)** with credentials provider; JWT/session cookies.
- `middleware.ts` protects `(dashboard)` routes and checks role access by path prefix.
- `lib/rbac.ts` exposes `can(user, "students:create")`, used in Server Actions and UI gating.
- Permissions are defined as `module:action` strings and stored per role.

### Data Layer
- **PostgreSQL + Prisma**. One client singleton in `lib/db.ts`.
- Services are the only layer that touches Prisma.
- Soft deletes (`deletedAt`) and audit fields (`createdBy`, `updatedBy`, timestamps) on core tables.

### Validation
- Zod schemas shared by forms (React Hook Form + `zodResolver`) and Server Actions.

### Client State & Fetching
- Server Components for initial data; **TanStack Query** for client-side lists, mutations, and cache invalidation.
- Minimal global state (Zustand only if needed, e.g. sidebar state).

### UI
- Tailwind CSS + a component library (shadcn/ui recommended) in `components/ui`.
- Generic `DataTable` reused by every list screen.

### Files & Documents
- Uploads (student documents, LMS materials) via S3-compatible storage; metadata in DB.
- PDF generation (certificates, papers, report cards) in `lib/pdf.ts`, exposed through route handlers.

### Error Handling & Logging
- Standard `ActionResult<T>` / `ApiResponse<T>` return shape.
- `error.tsx` and `loading.tsx` per route group; centralized logger in `lib/`.

### Testing
- Unit: Vitest (services, schemas). Component: React Testing Library. E2E: Playwright for critical flows (admission, attendance, result publish).

---

## 8. Navigation Config

`src/config/navigation.ts` mirrors the module tree and is filtered by role permissions:

```ts
export const navigation = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Administration", children: [
    { label: "Reception", href: "/administration/reception" },
    { label: "Students", href: "/administration/students" },
    { label: "Staff", href: "/administration/staff" },
    { label: "Users & Roles", href: "/administration/users-roles" },
  ]},
  { label: "Academics", children: [
    { label: "Academic Management", href: "/academics/management" },
    { label: "LMS", href: "/academics/lms" },
  ]},
  { label: "Examinations", children: [
    { label: "Examinations", href: "/examinations/exams" },
    { label: "Tests & Assessments", href: "/examinations/tests-assessments" },
    { label: "Admission Tests", href: "/examinations/admission-tests" },
    { label: "Paper Generator", href: "/examinations/paper-generator" },
    { label: "Results", href: "/examinations/results" },
    { label: "Certificates", href: "/examinations/certificates" },
  ]},
  { label: "Student Life", children: [
    { label: "Attendance", href: "/student-life/attendance" },
    { label: "Sports", href: "/student-life/sports" },
    { label: "Library", href: "/student-life/library" },
    { label: "Hostel Management", href: "/student-life/hostel" },
  ]},
] as const;
```

---

## 9. Conventions

- **Naming:** components `PascalCase.tsx`; hooks `useXxx.ts`; services `xxx.service.ts`; actions `xxx.actions.ts`; schemas `xxx.schema.ts`.
- **Imports:** path alias `@/*` → `src/*`. Import modules via their `index.ts` only.
- **Server/Client:** default to Server Components; add `"use client"` only where needed.
- **Env:** all secrets in `.env`, typed and validated in `config/env.ts`.
- **Commits/Lint:** ESLint + Prettier + Husky/lint-staged; strict TypeScript (`"strict": true`).

---

## 10. Suggested Build Order

1. **Foundation:** project setup, auth, RBAC, layout shell, shared UI, DB schema.
2. **Administration:** Users & Roles → Staff → Students → Reception.
3. **Academics:** Academic Management (sessions, classes, subjects) → LMS.
4. **Student Life:** Attendance first (high daily value), then Library, Hostel, Sports.
5. **Examinations:** Exams → Tests & Assessments → Results → Certificates → Admission Tests → Paper Generator.
6. **Dashboard:** built progressively, finalized once module data exists.
7. **Hardening:** audit logs, reports/exports, notifications, performance, E2E tests.
