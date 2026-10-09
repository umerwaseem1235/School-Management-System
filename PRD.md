# Product Requirements Document (PRD): School Management System

| | |
|---|---|
| **Product** | School Management System (web) |
| **Stack** | Next.js (App Router), TypeScript, component/feature-module architecture |
| **Status** | Draft v1.0 |
| **Date** | 2026-10-09 |
| **Related** | `architecture.md` |

---

## 1. Overview

### 1.1 Purpose
A web-based platform that centralizes a school's administration, academics, examinations and student-life operations in one system, replacing paper registers and disconnected spreadsheets.

### 1.2 Problem Statement
Schools typically manage admissions, attendance, exams, results, library and hostel through manual records or separate tools. This causes duplicate data entry, slow result processing, poor visibility for management, and little parent/student access to information.

### 1.3 Goals
1. Single source of truth for student, staff and academic data.
2. Cut time spent on attendance, exam papers, results and certificates.
3. Role-based access so each user sees only what they need.
4. Give management real-time visibility via a dashboard.
5. Modular delivery: each module is usable independently and released in phases.

### 1.4 Non-Goals (v1)
- Fee/accounting and payroll (can be a later module).
- Native mobile apps (responsive web only).
- Transport management.
- Online payments.

---

## 2. Users & Roles

| Role | Description | Key needs |
|---|---|---|
| **Super Admin** | System owner | Full access, roles/permissions, settings |
| **Principal / Management** | School leadership | Dashboard, reports, approvals |
| **Receptionist** | Front desk | Visitors, enquiries, admission intake |
| **Teacher** | Teaching staff | Attendance, LMS, marks, paper generation |
| **Exam Controller** | Exam department | Exam scheduling, results, certificates |
| **Librarian** | Library staff | Catalogue, issue/return |
| **Hostel Warden** | Hostel staff | Rooms, allocation, hostel attendance |
| **Student** | Learner | Courses, assignments, results, attendance |
| **Parent/Guardian** | Guardian | Child's attendance, results, notices |

---

## 3. Scope: Modules & Requirements

Priority: **P0** = must have for launch, **P1** = should have, **P2** = nice to have.

### 3.1 Dashboard
| ID | Requirement | Priority |
|---|---|---|
| DB-1 | Role-based dashboard showing relevant widgets per role | P0 |
| DB-2 | Summary cards: total students, staff, today's attendance %, upcoming exams | P0 |
| DB-3 | Recent activity feed and quick actions | P1 |
| DB-4 | Charts: enrolment by class, attendance trend, result performance | P1 |
| DB-5 | Customizable widgets | P2 |

### 3.2 Administration

**Reception**
| ID | Requirement | Priority |
|---|---|---|
| RC-1 | Visitor log (check-in/check-out, purpose, person to meet) | P0 |
| RC-2 | Admission enquiry capture and follow-up status | P0 |
| RC-3 | Convert enquiry into admission test candidate or student | P1 |
| RC-4 | Appointment/call log | P2 |

**Students**
| ID | Requirement | Priority |
|---|---|---|
| ST-1 | Create/edit/archive student profile (personal, contact, guardian details) | P0 |
| ST-2 | Assign student to class and section per academic session | P0 |
| ST-3 | Upload and store documents (B-form, previous result, photo) | P1 |
| ST-4 | Search, filter, sort, bulk import (CSV) and export | P0 |
| ST-5 | Student status lifecycle: applicant, active, transferred, alumni | P1 |
| ST-6 | Link multiple students to one guardian | P1 |

**Staff**
| ID | Requirement | Priority |
|---|---|---|
| SF-1 | Staff profile CRUD (personal, qualification, designation, department) | P0 |
| SF-2 | Assign teachers to subjects/classes | P0 |
| SF-3 | Staff documents and joining/exit records | P1 |
| SF-4 | Bulk import/export | P1 |

**Users & Roles**
| ID | Requirement | Priority |
|---|---|---|
| UR-1 | User accounts linked to student/staff/guardian profiles | P0 |
| UR-2 | Create custom roles with module-level permissions (`module:action`) | P0 |
| UR-3 | Enable/disable users, force password reset | P0 |
| UR-4 | Audit log of sensitive actions | P1 |
| UR-5 | Two-factor authentication | P2 |

### 3.3 Academics

