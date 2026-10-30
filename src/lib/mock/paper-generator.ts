// Pakistani School System — Paper Generator & Question Bank Mock Data

export type QuestionType = "MCQ" | "Short" | "Long";

export type QuestionDifficulty = "Easy" | "Medium" | "Hard";

export type PaperStatus = "Finalized" | "Draft";

export interface QuestionBankItem {
  id: string;
  className: string;
  subject: string;
  chapter: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  marks: number;
  statement: string;
  options?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctOption?: "A" | "B" | "C" | "D";
  answerHint?: string;
}

export interface GeneratedPaper {
  id: string;
  title: string;
  examTerm: string;
  className: string;
  subject: string;
  duration: string;
  campus: string;
  preparedBy: string;
  createdDate: string; // YYYY-MM-DD
  status: PaperStatus;
  questionIds: string[];
}

export const PAPER_CLASSES = [
  "Class 10",
  "Class 9",
  "Grade 8",
  "Grade 7",
  "Grade 6",
];

export const PAPER_SUBJECTS = [
  "Physics",
  "Mathematics",
  "Computer Science",
  "Chemistry",
  "Biology",
  "English",
];

export const PAPER_EXAM_TERMS = [
  "First Term Examination 2026–27",
  "Mid-Term Examination 2026–27",
  "Send-Up Examination 2026–27",
  "Monthly Assessment — Nov 2026",
  "Annual Examination 2026–27",
];

export const PAPER_DURATIONS = [
  "45 Minutes",
  "1 Hour",
  "1.5 Hours",
  "2 Hours",
  "2.5 Hours",
  "3 Hours",
];

export const PAPER_TEACHERS = [
  "Mr. Tariq Mahmood",
  "Mrs. Sadia Rashid",
  "Mr. Kamran Siddiqui",
  "Ms. Hina Javed",
  "Dr. Salman Raza",
  "Mrs. Farah Naz",
];

