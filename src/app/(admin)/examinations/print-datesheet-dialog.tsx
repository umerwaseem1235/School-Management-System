"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { DatesheetEntry } from "@/lib/mock/examinations";
import {
  Printer,
  Download,
  School,
  ShieldCheck,
} from "lucide-react";
import { formatDate } from "@/lib/format";
import { generateDatesheetPDF } from "@/lib/pdf/generate-datesheet-pdf";
import { toast } from "sonner";

interface PrintDatesheetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: DatesheetEntry[];
  termName: string;
  selectedClass: string;
}

export function PrintDatesheetDialog({
  open,
  onOpenChange,
  entries,
  termName,
  selectedClass,
}: PrintDatesheetDialogProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    try {
      const filename = generateDatesheetPDF({
        entries,
        termName,
        selectedClass,
      });
      toast.success(`Datesheet downloaded successfully (${filename})`);
    } catch (error) {
      toast.error("Failed to generate datesheet PDF");
    }
  };

  const [currentDate, setCurrentDate] = React.useState("26 Oct 2026");

  React.useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    );
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[880px] md:max-w-[920px] p-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl max-h-[92vh] flex flex-col print:border-none print:shadow-none print:max-w-none print:w-full print:m-0 print:p-0">
        {/* Modal Toolbar (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-muted/40 border-b border-border/70 print:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand shadow-2xs">
              <Download className="size-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block">
                Official Datesheet Document
              </span>
              <span className="text-[11px] text-muted-foreground block">
                A4 Document Format • Download PDF or Print
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleDownloadPDF}
              className="bg-brand text-cream hover:bg-brand-600 text-xs h-8.5 px-4 gap-1.5 cursor-pointer shadow-2xs font-semibold"
            >
              <Download className="size-3.5" />
              <span>Download Datesheet</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="text-xs h-8.5 px-3.5 gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <Printer className="size-3.5" />
              <span>Print</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8.5 px-3.5 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              Close
            </Button>
          </div>
        </div>

        {/* Scrollable Canvas Area (Background canvas on screen, direct sheet on print) */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto bg-muted/30 print:bg-white print:p-0 print:m-0 print:overflow-visible">
          {/* Authentic Document Paper Sheet */}
          <div className="max-w-3xl mx-auto bg-card text-foreground rounded-2xl border border-border/80 shadow-lg p-6 sm:p-10 space-y-6 print:shadow-none print:border-none print:p-0 print:max-w-none print:rounded-none print:bg-white print:text-black">
            
            {/* 1. Distinguished Institutional Letterhead */}
            <div className="border-b-2 border-border/80 pb-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3.5">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-brand text-cream shadow-md ring-4 ring-brand/10 shrink-0 print:border print:border-black/30">
                    <School className="size-7" />
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-extrabold tracking-tight uppercase text-foreground print:text-black leading-tight">
                      School Management System
                    </h1>
                    <p className="text-xs font-semibold text-brand print:text-black uppercase tracking-wider mt-0.5">
                      Office of the Controller of Examinations
                    </p>
                    <p className="text-[11px] text-muted-foreground print:text-gray-600 mt-0.5">
                      Affiliated with Board of Intermediate & Secondary Education
                    </p>
                  </div>
                </div>

                <div className="text-center sm:text-right shrink-0">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-brand-soft text-brand border border-brand/20 print:border-black/40 print:text-black">
                    Official Datesheet
                  </span>
                  <p className="text-[11px] text-muted-foreground print:text-gray-600 mt-1 font-mono">
                    Issue Date: {currentDate}
                  </p>
                </div>
              </div>

              {/* Title Strip */}
              <div className="pt-2 text-center">
                <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-foreground print:text-black underline underline-offset-4 decoration-brand/40">
                  {termName} Schedule
                </h2>
              </div>
            </div>

            {/* 2. Key Metadata Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/70 text-xs print:bg-gray-100 print:border-black/20">
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground print:text-gray-600 block">
                  Class / Grade
                </span>
                <span className="font-bold text-foreground print:text-black truncate block">
                  {selectedClass === "ALL" ? "All Enrolled Classes" : selectedClass}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground print:text-gray-600 block">
                  Academic Year
                </span>
                <span className="font-bold text-foreground print:text-black block">
                  2026 – 2027
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground print:text-gray-600 block">
                  Exam Timing & Shift
                </span>
                <span className="font-bold text-foreground print:text-black block font-mono">
                  08:30 – 11:30 AM
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground print:text-gray-600 block">
                  Reporting Time
                </span>
                <span className="font-bold text-brand print:text-black block font-mono">
                  08:15 AM Sharp
                </span>
              </div>
            </div>

            {/* 3. Official Datesheet Table */}
            <div className="rounded-xl border border-border/80 overflow-hidden shadow-2xs print:border-black/30 print:shadow-none">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/70 text-foreground font-semibold border-b border-border/70 uppercase tracking-wider text-[11px] print:bg-gray-200 print:text-black print:border-black/30">
                  <tr>
                    <th className="px-3.5 py-3 w-10 text-center">#</th>
                    <th className="px-3.5 py-3">Date & Day</th>
                    {selectedClass === "ALL" && <th className="px-3.5 py-3">Class</th>}
                    <th className="px-3.5 py-3">Subject Paper</th>
                    <th className="px-3.5 py-3 text-center">Timing & Shift</th>
                    <th className="px-3.5 py-3 text-center">Marks (Total/Pass)</th>
                    <th className="px-3.5 py-3 text-center">Exam Hall</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 print:divide-black/20">
                  {entries.length > 0 ? (
                    entries.map((entry, idx) => (
                      <tr key={entry.id} className="hover:bg-muted/30 print:hover:bg-transparent break-inside-avoid">
                        <td className="px-3.5 py-2.5 text-center font-mono font-bold text-muted-foreground print:text-gray-600">
                          {idx + 1}
                        </td>
                        <td className="px-3.5 py-2.5 font-medium whitespace-nowrap">
                          <span className="font-bold text-foreground print:text-black block">
                            {formatDate(entry.examDate)}
                          </span>
                          <span className="text-muted-foreground print:text-gray-600 text-[11px]">
                            {entry.day}
                          </span>
                        </td>
                        {selectedClass === "ALL" && (
                          <td className="px-3.5 py-2.5 font-medium text-foreground print:text-black">
                            {entry.className}
                          </td>
                        )}
                        <td className="px-3.5 py-2.5 font-bold text-foreground print:text-black">
                          {entry.subject}
                          {entry.invigilator && (
                            <span className="block text-[10px] font-normal text-muted-foreground print:text-gray-500">
                              Invigilator: {entry.invigilator}
                            </span>
                          )}
                        </td>
                        <td className="px-3.5 py-2.5 text-center font-mono whitespace-nowrap">
                          <span className="font-semibold text-foreground print:text-black block">
                            {entry.startTime} – {entry.endTime}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase print:text-gray-500">
                            {entry.shift} Shift
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 text-center font-mono whitespace-nowrap">
                          <span className="font-bold text-foreground print:text-black">
                            {entry.maxMarks}
                          </span>
                          <span className="text-muted-foreground text-[11px] ml-1 print:text-gray-600">
                            (Pass: {entry.passMarks})
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 text-center text-foreground print:text-black whitespace-nowrap font-medium">
                          {entry.roomHall}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={selectedClass === "ALL" ? 7 : 6}
                        className="px-4 py-8 text-center text-muted-foreground text-xs"
                      >
                        No examination papers scheduled for the selected criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 4. Important Instructions for Candidates */}
            <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-2.5 text-xs break-inside-avoid print:bg-transparent print:border-black/30">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-brand print:text-black" />
                <h3 className="font-bold text-foreground print:text-black uppercase tracking-wider text-[11.5px]">
                  Important Instructions for Candidates:
                </h3>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground print:text-black text-[11.5px] leading-relaxed">
                <li>
                  Students must report to the examination hall in full school uniform at least <strong>15 minutes before</strong> commencement (08:15 AM). Late arrivals exceeding 15 minutes will not be admitted.
                </li>
                <li>
                  Original <strong>Roll Number Slip</strong> and transparent clipboard are strictly mandatory for entry into the examination hall.
                </li>
                <li>
                  Mobile phones, smartwatches, digital devices, books, or notes are <strong>strictly prohibited</strong> inside the examination room.
                </li>
                <li>
                  Minimum passing marks in each individual subject paper are <strong>33%</strong> as per academic board criteria.
                </li>
                <li>
                  Students are strictly advised to bring their own stationery. Lending or borrowing supplies during the exam is forbidden.
                </li>
                <li>
                  No candidate will be permitted to hand over the answer sheet or leave the examination hall before half time has elapsed.
                </li>
              </ol>
            </div>

            {/* 5. Attestation & Signatures Section */}
            <div className="pt-6 sm:pt-10 flex items-end justify-between text-xs text-foreground print:text-black px-4 break-inside-avoid">
              <div className="text-center space-y-1.5">
                <div className="w-44 border-b-2 border-foreground/70 print:border-black/70 pb-1" />
                <span className="font-bold block text-xs">Controller of Examinations</span>
                <span className="text-[11px] text-muted-foreground print:text-gray-600">Central Examination Cell</span>
              </div>

              <div className="hidden sm:flex flex-col items-center justify-center p-2 rounded-xl border border-dashed border-border/80 text-[10px] text-muted-foreground/80 uppercase font-mono tracking-widest text-center size-20 print:border-black/40 print:text-gray-500">
                <span>Official</span>
                <span>Seal / Stamp</span>
              </div>

              <div className="text-center space-y-1.5">
                <div className="w-44 border-b-2 border-foreground/70 print:border-black/70 pb-1" />
                <span className="font-bold block text-xs">Principal / Head of School</span>
                <span className="text-[11px] text-muted-foreground print:text-gray-600">School Management System</span>
              </div>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
