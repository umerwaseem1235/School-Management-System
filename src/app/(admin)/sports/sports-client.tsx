"use client";

import * as React from "react";
import { CalendarDays, Check, ChevronDown, Clock3, MapPin, Plus, Search, Trophy, Users, Volleyball } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Fixture = { id: number; sport: string; opponent: string; date: string; time: string; venue: string; team: string; status: "Upcoming" | "Completed"; score?: string };
const initialFixtures: Fixture[] = [
  { id: 1, sport: "Basketball", opponent: "Northfield Academy", date: "2026-09-18", time: "10:30 AM", venue: "Main Sports Hall", team: "U-16 Boys", status: "Upcoming" },
  { id: 2, sport: "Football", opponent: "Crescent Grammar", date: "2026-09-20", time: "02:00 PM", venue: "West Field", team: "U-18 Boys", status: "Upcoming" },
  { id: 3, sport: "Volleyball", opponent: "Beaconhouse Central", date: "2026-09-12", time: "11:00 AM", venue: "Main Sports Hall", team: "U-16 Girls", status: "Completed", score: "2–1" },
  { id: 4, sport: "Athletics", opponent: "Inter-campus meet", date: "2026-09-24", time: "08:00 AM", venue: "Athletics Track", team: "Senior Squad", status: "Upcoming" },
];
const teams = [
  { name: "Falcons", sport: "Basketball", group: "U-16 Boys", coach: "Faisal Mehmood", players: 14, color: "bg-orange-100 text-orange-700" },
  { name: "Eagles", sport: "Football", group: "U-18 Boys", coach: "Usman Raza", players: 18, color: "bg-sky-100 text-sky-700" },
  { name: "Aces", sport: "Volleyball", group: "U-16 Girls", coach: "Sara Ahmed", players: 12, color: "bg-violet-100 text-violet-700" },
];