export const INITIAL_QUESTION_BANK: QuestionBankItem[] = [
  // ================= CLASS 9 — PHYSICS =================
  {
    id: "qb-phy9-1",
    className: "Class 9",
    subject: "Physics",
    chapter: "Unit 1: Physical Quantities & Measurement",
    type: "MCQ",
    difficulty: "Easy",
    marks: 1,
    statement: "The number of base units in the International System of Units (SI) is:",
    options: { A: "Three", B: "Six", C: "Seven", D: "Nine" },
    correctOption: "C",
  },
  {
    id: "qb-phy9-2",
    className: "Class 9",
    subject: "Physics",
    chapter: "Unit 1: Physical Quantities & Measurement",
    type: "MCQ",
    difficulty: "Easy",
    marks: 1,
    statement: "Least count of a standard Vernier Callipers used in school laboratories is:",
    options: { A: "0.01 mm", B: "0.1 mm", C: "0.001 cm", D: "1 mm" },
    correctOption: "B",
  },
  {
    id: "qb-phy9-3",
    className: "Class 9",
    subject: "Physics",
    chapter: "Unit 2: Kinematics",
    type: "MCQ",
    difficulty: "Medium",
    marks: 1,
    statement: "The area under a speed-time graph represents:",
    options: { A: "Velocity", B: "Acceleration", C: "Distance covered", D: "Momentum" },
    correctOption: "C",
  },
  {
    id: "qb-phy9-4",
    className: "Class 9",
    subject: "Physics",
    chapter: "Unit 3: Dynamics",
    type: "MCQ",
    difficulty: "Easy",
    marks: 1,
    statement: "Inertia of a body depends directly upon its:",
    options: { A: "Weight", B: "Mass", C: "Velocity", D: "Force" },
    correctOption: "B",
  },
  {
    id: "qb-phy9-5",
    className: "Class 9",
    subject: "Physics",
    chapter: "Unit 3: Dynamics",
    type: "MCQ",
    difficulty: "Medium",
    marks: 1,
    statement: "The SI unit of momentum is equivalent to:",
    options: { A: "Ns", B: "Nm", C: "kg m s⁻²", D: "J s" },
    correctOption: "A",
  },
  {
    id: "qb-phy9-6",
    className: "Class 9",
    subject: "Physics",
    chapter: "Unit 4: Turning Effect of Forces",
    type: "MCQ",
    difficulty: "Medium",
    marks: 1,
    statement: "A body is in complete equilibrium when both net force and net ___ acting on it are zero:",
    options: { A: "Speed", B: "Energy", C: "Torque", D: "Work" },
    correctOption: "C",
  },
  {
    id: "qb-phy9-7",
    className: "Class 9",
    subject: "Physics",
    chapter: "Unit 1: Physical Quantities & Measurement",
    type: "Short",
    difficulty: "Easy",
    marks: 2,
    statement: "Differentiate between base quantities and derived quantities with two examples each.",
    answerHint: "1 mark for definition + 1 mark for valid SI examples.",
  },
  {
    id: "qb-phy9-8",
    className: "Class 9",
    subject: "Physics",
    chapter: "Unit 2: Kinematics",
    type: "Short",
    difficulty: "Medium",
    marks: 2,
    statement: "Distinguish between distance and displacement. Can displacement be zero when distance is not zero?",
    answerHint: "Scalar vs vector distinction (1m) + circular/round-trip example (1m).",
  },
  {
    id: "qb-phy9-9",
    className: "Class 9",
    subject: "Physics",
    chapter: "Unit 3: Dynamics",
    type: "Short",
    difficulty: "Medium",
    marks: 2,
    statement: "State Newton's Second Law of Motion and write its mathematical relation F = ma.",
    answerHint: "Statement (1m) + derivation/formula F = ma (1m).",
  },
  {
    id: "qb-phy9-10",
    className: "Class 9",
    subject: "Physics",
    chapter: "Unit 3: Dynamics",
    type: "Short",
    difficulty: "Easy",
    marks: 2,
    statement: "Write two practical methods of reducing friction between moving machine parts.",
    answerHint: "Lubrication, ball bearings, polishing surfaces (any two = 2m).",
  },
  {
    id: "qb-phy9-11",
    className: "Class 9",
    subject: "Physics",
    chapter: "Unit 4: Turning Effect of Forces",
    type: "Short",
    difficulty: "Medium",
    marks: 2,
    statement: "Define torque (moment of a force) and state the factors on which it depends.",
    answerHint: "Definition τ = r × F (1m) + magnitude of force and moment arm (1m).",
  },
  {
    id: "qb-phy9-12",
    className: "Class 9",
    subject: "Physics",
    chapter: "Unit 2: Kinematics",
    type: "Long",
    difficulty: "Hard",
    marks: 5,
    statement: "Derive the second equation of motion (S = vᵢt + ½at²) graphically using a speed-time graph.",
    answerHint: "Neat labeled graph (2m) + area of rectangle & triangle derivation (3m).",
  },
  {
    id: "qb-phy9-13",
    className: "Class 9",
    subject: "Physics",
    chapter: "Unit 3: Dynamics",
    type: "Long",
    difficulty: "Hard",
    marks: 5,
    statement: "State and prove the Law of Conservation of Linear Momentum for an isolated system of two colliding spheres.",
    answerHint: "Statement (1m) + diagram (1m) + mathematical proof via action-reaction forces (3m).",
  },

  // ================= CLASS 10 — MATHEMATICS =================
  {
    id: "qb-math10-1",
    className: "Class 10",
    subject: "Mathematics",
    chapter: "Unit 1: Quadratic Equations",
    type: "MCQ",
    difficulty: "Easy",
    marks: 1,
    statement: "Standard form of a quadratic equation in one variable is:",
    options: {
      A: "ax + b = 0",
      B: "ax² + bx + c = 0 (a ≠ 0)",
      C: "ax³ + bx² + c = 0",
      D: "ax² = 0",
    },
    correctOption: "B",
  },
  {
    id: "qb-math10-2",
    className: "Class 10",
    subject: "Mathematics",
    chapter: "Unit 2: Theory of Quadratic Equations",
    type: "MCQ",
    difficulty: "Medium",
    marks: 1,
    statement: "The discriminant of the quadratic equation ax² + bx + c = 0 is:",
    options: { A: "b² − 4ac", B: "b² + 4ac", C: "√(b² − 4ac)", D: "−b / 2a" },
    correctOption: "A",
  },
  {
    id: "qb-math10-3",
    className: "Class 10",
    subject: "Mathematics",
    chapter: "Unit 2: Theory of Quadratic Equations",
    type: "MCQ",
    difficulty: "Easy",
    marks: 1,
    statement: "The product of cube roots of unity (1 · ω · ω²) is equal to:",
    options: { A: "0", B: "−1", C: "1", D: "ω" },
    correctOption: "C",
  },
  {
    id: "qb-math10-4",
    className: "Class 10",
    subject: "Mathematics",
    chapter: "Unit 5: Sets and Functions",
    type: "MCQ",
    difficulty: "Easy",
    marks: 1,
    statement: "If A ⊆ B, then A ∪ B is equal to:",
    options: { A: "A", B: "B", C: "∅", D: "U" },
    correctOption: "B",
  },
  {
    id: "qb-math10-5",
    className: "Class 10",
    subject: "Mathematics",
    chapter: "Unit 1: Quadratic Equations",
    type: "Short",
    difficulty: "Medium",
    marks: 2,
    statement: "Solve by factorization: x² − 11x = 152.",
    answerHint: "x² − 11x − 152 = 0 ⇒ (x − 19)(x + 8) = 0 ⇒ x = 19, −8.",
  },
  {
    id: "qb-math10-6",
    className: "Class 10",
    subject: "Mathematics",
    chapter: "Unit 2: Theory of Quadratic Equations",
    type: "Short",
    difficulty: "Medium",
    marks: 2,
    statement: "Find the nature of the roots of 2x² + 3x + 7 = 0 using the discriminant.",
    answerHint: "Disc = 9 − 56 = −47 < 0, hence roots are imaginary/complex.",
  },
  {
    id: "qb-math10-7",
    className: "Class 10",
    subject: "Mathematics",
    chapter: "Unit 3: Variations",
    type: "Short",
    difficulty: "Easy",
    marks: 2,
    statement: "Find the third proportional to 6 and 12.",
    answerHint: "6 : 12 :: 12 : c ⇒ 6c = 144 ⇒ c = 24.",
  },
  {
    id: "qb-math10-8",
    className: "Class 10",
    subject: "Mathematics",
    chapter: "Unit 4: Partial Fractions",
    type: "Long",
    difficulty: "Hard",
    marks: 5,
    statement: "Resolve (7x − 9) / ((x + 1)(x − 3)) into partial fractions.",
    answerHint: "Set A/(x+1) + B/(x−3), solve A = 4, B = 3 ⇒ 4/(x+1) + 3/(x−3).",
  },
  {
    id: "qb-math10-9",
    className: "Class 10",
    subject: "Mathematics",
    chapter: "Unit 5: Sets and Functions",
    type: "Long",
    difficulty: "Medium",
    marks: 5,
    statement: "Verify De Morgan's Laws for U = {1,2,3,…,10}, A = {2,4,6,8,10}, and B = {1,3,5,7,9}.",
    answerHint: "Compute (A ∪ B)' = A' ∩ B' (2.5m) and (A ∩ B)' = A' ∪ B' (2.5m).",
  },

  // ================= CLASS 9 — COMPUTER SCIENCE =================
  {
    id: "qb-cs9-1",
    className: "Class 9",
    subject: "Computer Science",
    chapter: "Unit 1: Problem Solving",
    type: "MCQ",
    difficulty: "Easy",
    marks: 1,
    statement: "Which symbol is used in a flowchart to represent a decision condition?",
    options: { A: "Rectangle", B: "Oval", C: "Diamond", D: "Parallelogram" },
    correctOption: "C",
  },
  {
    id: "qb-cs9-2",
    className: "Class 9",
    subject: "Computer Science",
    chapter: "Unit 2: Binary System",
    type: "MCQ",
    difficulty: "Easy",
    marks: 1,
    statement: "The base of the hexadecimal number system is:",
    options: { A: "2", B: "8", C: "10", D: "16" },
    correctOption: "D",
  },
  {
    id: "qb-cs9-3",
    className: "Class 9",
    subject: "Computer Science",
    chapter: "Unit 3: Networks",
    type: "Short",
    difficulty: "Easy",
    marks: 2,
    statement: "Differentiate between Client and Server in a computer network.",
    answerHint: "Client requests service (1m); Server provides resources/services (1m).",
  },
  {
    id: "qb-cs9-4",
    className: "Class 9",
    subject: "Computer Science",
    chapter: "Unit 2: Binary System",
    type: "Short",
    difficulty: "Medium",
    marks: 2,
    statement: "Convert the decimal number (156)₁₀ into its equivalent binary representation.",
    answerHint: "Successive division by 2 ⇒ (10011100)₂.",
  },
  {
    id: "qb-cs9-5",
    className: "Class 9",
    subject: "Computer Science",
    chapter: "Unit 3: Networks",
    type: "Long",
    difficulty: "Medium",
    marks: 5,
    statement: "Explain Star Topology and Bus Topology with neat diagrams, stating two advantages of each.",
    answerHint: "Star diagram & explanation (2.5m) + Bus diagram & explanation (2.5m).",
  },

  // ================= GRADE 8 — ENGLISH =================
  {
    id: "qb-eng8-1",
    className: "Grade 8",
    subject: "English",
    chapter: "Grammar & Composition",
    type: "MCQ",
    difficulty: "Easy",
    marks: 1,
    statement: "Choose the correct passive voice: 'She writes a neat letter.'",
    options: {
      A: "A neat letter was written by her.",
      B: "A neat letter is written by her.",
      C: "A neat letter has been written by her.",
      D: "A neat letter is being written by her.",
    },
    correctOption: "B",
  },
  {
    id: "qb-eng8-2",
    className: "Grade 8",
    subject: "English",
    chapter: "Unit 2: Tolerance & Character",
    type: "Short",
    difficulty: "Easy",
    marks: 2,
    statement: "Use the idioms 'in black and white' and 'a blessing in disguise' in meaningful sentences.",
    answerHint: "1 mark per grammatically accurate sentence.",
  },
  {
    id: "qb-eng8-3",
    className: "Grade 8",
    subject: "English",
    chapter: "Formal Writing",
    type: "Long",
    difficulty: "Medium",
    marks: 8,
    statement: "Write a formal application to the Principal requesting three days' sick leave.",
    answerHint: "Format/salutation (2m), body clarity & grammar (4m), closing (2m).",
  },
];

