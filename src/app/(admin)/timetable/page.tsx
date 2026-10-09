import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { TIMETABLE, DAYS, PERIOD_SLOTS } from "@/lib/mock/academics";

export const metadata = {
  title: "Timetable Management",
};

const slotLabels = [
  "Period 1", "Period 2", "Period 3", "Break", "Period 4", "Period 5", "Period 6",
];

export default function TimetablePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Timetable Management" />

      <SectionCard flush>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-[#f5f6e6] text-[#353955]">
              <tr>
                <th className="border-b p-3 font-semibold">Day</th>
                {PERIOD_SLOTS.map((slot, i) => (
                  <th
                    key={i}
                    className="border-b border-l p-3 text-center font-semibold"
                  >
                    <div>{slotLabels[i]}</div>
                    <div className="text-xs font-normal text-muted-foreground">
                      {slot.start} - {slot.end}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day, rowIndex) => {
                const dayPeriods = TIMETABLE[day];
                return (
                  <tr
                    key={day}
                    className={rowIndex % 2 === 0 ? "bg-background" : "bg-muted/30"}
                  >
                    <td className="border-b border-r bg-[#353955]/5 p-3 font-medium">
                      {day}
                    </td>
                    {PERIOD_SLOTS.map((slot, slotIdx) => {
                      if (slot.isBreak) {
                        return (
                          <td
                            key={slotIdx}
                            className="border-b border-l bg-muted p-3 text-center text-muted-foreground"
                          >
                            Break
                          </td>
                        );
                      }

                      const entry = dayPeriods[slotIdx];
                      return (
                        <td
                          key={slotIdx}
                          className="min-w-[120px] border-b border-l p-3 text-center"
                        >
                          {entry ? (
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-[#353955]">
                                {entry.subject}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {entry.teacher} • {entry.room}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground/30">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
