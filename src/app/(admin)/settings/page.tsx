import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Meter } from "@/components/shared/meter";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export const metadata = {
  title: "System Settings",
};

function SettingRow({ label, value, action }: { label: string; value: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="w-1/3">
        <span className="font-medium text-sm text-slate-700">{label}</span>
      </div>
      <div className="w-1/2">
        {typeof value === 'string' ? <span className="text-sm text-slate-600">{value}</span> : value}
      </div>
      <div className="w-auto flex justify-end">
        {action || <Button variant="ghost" size="sm">Edit</Button>}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="System Settings" />

      <div className="space-y-6 mb-6">
        <SectionCard title="Institutional Profile">
          <div className="divide-y divide-slate-100">
            <SettingRow label="School Name" value="EduSphere International" />
            <SettingRow label="Tagline" value="Excellence in Education" />
            <SettingRow label="Address" value="123 Education Boulevard, Academytown" />
            <SettingRow label="Phone" value="+1 (555) 123-4567" />
            <SettingRow label="Email" value="admin@edusphere.edu" />
            <SettingRow label="Current Academic Year" value="2023-2024" />
            <SettingRow label="School Logo" value={<div className="h-10 w-10 bg-slate-200 rounded-md border border-slate-300"></div>} />
          </div>
        </SectionCard>

        <SectionCard title="Academic Configuration">
          <div className="divide-y divide-slate-100">
            <SettingRow label="Grading System" value="GPA (4.0 Scale) + Letter Grades" />
            <SettingRow label="Minimum Attendance Threshold" value="75%" />
            <SettingRow label="Academic Year Dates" value="Sep 1, 2023 - Jun 30, 2024" />
            <SettingRow label="Term Structure" value="Semester System (2 Terms)" />
          </div>
        </SectionCard>

        <SectionCard title="Fee Configuration">
          <div className="divide-y divide-slate-100">
            <SettingRow label="Late Fee Surcharge" value="5% per month" />
            <SettingRow label="Grace Period" value="7 Days" />
            <SettingRow label="Challan Format" value="PDF (A4 Size) with Bank Barcode" />
          </div>
        </SectionCard>

        <SectionCard title="Notification Settings">
          <div className="divide-y divide-slate-100">
            <SettingRow 
              label="SMS Notifications" 
              value={<Switch defaultChecked />} 
              action={<Button variant="ghost" size="sm">Configure</Button>}
            />
            <SettingRow 
              label="WhatsApp Integration" 
              value={<Switch defaultChecked />} 
              action={<Button variant="ghost" size="sm">Configure</Button>}
            />
            <SettingRow 
              label="Email Notifications" 
              value={<Switch defaultChecked />} 
              action={<Button variant="ghost" size="sm">Configure</Button>}
            />
          </div>
        </SectionCard>

        <SectionCard title="Security & Authentication">
          <div className="divide-y divide-slate-100">
            <SettingRow label="Password Policy" value="Minimum 8 characters, 1 uppercase, 1 number" />
            <SettingRow label="2FA Enforcement" value="Required for Staff & Admins" />
            <SettingRow label="Session Timeout" value="30 Minutes of inactivity" />
          </div>
        </SectionCard>

        <SectionCard title="Database & Backups">
          <div className="divide-y divide-slate-100">
            <SettingRow label="Database Status" value={<span className="text-emerald-600 font-medium">Connected (MongoDB Atlas)</span>} action={<Button variant="ghost" size="sm">View Metrics</Button>} />
            <SettingRow label="Last Backup" value="Today at 02:00 AM (Automated)" action={<Button variant="ghost" size="sm">Restore</Button>} />
            <SettingRow label="Auto-Backup Schedule" value="Daily at 02:00 AM" />
            <SettingRow 
              label="Storage Usage" 
              value={
                <div className="space-y-2 w-full max-w-xs">
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>45 GB used</span>
                    <span>100 GB total</span>
                  </div>
                  <Meter value={45} tone="info" size="sm" />
                </div>
              } 
              action={<Button variant="ghost" size="sm">Manage</Button>}
            />
          </div>
        </SectionCard>
      </div>
    </>
  );
}
