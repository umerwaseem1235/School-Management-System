import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Meter } from "@/components/shared/meter";
import { EXAM_TERMS, DATESHEET, GRADE_DISTRIBUTION, GRADE_SCALE, TOP_PERFORMERS } from "@/lib/mock/academics";
import { CalendarClock, CalendarDays, CheckCircle, Trophy } from "lucide-react";
import { formatDate } from "@/lib/format";
import { BarSeriesChart } from "@/components/charts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata = { title: "Examination Management" };

export default function ExaminationsPage() {
  const upcomingExams = EXAM_TERMS.filter((t) => t.status === "Scheduled").length;
  const resultsPublished = EXAM_TERMS.filter((t) => t.status === "Published").length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Examination Management" />

      <StatGrid>
        <StatCard label="Exam Terms" value={EXAM_TERMS.length.toString()} icon={CalendarClock} />
        <StatCard label="Upcoming Exams" value={upcomingExams.toString()} icon={CalendarDays} />
        <StatCard label="Results Published" value={resultsPublished.toString()} icon={CheckCircle} />
        <StatCard label="Top GPA" value="4.0" icon={Trophy} />
      </StatGrid>

      <SectionCard title="Exam Terms">
        <div className="flex flex-col gap-4">
          {EXAM_TERMS.map((term) => (
            <div key={term.id} className="flex flex-col justify-between gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center">
              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-medium">{term.examName}</h4>
                  <StatusBadge status={term.status} />
                </div>
                <div className="text-sm text-muted-foreground">
                  {term.academicYear} — {term.term} • {formatDate(term.startDate)} to {formatDate(term.endDate)}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Campus:</span> {term.campus} • <span className="font-medium">Classes:</span> {term.classes}
                </div>
              </div>
              <div className="w-full shrink-0 sm:w-48">
                <div className="mb-1 flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{term.progress}%</span>
                </div>
                <Meter value={term.progress} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Upcoming Datesheet" flush>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Day</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Classes</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Rooms</TableHead>
              <TableHead>Invigilators</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DATESHEET.map((ds, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">{formatDate(ds.date)}</TableCell>
                <TableCell>{ds.day}</TableCell>
                <TableCell>{ds.subject}</TableCell>
                <TableCell>{ds.classes}</TableCell>
                <TableCell>{ds.time}</TableCell>
                <TableCell>{ds.rooms}</TableCell>
                <TableCell>{ds.invigilators}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Grade Distribution">
          <BarSeriesChart
            data={GRADE_DISTRIBUTION}
            xKey="grade"
            series={[{ key: "students", label: "Students", color: "#353955" }]}
          />
        </SectionCard>

        <SectionCard title="Grading Scale" flush>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grade</TableHead>
                <TableHead>Range</TableHead>
                <TableHead>GPA</TableHead>
                <TableHead>Remark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {GRADE_SCALE.map((gs) => (
                <TableRow key={gs.grade}>
                  <TableCell className="font-medium">{gs.grade}</TableCell>
                  <TableCell>{gs.min}% — {gs.max}%</TableCell>
                  <TableCell>{gs.gpa}</TableCell>
                  <TableCell>{gs.remark}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>
      </div>

      <SectionCard title="Top Performers" flush>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Campus</TableHead>
              <TableHead>Percentage</TableHead>
              <TableHead>GPA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {TOP_PERFORMERS.map((tp, idx) => (
              <TableRow key={tp.name}>
                <TableCell className="font-medium">#{idx + 1}</TableCell>
                <TableCell>{tp.name}</TableCell>
                <TableCell>{tp.className}</TableCell>
                <TableCell>{tp.campus}</TableCell>
                <TableCell>{tp.percentage}%</TableCell>
                <TableCell>{tp.gpa}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionCard>
    </div>
  );
}