export const INITIAL_GENERATED_PAPERS: GeneratedPaper[] = [
  {
    id: "pap-101",
    title: "Class 9 Physics — Mid-Term Question Paper",
    examTerm: "Mid-Term Examination 2026–27",
    className: "Class 9",
    subject: "Physics",
    duration: "2 Hours",
    campus: "Main Campus — Gulberg",
    preparedBy: "Mr. Tariq Mahmood",
    createdDate: "2026-10-24",
    status: "Finalized",
    questionIds: [
      "qb-phy9-1",
      "qb-phy9-2",
      "qb-phy9-3",
      "qb-phy9-4",
      "qb-phy9-5",
      "qb-phy9-6",
      "qb-phy9-7",
      "qb-phy9-8",
      "qb-phy9-9",
      "qb-phy9-10",
      "qb-phy9-11",
      "qb-phy9-12",
      "qb-phy9-13",
    ],
  },
  {
    id: "pap-102",
    title: "Class 10 Mathematics — Send-Up Paper",
    examTerm: "Send-Up Examination 2026–27",
    className: "Class 10",
    subject: "Mathematics",
    duration: "2.5 Hours",
    campus: "Main Campus — Gulberg",
    preparedBy: "Mrs. Sadia Rashid",
    createdDate: "2026-10-22",
    status: "Finalized",
    questionIds: [
      "qb-math10-1",
      "qb-math10-2",
      "qb-math10-3",
      "qb-math10-4",
      "qb-math10-5",
      "qb-math10-6",
      "qb-math10-7",
      "qb-math10-8",
      "qb-math10-9",
    ],
  },
  {
    id: "pap-103",
    title: "Class 9 Computer Science — Monthly Test",
    examTerm: "Monthly Assessment — Nov 2026",
    className: "Class 9",
    subject: "Computer Science",
    duration: "1 Hour",
    campus: "DHA Phase 5 Campus",
    preparedBy: "Mr. Kamran Siddiqui",
    createdDate: "2026-10-26",
    status: "Draft",
    questionIds: [
      "qb-cs9-1",
      "qb-cs9-2",
      "qb-cs9-3",
      "qb-cs9-4",
      "qb-cs9-5",
    ],
  },
  {
    id: "pap-104",
    title: "Grade 8 English — First Term Paper",
    examTerm: "First Term Examination 2026–27",
    className: "Grade 8",
    subject: "English",
    duration: "1.5 Hours",
    campus: "Main Campus — Gulberg",
    preparedBy: "Ms. Hina Javed",
    createdDate: "2026-10-18",
    status: "Finalized",
    questionIds: ["qb-eng8-1", "qb-eng8-2", "qb-eng8-3"],
  },
];

export function computePaperBreakdown(
  questionIds: string[],
  bank: QuestionBankItem[]
): {
  mcqCount: number;
  shortCount: number;
  longCount: number;
  totalMarks: number;
} {
  const map = new Map(bank.map((q) => [q.id, q]));
  let mcqCount = 0;
  let shortCount = 0;
  let longCount = 0;
  let totalMarks = 0;

  for (const id of questionIds) {
    const q = map.get(id);
    if (!q) continue;
    totalMarks += q.marks;
    if (q.type === "MCQ") mcqCount += 1;
    else if (q.type === "Short") shortCount += 1;
    else if (q.type === "Long") longCount += 1;
  }

  return { mcqCount, shortCount, longCount, totalMarks };
}