**Academic Management**
| ID | Requirement | Priority |
|---|---|---|
| AM-1 | Manage academic sessions/years and terms | P0 |
| AM-2 | Manage classes, sections and subjects | P0 |
| AM-3 | Map subjects and teachers to classes/sections | P0 |
| AM-4 | Timetable builder with clash detection (teacher, room) | P1 |
| AM-5 | Syllabus and lesson plan tracking | P2 |
| AM-6 | Student promotion to next class at session end | P1 |

**LMS**
| ID | Requirement | Priority |
|---|---|---|
| LM-1 | Teachers create courses/units and upload materials | P1 |
| LM-2 | Assignments with due dates and file/text submissions | P1 |
| LM-3 | Teacher grading and feedback on submissions | P1 |
| LM-4 | Announcements per class/course | P1 |
| LM-5 | Online quizzes (auto-graded MCQ) | P2 |
| LM-6 | Discussion threads | P2 |

### 3.4 Examinations

**Examinations**
| ID | Requirement | Priority |
|---|---|---|
| EX-1 | Create exams (term/midterm/final) per session and class | P0 |
| EX-2 | Exam schedule/datesheet by subject, date, time, room | P0 |
| EX-3 | Seating plan and invigilation duty assignment | P2 |
| EX-4 | Publish datesheet to students/parents | P1 |

**Tests & Assessments**
| ID | Requirement | Priority |
|---|---|---|
| TA-1 | Create class tests, quizzes and continuous assessments | P0 |
| TA-2 | Marks entry per student, with total and passing marks | P0 |
| TA-3 | Weightage of assessments toward final result | P1 |

**Admission Tests**
| ID | Requirement | Priority |
|---|---|---|
| AT-1 | Candidate registration with test roll number | P1 |
| AT-2 | Schedule test, record scores, generate merit list | P1 |
| AT-3 | Convert selected candidate to student record | P1 |
| AT-4 | Print admit card | P2 |

**Paper Generator**
| ID | Requirement | Priority |
|---|---|---|
| PG-1 | Question bank by subject, class, chapter, difficulty, type (MCQ, short, long) | P1 |
| PG-2 | Build paper manually by selecting questions | P1 |
| PG-3 | Auto-generate paper from rules (marks distribution, difficulty mix) | P1 |
| PG-4 | Paper templates with school header | P1 |
| PG-5 | Export paper to PDF/Word with optional answer key | P1 |
| PG-6 | Prevent repeating questions used in recent papers | P2 |

**Results**
| ID | Requirement | Priority |
|---|---|---|
| RS-1 | Configurable grading scale (percentage, grade, GPA) | P0 |
| RS-2 | Consolidated result per student, auto-calculated from marks | P0 |
| RS-3 | Position/rank in class | P1 |
| RS-4 | Publish/lock results; edits after lock require permission and are audited | P0 |
| RS-5 | Printable report card (PDF) | P0 |
| RS-6 | Student/parent portal view of results | P1 |

**Certificates**
| ID | Requirement | Priority |
|---|---|---|
| CE-1 | Certificate templates (character, school leaving, merit, participation) | P1 |
| CE-2 | Auto-fill from student data and generate PDF | P1 |
| CE-3 | Unique certificate number and QR/verification code | P2 |
| CE-4 | Issue history/log | P1 |

### 3.5 Student Life

**Attendance**
| ID | Requirement | Priority |
|---|---|---|
| AT-5 | Daily class attendance marking by teacher (present/absent/late/leave) | P0 |
| AT-6 | Staff attendance | P1 |
| AT-7 | Leave requests and approval | P1 |
| AT-8 | Attendance reports (daily, monthly, by class, below-threshold list) | P0 |
| AT-9 | Notify guardians of absence | P2 |

**Sports**
| ID | Requirement | Priority |
|---|---|---|
| SP-1 | Manage sports, teams and members | P2 |
| SP-2 | Events/tournaments with schedule and results | P2 |
| SP-3 | Student achievements record | P2 |

**Library**
| ID | Requirement | Priority |
|---|---|---|
| LB-1 | Book catalogue (title, author, ISBN, category, copies) | P1 |
| LB-2 | Issue/return books for students and staff with due dates | P1 |
| LB-3 | Fine calculation for late returns | P1 |
| LB-4 | Reservations and availability search | P2 |
| LB-5 | Library reports (most issued, overdue) | P2 |

**Hostel Management**
| ID | Requirement | Priority |
|---|---|---|
| HM-1 | Hostels, blocks, rooms and bed capacity setup | P1 |
| HM-2 | Allocate/transfer/vacate students | P1 |
| HM-3 | Hostel attendance and late-entry log | P2 |
| HM-4 | Visitor log for hostel | P2 |
| HM-5 | Mess/meal plan tracking | P2 |