export function SportsClient() {
  const [fixtures, setFixtures] = React.useState(initialFixtures);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("All fixtures");
  const [modal, setModal] = React.useState(false);
  const [form, setForm] = React.useState({ sport: "Football", opponent: "", date: "", time: "", venue: "", team: "U-16 Boys" });
  const filtered = fixtures.filter((f) => `${f.sport} ${f.opponent} ${f.team}`.toLowerCase().includes(search.toLowerCase()) && (filter === "All fixtures" || f.status === filter));
  function addFixture(e: React.FormEvent) {
    e.preventDefault();
    if (!form.opponent || !form.date || !form.venue) return;
    setFixtures((items) => [{ ...form, id: Date.now(), status: "Upcoming" }, ...items]);
    setModal(false); setForm({ sport: "Football", opponent: "", date: "", time: "", venue: "", team: "U-16 Boys" });
    toast.success("Fixture scheduled successfully");
  }
  return <>
    <PageHeader title="Sports" actions={<Button onClick={() => setModal(true)}><Plus className="size-4" /> Schedule fixture</Button>} />
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#102b50] via-[#173d69] to-[#245b78] px-6 py-7 text-white shadow-lg md:px-8">
        <div className="absolute -right-10 -top-24 size-72 rounded-full border border-white/10" /><div className="absolute -right-1 top-0 size-48 rounded-full border border-white/10" />
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white/80"><Trophy className="size-3.5" /> ATHLETICS · AY 2026–27</div><h2 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">Every season starts with a team.</h2><p className="mt-2 max-w-xl text-sm leading-relaxed text-blue-100/80">A single workspace for teams, fixtures, coaching and the achievements that bring our campus together.</p></div><div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"><div className="grid size-11 place-items-center rounded-lg bg-white/15"><Trophy className="size-5" /></div><div><p className="text-xs text-blue-100/70">Next match</p><p className="mt-0.5 font-semibold">Falcons vs Northfield</p><p className="text-xs text-blue-100/70">Sep 18 · 10:30 AM</p></div></div></div>
      </section>
      <StatGrid>
        <StatCard label="Active teams" value="12" icon={Users} />
        <StatCard label="Registered athletes" value="186" icon={Volleyball} />
        <StatCard label="Upcoming fixtures" value={fixtures.filter(f => f.status === "Upcoming").length} icon={CalendarDays} />
        <StatCard label="Medals this year" value="24" icon={Trophy} />
      </StatGrid>
      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <SectionCard title="Fixtures & tournaments" description="Your upcoming schedule and recent results" action={<button onClick={() => setFilter(filter === "All fixtures" ? "Upcoming" : "All fixtures")} className="inline-flex items-center gap-1 text-xs font-semibold text-primary">{filter}<ChevronDown className="size-3.5" /></button>}>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search fixtures, teams…" className="pl-9" /></div><button onClick={() => setFilter(filter === "Completed" ? "All fixtures" : "Completed")} className="rounded-md border px-3 text-xs font-medium text-muted-foreground hover:bg-muted">{filter === "Completed" ? "Show all" : "Recent results"}</button></div>
          <div className="space-y-2">{filtered.map(f => <article key={f.id} className="flex flex-col gap-3 rounded-xl border border-border/70 p-3.5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center"><div className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand"><Trophy className="size-4" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold">{f.team}</h3><span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{f.sport}</span></div><p className="mt-1 truncate text-xs text-muted-foreground">vs {f.opponent} · {f.venue}</p></div><div className="flex items-center gap-3 text-xs text-muted-foreground sm:text-right"><div><p className="font-semibold text-foreground">{new Date(`${f.date}T12:00:00`).toLocaleDateString("en", { month: "short", day: "numeric" })}</p><p className="mt-1">{f.time}</p></div><span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold", f.status === "Upcoming" ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700")}>{f.score ?? f.status}</span></div></article>)}{filtered.length === 0 && <div className="py-12 text-center text-sm text-muted-foreground">No fixtures match your search.</div>}</div>
        </SectionCard>
        <SectionCard title="Teams & rosters" description="Squads competing this season" action={<button onClick={() => toast.info("Team management is ready to configure.")} className="text-xs font-semibold text-primary">View all</button>}>
          <div className="space-y-3">{teams.map(team => <div key={team.name} className="flex items-center gap-3 rounded-xl border border-border/70 p-3"><div className={cn("grid size-10 shrink-0 place-items-center rounded-xl text-sm font-bold", team.color)}>{team.name[0]}</div><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{team.name}<span className="ml-2 text-xs font-normal text-muted-foreground">{team.sport}</span></p><p className="mt-1 truncate text-xs text-muted-foreground">{team.group} · Coach {team.coach}</p></div><div className="text-right"><p className="text-sm font-bold tabular-nums">{team.players}</p><p className="text-[10px] text-muted-foreground">players</p></div></div>)}</div>
          <div className="mt-4 rounded-xl bg-brand-50/70 p-3.5"><div className="flex items-center gap-2 text-xs font-semibold text-brand"><Clock3 className="size-4" /> Today’s coaching</div><p className="mt-2 text-sm font-semibold">Athletics · Senior Squad</p><p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 className="size-3.5" /> 03:30 PM <MapPin className="ml-2 size-3.5" /> Athletics Track</p></div>
        </SectionCard>
      </div>
      <SectionCard title="Season highlights" description="Recognising our student athletes"><div className="grid gap-3 md:grid-cols-3">{[{ label: "Inter-school Championship", detail: "Basketball · U-16 Boys", award: "Gold medal", color: "text-amber-700 bg-amber-50" }, { label: "City Athletics Meet", detail: "Track & field · Senior", award: "8 podium finishes", color: "text-sky-700 bg-sky-50" }, { label: "Regional Volleyball Cup", detail: "Volleyball · U-16 Girls", award: "Runners-up", color: "text-violet-700 bg-violet-50" }].map(item => <div key={item.label} className="rounded-xl border border-border/70 p-4"><div className={cn("mb-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold", item.color)}><Trophy className="mr-1.5 size-3" />{item.award}</div><p className="text-sm font-semibold">{item.label}</p><p className="mt-1 text-xs text-muted-foreground">{item.detail}</p></div>)}</div></SectionCard>
    </div>
    {modal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={e => { if (e.target === e.currentTarget) setModal(false); }}><form onSubmit={addFixture} className="w-full max-w-lg rounded-2xl bg-background p-6 shadow-2xl"><div className="mb-5 flex items-start justify-between"><div><h2 className="text-lg font-bold">Schedule a fixture</h2><p className="mt-1 text-sm text-muted-foreground">Add a match to the sports calendar.</p></div><button type="button" onClick={() => setModal(false)} aria-label="Close" className="text-xl text-muted-foreground">×</button></div><div className="grid gap-4 sm:grid-cols-2">{([["Sport", "sport", "Football"], ["Team / squad", "team", "U-16 Boys"], ["Opponent", "opponent", "Opponent school"], ["Venue", "venue", "Match venue"]] as const).map(([label, key, placeholder]) => <label key={key} className="space-y-1.5 text-xs font-semibold">{label}<Input required={key === "opponent" || key === "venue"} placeholder={placeholder} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} /></label>)}<label className="space-y-1.5 text-xs font-semibold">Date<Input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></label><label className="space-y-1.5 text-xs font-semibold">Start time<Input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} /></label></div><div className="mt-6 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setModal(false)}>Cancel</Button><Button type="submit"><Check className="size-4" /> Save fixture</Button></div></form></div>}
  </>;
}
