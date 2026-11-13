"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  BadgeCheck,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Laptop,
  Lock,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
  X,
  FileText,
  Briefcase,
  Bell,
  Cpu,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type TabKey = "overview" | "security" | "permissions" | "preferences";

export function ProfileClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = (searchParams.get("tab") as TabKey) || "overview";
  const [activeTab, setActiveTab] = React.useState<TabKey>(tabParam);

  React.useEffect(() => {
    if (tabParam && ["overview", "security", "permissions", "preferences"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    router.replace(`/profile?tab=${tab}`, { scroll: false });
  };

  // Editable Profile State
  const [isEditing, setIsEditing] = React.useState(false);
  const [profileData, setProfileData] = React.useState({
    fullName: "Hamza Tariq",
    email: "hamza.tariq@edusphere.edu.pk",
    phone: "+92 (300) 1122334",
    secondaryPhone: "+92 (321) 8899001",
    cnic: "35201-1122334-1",
    designation: "Chief Systems Director & Lead Institutional Super Admin",
    department: "Executive Directorate & Central Information Systems",
    primaryStation: "Executive Suite 401, Central HQ, Lahore",
    emergencyContact: "Nadia Hussain (Principal Secretariat) — 0321-4455667",
    bloodGroup: "B+",
    joiningDate: "14 August 2018",
    empCode: "ADM-2018-001",
  });

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showCurrentPw, setShowCurrentPw] = React.useState(false);
  const [showNewPw, setShowNewPw] = React.useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false);

  // Preferences State
  const [preferences, setPreferences] = React.useState({
    financialAlerts: true,
    emergencySms: true,
    newLoginAlerts: true,
    dailyBrief: true,
    sessionTimeout: "30",
    defaultCampus: "all",
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    toast.success("Administrator Profile Updated", {
      description: "Your official contact & station details have been saved successfully.",
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Security Credentials Updated", {
        description: "Your administrator password has been updated. All sessions re-authenticated.",
      });
    }, 600);
  };

  const handleSavePreferences = () => {
    toast.success("Preferences Saved", {
      description: "System notifications and security timeout settings updated.",
    });
  };

  const handleTerminateOtherSessions = () => {
    toast.success("Other Sessions Terminated", {
      description: "All other active sessions on secondary devices were revoked.",
    });
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Top Breadcrumb & Page Title */}
      <PageHeader
        title="Administrator Profile"
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (typeof window !== "undefined") window.print();
              }}
              className="gap-1.5 text-xs font-medium cursor-pointer shadow-2xs"
            >
              <FileText className="size-3.5" />
              <span>Print Dossier</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="gap-1.5 bg-brand text-cream hover:bg-brand-600 cursor-pointer shadow-sm text-xs font-semibold"
            >
              {isEditing ? (
                <>
                  <X className="size-3.5" />
                  <span>Cancel Edit</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  <span>Edit Profile</span>
                </>
              )}
            </Button>
          </div>
        }
      />

      {/* Hero Cover Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-background shadow-sm">
        {/* Decorative Enterprise Banner Background */}
        <div className="h-40 sm:h-48 w-full bg-gradient-to-r from-[#07162c] via-[#0e274c] to-[#1a3d6e] relative overflow-hidden">
          {/* Subtle Grid Accent */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
            }}
          />

          <div className="absolute right-6 top-6 hidden md:flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-md border border-white/15 shadow-sm">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              Tier 0 Root Access
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300 backdrop-blur-md border border-emerald-400/30">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              Active System Session
            </span>
          </div>
        </div>

        {/* Profile Info Section with Avatar Overlap */}
        <div className="px-6 pb-6 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-14 mb-4">
            <div className="flex items-end gap-4">
              {/* Avatar Monogram */}
              <div className="relative group">
                <div className="grid size-24 sm:size-28 place-items-center rounded-2xl bg-gradient-to-b from-[#6e3b1f] to-[#381e0f] font-heading text-3xl font-bold text-white shadow-xl ring-4 ring-background border border-white/20">
                  HT
                </div>
                <div
                  title="Online · 2FA Active"
                  className="absolute bottom-1 right-1 size-5 rounded-full bg-emerald-500 ring-4 ring-background flex items-center justify-center text-white"
                >
                  <Check className="size-3 stroke-[3]" />
                </div>
              </div>

              {/* Name & Title */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground">
                    {profileData.fullName}
                  </h2>
                  <span title="Verified System Administrator">
                    <BadgeCheck className="size-5 text-sky-500 shrink-0" />
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-brand shrink-0" />
                  <span>Super Administrator</span>
                  <span className="text-muted-foreground/40">•</span>
                  <span>ID: {profileData.empCode}</span>
                </p>
              </div>
            </div>

            {/* Quick Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-brand-50 text-brand border border-brand/20">
                <Building2 className="size-3.5" />
                <span>All 5 Campuses Oversight</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Lock className="size-3.5 text-emerald-600" />
                <span>2FA Enforced</span>
              </span>
            </div>
          </div>

          {/* Quick Contact & Placement Meta Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-border/60 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-3.5 text-brand shrink-0" />
              <span className="truncate text-foreground font-medium">{profileData.email}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-3.5 text-brand shrink-0" />
              <span className="text-foreground font-medium font-mono">{profileData.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-3.5 text-brand shrink-0" />
              <span className="truncate text-foreground font-medium">Lahore HQ & Multi-Campus</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="size-3.5 text-brand shrink-0" />
              <span>Tenure: <strong className="text-foreground font-medium">Since Aug 2018 (6+ Yrs)</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Clean Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-border/80 overflow-x-auto pb-px scrollbar-none">
        <button
          type="button"
          onClick={() => handleTabChange("overview")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === "overview"
              ? "border-brand text-brand bg-brand-50/40 rounded-t-lg"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-t-lg"
          )}
        >
          <User className="size-4" />
          <span>Profile & Placement</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("security")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === "security"
              ? "border-brand text-brand bg-brand-50/40 rounded-t-lg"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-t-lg"
          )}
        >
          <ShieldCheck className="size-4" />
          <span>Security & 2FA</span>
          <span className="size-2 rounded-full bg-emerald-500" />
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("permissions")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === "permissions"
              ? "border-brand text-brand bg-brand-50/40 rounded-t-lg"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-t-lg"
          )}
        >
          <KeyRound className="size-4" />
          <span>Roles & Authority</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("preferences")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === "preferences"
              ? "border-brand text-brand bg-brand-50/40 rounded-t-lg"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-t-lg"
          )}
        >
          <Bell className="size-4" />
          <span>Notifications & Preferences</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & PLACEMENT */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Personal Dossier */}
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-xl border border-border/80 bg-background p-6 shadow-2xs space-y-5">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand">
                        <User className="size-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">
                          Personal Information & Identity
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          Official administrative credentials and identity record
                        </p>
                      </div>
                    </div>
                    {isEditing && (
                      <span className="text-xs font-semibold text-brand bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand/20">
                        Editing Mode
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-foreground">Full Name</Label>
                      {isEditing ? (
                        <Input
                          value={profileData.fullName}
                          onChange={(e) =>
                            setProfileData((prev) => ({ ...prev, fullName: e.target.value }))
                          }
                          required
                          className="h-9 text-xs"
                        />
                      ) : (
                        <p className="h-9 flex items-center px-3 rounded-lg bg-muted/30 border border-border/60 text-xs font-semibold text-foreground">
                          {profileData.fullName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-foreground">Official Email</Label>
                      <div className="relative">
                        <p className="h-9 flex items-center px-3 pr-20 rounded-lg bg-muted/40 border border-border/60 text-xs font-medium text-foreground select-none">
                          {profileData.email}
                        </p>
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10.5px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          Verified
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-foreground">Primary Mobile Phone</Label>
                      {isEditing ? (
                        <Input
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData((prev) => ({ ...prev, phone: e.target.value }))
                          }
                          required
                          className="h-9 text-xs font-mono"
                        />
                      ) : (
                        <p className="h-9 flex items-center px-3 rounded-lg bg-muted/30 border border-border/60 text-xs font-mono font-medium text-foreground">
                          {profileData.phone}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-foreground">Secondary / Office Phone</Label>
                      {isEditing ? (
                        <Input
                          value={profileData.secondaryPhone}
                          onChange={(e) =>
                            setProfileData((prev) => ({ ...prev, secondaryPhone: e.target.value }))
                          }
                          className="h-9 text-xs font-mono"
                        />
                      ) : (
                        <p className="h-9 flex items-center px-3 rounded-lg bg-muted/30 border border-border/60 text-xs font-mono font-medium text-foreground">
                          {profileData.secondaryPhone}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-foreground">CNIC / National Identity</Label>
                      <div className="relative">
                        <p className="h-9 flex items-center px-3 pr-24 rounded-lg bg-muted/40 border border-border/60 text-xs font-mono font-medium text-foreground select-none">
                          {profileData.cnic}
                        </p>
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-brand bg-brand-50 border border-brand/20 px-1.5 py-0.5 rounded">
                          NADRA Verified
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-foreground">Blood Group</Label>
                      {isEditing ? (
                        <Input
                          value={profileData.bloodGroup}
                          onChange={(e) =>
                            setProfileData((prev) => ({ ...prev, bloodGroup: e.target.value }))
                          }
                          className="h-9 text-xs"
                        />
                      ) : (
                        <p className="h-9 flex items-center px-3 rounded-lg bg-muted/30 border border-border/60 text-xs font-semibold text-foreground">
                          {profileData.bloodGroup}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <Label className="text-xs font-medium text-foreground">Primary Office Station</Label>
                      {isEditing ? (
                        <Input
                          value={profileData.primaryStation}
                          onChange={(e) =>
                            setProfileData((prev) => ({ ...prev, primaryStation: e.target.value }))
                          }
                          className="h-9 text-xs"
                        />
                      ) : (
                        <p className="h-9 flex items-center px-3 rounded-lg bg-muted/30 border border-border/60 text-xs text-foreground">
                          {profileData.primaryStation}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <Label className="text-xs font-medium text-foreground">Emergency Contact Protocol</Label>
                      {isEditing ? (
                        <Input
                          value={profileData.emergencyContact}
                          onChange={(e) =>
                            setProfileData((prev) => ({ ...prev, emergencyContact: e.target.value }))
                          }
                          className="h-9 text-xs"
                        />
                      ) : (
                        <p className="h-9 flex items-center px-3 rounded-lg bg-muted/30 border border-border/60 text-xs text-foreground">
                          {profileData.emergencyContact}
                        </p>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="pt-3 border-t border-border/60 flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                        className="text-xs cursor-pointer"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        className="bg-brand text-cream hover:bg-brand-600 text-xs font-semibold cursor-pointer shadow-sm"
                      >
                        <Save className="size-3.5 mr-1.5" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Institutional Governance & Placement */}
              <div className="space-y-6">
                <div className="rounded-xl border border-border/80 bg-background p-6 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                    <div className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand">
                      <Building2 className="size-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Institutional Placement</h3>
                      <p className="text-[11px] text-muted-foreground">Governance scope & department</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Designation</span>
                      <span className="font-semibold text-foreground block mt-0.5">
                        {profileData.designation}
                      </span>
                    </div>

                    <div>
                      <span className="text-muted-foreground block text-[11px]">Department</span>
                      <span className="font-semibold text-foreground block mt-0.5">
                        {profileData.department}
                      </span>
                    </div>

                    <div>
                      <span className="text-muted-foreground block text-[11px]">Reporting Authority</span>
                      <span className="font-medium text-foreground block mt-0.5">
                        Board of Governors & Institutional Directorate
                      </span>
                    </div>

                    <div>
                      <span className="text-muted-foreground block text-[11px]">System Code</span>
                      <span className="font-mono font-semibold text-brand block mt-0.5">
                        {profileData.empCode}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-border/60">
                      <span className="text-muted-foreground block text-[11px] mb-1.5 font-medium">
                        Active Campus Jurisdiction:
                      </span>
                      <div className="space-y-1.5">
                        {[
                          "Main Campus — Gulberg, Lahore",
                          "DHA Phase 5 Campus, Lahore",
                          "F-8 Islamabad Campus",
                          "Clifton Karachi Campus",
                          "Bahria Town Campus, Rawalpindi",
                        ].map((c) => (
                          <div
                            key={c}
                            className="flex items-center gap-2 px-2.5 py-1 rounded bg-muted/40 border border-border/50 text-[11.5px]"
                          >
                            <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span className="truncate text-foreground font-medium">{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: SECURITY & 2FA */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: 2FA & Password Management */}
            <div className="lg:col-span-2 space-y-6">
              {/* 2FA Enforced Card */}
              <div className="rounded-xl border border-border/80 bg-background p-6 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                      <ShieldCheck className="size-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">
                          Two-Factor Authentication (2FA)
                        </h3>
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold text-[10px]">
                          Enforced & Active
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Mandatory security protocol for all Super Administrator accounts
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/40 flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-emerald-900">
                      Authenticator App Protection is Active
                    </p>
                    <p className="text-emerald-800/90 leading-relaxed text-[11.5px]">
                      Your account requires a 6-digit verification code from your TOTP authenticator (Google Authenticator / Duo Mobile) in addition to your master credentials when signing in from unrecognized locations.
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <span className="text-[11px] text-emerald-700 font-medium">
                        • 8 of 10 Emergency Recovery Codes Available
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">
                    Need new emergency recovery codes?
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() =>
                      toast.info("Recovery Codes Regenerated", {
                        description: "New backup codes have been dispatched to your encrypted institutional mailbox.",
                      })
                    }
                    className="cursor-pointer text-xs"
                  >
                    <RefreshCw className="size-3 mr-1" />
                    Regenerate Backup Codes
                  </Button>
                </div>
              </div>

              {/* Password Change Form */}
              <div className="rounded-xl border border-border/80 bg-background p-6 shadow-2xs space-y-5">
                <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
                  <div className="grid size-9 place-items-center rounded-lg bg-brand-50 text-brand border border-brand/20">
                    <KeyRound className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Update Master Password</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Ensure your password contains uppercase letters, numbers, and symbols
                    </p>
                  </div>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">Current Password</Label>
                    <div className="relative">
                      <Input
                        type={showCurrentPw ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="h-9 text-xs pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showCurrentPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-foreground">New Master Password</Label>
                      <div className="relative">
                        <Input
                          type={showNewPw ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min. 8 characters"
                          required
                          className="h-9 text-xs pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPw(!showNewPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {showNewPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-foreground">Confirm New Password</Label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        required
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>

                  {/* Password Checklist */}
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-muted-foreground">
                    <span className={cn("flex items-center gap-1", newPassword.length >= 8 && "text-emerald-600 font-semibold")}>
                      <Check className="size-3" /> 8+ Characters
                    </span>
                    <span className={cn("flex items-center gap-1", /[A-Z]/.test(newPassword) && "text-emerald-600 font-semibold")}>
                      <Check className="size-3" /> Uppercase Letter
                    </span>
                    <span className={cn("flex items-center gap-1", /[0-9]/.test(newPassword) && "text-emerald-600 font-semibold")}>
                      <Check className="size-3" /> Number (0-9)
                    </span>
                    <span className={cn("flex items-center gap-1", /[^A-Za-z0-9]/.test(newPassword) && "text-emerald-600 font-semibold")}>
                      <Check className="size-3" /> Symbol (!@#$)
                    </span>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isUpdatingPassword}
                      className="bg-brand text-cream hover:bg-brand-600 text-xs font-semibold cursor-pointer shadow-sm"
                    >
                      <Lock className="size-3.5 mr-1.5" />
                      {isUpdatingPassword ? "Updating Password..." : "Update Master Password"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Active Devices & Sessions */}
            <div className="space-y-6">
              <div className="rounded-xl border border-border/80 bg-background p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand">
                      <Laptop className="size-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Active Sessions</h3>
                      <p className="text-[11px] text-muted-foreground">Authorized administrative devices</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Current Device */}
                  <div className="p-3 rounded-lg border border-brand/30 bg-brand-50/30 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Laptop className="size-3.5 text-brand" />
                        Windows 11 · Google Chrome
                      </span>
                      <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded">
                        This Device
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Lahore, Pakistan • IP: 182.185.120.45
                    </p>
                    <p className="text-[10px] text-emerald-700 font-medium">
                      Active Now • Master Session
                    </p>
                  </div>

                  {/* Secondary Device */}
                  <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Smartphone className="size-3.5 text-muted-foreground" />
                        Apple iPhone 15 Pro · Mobile Safari
                      </span>
                      <span className="text-[9.5px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        Authorized
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Islamabad, Pakistan • IP: 119.160.10.14
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Active 2 hours ago
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTerminateOtherSessions}
                  className="w-full text-xs text-danger hover:bg-danger/10 hover:border-danger/30 cursor-pointer"
                >
                  Terminate Other Sessions
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ROLES & AUTHORITY MATRIX */}
      {activeTab === "permissions" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border/80 bg-background p-6 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-brand text-cream shadow-sm">
                  <KeyRound className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-heading font-bold text-foreground">
                    Super Administrator Authority & Privileges Matrix
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Unrestricted root jurisdiction across all 5 school branches, academic wings, and fiscal accounts
                  </p>
                </div>
              </div>
              <Badge className="bg-brand text-cream font-semibold">Tier 0 Root</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: "Multi-Campus Governance",
                  desc: "Create and decommission campuses, manage branch capacity, assign principals, and configure institutional operating hours.",
                  scope: "All 5 Campuses",
                },
                {
                  title: "User Provisioning & Role Delegation",
                  desc: "Grant or revoke role permissions across Teachers, HR Admins, Accountants, Receptionists, Students, and Parents.",
                  scope: "Global User Directory",
                },
                {
                  title: "Fiscal & Fee Approval Authority",
                  desc: "Approve scholarship grants, fine waivers, refunds, fee challan reconciliations, and executive staff payroll releases.",
                  scope: "Direct Sign-off",
                },
                {
                  title: "Curriculum & Examination Directorate",
                  desc: "Configure Cambridge & Pakistani BISE curricula, grading scales, term date-sheets, and final transcript issuance.",
                  scope: "Academic Master",
                },
                {
                  title: "Student Admissions & Enrollment Lifecycle",
                  desc: "Authorize candidate intake, class sections assignment, fee voucher generation, and student status changes.",
                  scope: "Central Registry",
                },
                {
                  title: "System Audit Logs & Security Lockout",
                  desc: "Audit every database transaction, IP access log, emergency school-wide broadcast, and enforce two-factor authentication.",
                  scope: "Root Level",
                },
              ].map((p) => (
                <div
                  key={p.title}
                  className="p-4 rounded-xl border border-border/80 bg-muted/15 space-y-2 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                      {p.title}
                    </span>
                    <span className="text-[10px] font-semibold text-brand bg-brand-50 border border-brand/20 px-2 py-0.5 rounded-full">
                      {p.scope}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Compliance & Standards */}
            <div className="p-4 rounded-xl border border-border/80 bg-gradient-to-r from-brand-50/30 to-background flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Shield className="size-4 text-brand" />
                <span className="font-semibold text-foreground">
                  Security Compliance & Data Governance Standards:
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground font-mono text-[11px]">
                <span className="bg-background px-2 py-0.5 rounded border border-border">ISO 27001</span>
                <span className="bg-background px-2 py-0.5 rounded border border-border">FERPA Aligned</span>
                <span className="bg-background px-2 py-0.5 rounded border border-border">AES-256 Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PREFERENCES & NOTIFICATIONS */}
      {activeTab === "preferences" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border/80 bg-background p-6 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-lg bg-brand-50 text-brand">
                  <Bell className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Administrative Notification Channels
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Configure high-priority dispatch preferences for this account
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-border/60 text-xs">
              <div className="flex items-center justify-between py-3.5">
                <div className="space-y-0.5 max-w-lg">
                  <span className="font-semibold text-foreground block">
                    Financial Sign-offs & Fee Waivers
                  </span>
                  <span className="text-muted-foreground text-[11.5px] block">
                    Receive instant alerts when fee refunds, payroll, or scholarship requests require your final signature.
                  </span>
                </div>
                <Switch
                  checked={preferences.financialAlerts}
                  onCheckedChange={(c) =>
                    setPreferences((prev) => ({ ...prev, financialAlerts: c }))
                  }
                />
              </div>

              <div className="flex items-center justify-between py-3.5">
                <div className="space-y-0.5 max-w-lg">
                  <span className="font-semibold text-foreground block">
                    Emergency Campus Alerts & Weather Closures
                  </span>
                  <span className="text-muted-foreground text-[11.5px] block">
                    Direct SMS and high-priority push notification for unscheduled emergency campus dispatches.
                  </span>
                </div>
                <Switch
                  checked={preferences.emergencySms}
                  onCheckedChange={(c) =>
                    setPreferences((prev) => ({ ...prev, emergencySms: c }))
                  }
                />
              </div>

              <div className="flex items-center justify-between py-3.5">
                <div className="space-y-0.5 max-w-lg">
                  <span className="font-semibold text-foreground block">
                    System Security & New Device Logins
                  </span>
                  <span className="text-muted-foreground text-[11.5px] block">
                    Receive verification alerts when an administrator session is initiated from a new IP address or device.
                  </span>
                </div>
                <Switch
                  checked={preferences.newLoginAlerts}
                  onCheckedChange={(c) =>
                    setPreferences((prev) => ({ ...prev, newLoginAlerts: c }))
                  }
                />
              </div>

              <div className="flex items-center justify-between py-3.5">
                <div className="space-y-0.5 max-w-lg">
                  <span className="font-semibold text-foreground block">
                    Daily Morning Executive Briefing
                  </span>
                  <span className="text-muted-foreground text-[11.5px] block">
                    Automated 07:30 AM email with attendance averages, fee collection targets, and staff leaves.
                  </span>
                </div>
                <Switch
                  checked={preferences.dailyBrief}
                  onCheckedChange={(c) =>
                    setPreferences((prev) => ({ ...prev, dailyBrief: c }))
                  }
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border/60 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Preferences are synced with your cloud administrator profile.
              </span>
              <Button
                type="button"
                size="sm"
                onClick={handleSavePreferences}
                className="bg-brand text-cream hover:bg-brand-600 text-xs font-semibold cursor-pointer shadow-sm"
              >
                <Save className="size-3.5 mr-1.5" />
                Save Preferences
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