---

## 4. Non-Functional Requirements

| Area | Requirement |
|---|---|
| **Security** | Role-based access control enforced server-side on every action; hashed passwords (bcrypt/argon2); HTTPS only; CSRF/XSS protection; audit logs for sensitive changes |
| **Privacy** | Student data (minors) restricted to authorized roles; data export and deletion on request; no sensitive data in logs |
| **Performance** | Page load < 2 s on typical school broadband; lists paginated server-side; support ~5,000 students and ~300 staff per school without degradation |
| **Availability** | Target 99.5% uptime; daily automated database backups with tested restore |
| **Scalability** | Modular codebase; stateless app servers; ready for multi-campus/multi-tenant later |
| **Usability** | Responsive (desktop, tablet, mobile browser); consistent UI via shared components; keyboard accessible; WCAG 2.1 AA target |
| **Localization** | English first; architecture ready for Urdu (RTL) and additional languages |
| **Maintainability** | Strict TypeScript, linting, unit and E2E tests on critical flows, documented module boundaries |
| **Data integrity** | Soft deletes, referential integrity, result lock to prevent silent changes |
| **Compatibility** | Latest two versions of Chrome, Edge, Firefox, Safari |

---

## 5. Key User Flows

1. **Admission:** Reception logs enquiry → candidate registered for admission test → test scored → merit list → candidate converted to student → class/section assigned → user account created.
2. **Daily attendance:** Teacher opens class → marks attendance → saves → dashboard and guardian view update.
3. **Exam cycle:** Exam controller creates exam → publishes datesheet → teachers generate papers → marks entered → results calculated → reviewed → published/locked → report cards printed.
4. **Certificate issue:** Staff selects student and template → system fills data → PDF generated with unique number → logged in issue history.
5. **Library issue:** Librarian searches book and member → issues with due date → return recorded → fine auto-calculated if late.

---

## 6. Release Plan

| Phase | Scope | Outcome |
|---|---|---|
| **0: Foundation** | Auth, RBAC, layout shell, shared UI, database schema | App skeleton with secure login |
| **1: Core Admin** | Users & Roles, Staff, Students, Reception, base Dashboard | School can manage people and enquiries |
| **2: Academics** | Academic Management (sessions, classes, subjects, timetable), Attendance | Daily operations running |
| **3: Examinations** | Exams, Tests & Assessments, Results, Report Cards, Certificates | Full exam-to-result cycle |
| **4: Learning & Admissions** | LMS, Admission Tests, Paper Generator | Teaching tools and admissions pipeline |
| **5: Student Life** | Library, Hostel, Sports | Complete campus coverage |
| **6: Hardening** | Reports/exports, notifications, performance, accessibility, E2E coverage | Production-ready release |

---

## 7. Success Metrics

| Metric | Target |
|---|---|
| Attendance marking time per class | < 2 minutes |
| Result compilation time per exam | Reduced by 70% vs manual |
| Report cards generated in bulk | Whole class in < 1 minute |
| Active teacher usage (weekly) | > 80% within 3 months of rollout |
| Data entry errors reported | Down 50% vs paper process |
| System uptime | ≥ 99.5% |

---

## 8. Assumptions & Dependencies

- Single school/campus for v1; multi-campus is future work.
- School provides initial data (students, staff, classes) for import.
- Hosting on a cloud platform (e.g. Vercel + managed PostgreSQL) with S3-compatible file storage.
- Email/SMS provider needed only for P2 notification features.

## 9. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Scope too large for one release | Delays | Strict phased delivery; P0 first |
| Incorrect results/grades | High trust loss | Automated tests on grading logic, result lock, audit log |
| Data privacy of minors | Legal/reputation | RBAC, least-privilege, encryption, access logs |
| Low staff adoption | Project failure | Simple UI, training, pilot with one class first |
| Bulk import errors | Bad data | Validation, preview step, rollback |

## 10. Open Questions

1. Does the school need a **fee management** module (likely the next most requested)?
2. Which grading system applies (percentage, letter, GPA)? Different per class level?
3. Is the system for one school or multiple branches?
4. Is Urdu / RTL support required at launch?
5. Do parents get their own login in v1, or only students?
6. What notification channel is preferred (email, SMS, WhatsApp)?
7. Are existing records to be migrated, and in what format?
