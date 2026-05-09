import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, CloudRain, Wallet, AlertTriangle, AlertCircle,
  ArrowUp, ArrowRight, Sun, Moon, X, ChevronDown, ChevronUp,
  TrendingUp, RefreshCw, MapPin, Plus, Loader2,
  Star, Gift, Zap, Heart, Activity
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/components/ThemeProvider";

const FONT_DISPLAY = "'Space Grotesk', sans-serif";
const FONT_PLAYFAIR = "'Playfair Display', serif";
const FONT_MONO = "'DM Mono', monospace";

// ── Types ──────────────────────────────────────────────────────────────────
type ForecastProduct = {
  id: number; product: string; baseNum: number; unit: string;
  responsive: boolean; risk?: string; expiry?: string; isNew?: boolean; stock?: number;
};
type ForecastRow = ForecastProduct & { base: string; final: string; finalNum: number; change: string; };
type DynamicSignal = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  name: string; desc: string; multiplier: number;
  color: string; bg: string; barColor: string;
  detail: string; urgency: "critical" | "high" | "medium" | "low"; daysAway: number;
};

// ── Color Palettes ─────────────────────────────────────────────────────────
const HUE: Record<string, { color: string; bg: string; bar: string }> = {
  rose:    { color: "text-rose-500 dark:text-rose-400",       bg: "bg-rose-50 dark:bg-rose-500/15",       bar: "#f43f5e" },
  orange:  { color: "text-orange-500 dark:text-orange-400",   bg: "bg-orange-50 dark:bg-orange-500/15",   bar: "#f97316" },
  amber:   { color: "text-amber-500 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-500/15",     bar: "#f59e0b" },
  yellow:  { color: "text-yellow-500 dark:text-yellow-400",   bg: "bg-yellow-50 dark:bg-yellow-500/15",   bar: "#eab308" },
  green:   { color: "text-green-500 dark:text-green-400",     bg: "bg-green-50 dark:bg-green-500/15",     bar: "#22c55e" },
  emerald: { color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/15", bar: "#10b981" },
  sky:     { color: "text-sky-500 dark:text-sky-400",         bg: "bg-sky-50 dark:bg-sky-500/15",         bar: "#0ea5e9" },
  blue:    { color: "text-blue-500 dark:text-blue-400",       bg: "bg-blue-50 dark:bg-blue-500/15",       bar: "#3b82f6" },
  indigo:  { color: "text-indigo-500 dark:text-indigo-400",   bg: "bg-indigo-50 dark:bg-indigo-500/15",   bar: "#6366f1" },
  violet:  { color: "text-violet-500 dark:text-violet-400",   bg: "bg-violet-50 dark:bg-violet-500/15",   bar: "#8b5cf6" },
  pink:    { color: "text-pink-500 dark:text-pink-400",       bg: "bg-pink-50 dark:bg-pink-500/15",       bar: "#ec4899" },
};

// ── Festival Database ──────────────────────────────────────────────────────
type FestivalDef = {
  name: string; iconKey: string; year: number; month: number; day: number;
  mult: number; hue: keyof typeof HUE; detail: string;
};
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Flame, Sun, Zap, Star, Gift, Heart, Moon, CloudRain, Wallet, TrendingUp,
};

const FESTIVALS: FestivalDef[] = [
  { name: "Navratri",         iconKey: "Flame", year: 2025, month: 9,  day: 2,  mult: 1.30, hue: "rose",    detail: "Nine nights of Navratri spike demand for fruits, dairy, and sweets." },
  { name: "Diwali",           iconKey: "Flame", year: 2025, month: 9,  day: 20, mult: 1.70, hue: "orange",  detail: "Diwali is the biggest demand driver — 40–70% uplift across sweets, oil, and gift items." },
  { name: "Chhath Puja",      iconKey: "Sun",   year: 2025, month: 9,  day: 28, mult: 1.20, hue: "yellow",  detail: "Chhath drives demand for fruits, sugarcane, and ghee." },
  { name: "Christmas",        iconKey: "Gift",  year: 2025, month: 11, day: 25, mult: 1.20, hue: "green",   detail: "Christmas boosts bakery items, confectionery, and beverages." },
  { name: "New Year",         iconKey: "Zap",   year: 2026, month: 0,  day: 1,  mult: 1.20, hue: "sky",     detail: "New Year surge for snacks, beverages, and party items." },
  { name: "Makar Sankranti",  iconKey: "Sun",   year: 2026, month: 0,  day: 14, mult: 1.20, hue: "yellow",  detail: "Sankranti boosts til, jaggery, and seasonal sweets." },
  { name: "Republic Day",     iconKey: "Star",  year: 2026, month: 0,  day: 26, mult: 1.10, hue: "blue",    detail: "Holiday footfall — higher demand for snacks and ready-to-eat." },
  { name: "Valentine's Day",  iconKey: "Heart", year: 2026, month: 1,  day: 14, mult: 1.12, hue: "rose",    detail: "Gifting demand for chocolates, sweets, and packaged foods." },
  { name: "Maha Shivaratri",  iconKey: "Moon",  year: 2026, month: 1,  day: 18, mult: 1.22, hue: "indigo",  detail: "Fasting demand: fruits, milk, sabudana, and dry fruits spike sharply." },
  { name: "Holi",             iconKey: "Zap",   year: 2026, month: 2,  day: 14, mult: 1.45, hue: "pink",    detail: "Holi drives beverages, cold drinks, snacks, and sweets." },
  { name: "Eid al-Fitr",      iconKey: "Star",  year: 2026, month: 2,  day: 20, mult: 1.40, hue: "emerald", detail: "Eid drives high demand for biryani ingredients, sweets, and dry fruits." },
  { name: "Ram Navami",       iconKey: "Sun",   year: 2026, month: 3,  day: 26, mult: 1.20, hue: "orange",  detail: "Fasting day boosts demand for fruits, paneer, and sabudana." },
  { name: "Eid al-Adha",      iconKey: "Star",  year: 2026, month: 4,  day: 27, mult: 1.35, hue: "emerald", detail: "Bakrid drives demand for rice, spices, and cooking oils." },
  { name: "Rath Yatra",       iconKey: "Sun",   year: 2026, month: 5,  day: 23, mult: 1.15, hue: "yellow",  detail: "Festive snacks and coconuts see a demand rise." },
  { name: "Independence Day", iconKey: "Star",  year: 2026, month: 7,  day: 15, mult: 1.15, hue: "orange",  detail: "Holiday boost — snacks and ready-to-eat meals." },
  { name: "Navratri",         iconKey: "Flame", year: 2026, month: 9,  day: 20, mult: 1.30, hue: "rose",    detail: "Nine nights of Navratri boost fruits, dairy, and sweets." },
  { name: "Diwali",           iconKey: "Flame", year: 2026, month: 10, day: 7,  mult: 1.70, hue: "orange",  detail: "Diwali is the biggest demand driver — 40–70% uplift across sweets, oil, and gift items." },
  { name: "Christmas",        iconKey: "Gift",  year: 2026, month: 11, day: 25, mult: 1.20, hue: "green",   detail: "Christmas boosts bakery items, confectionery, and beverages." },
  { name: "New Year",         iconKey: "Zap",   year: 2027, month: 0,  day: 1,  mult: 1.20, hue: "sky",     detail: "New Year surge for snacks, beverages, and party items." },
];

function getUpcomingFestivals(now: Date, windowDays: number, maxCount: number) {
  const results: Array<FestivalDef & { daysAway: number }> = [];
  for (const f of FESTIVALS) {
    const fDate = new Date(f.year, f.month, f.day);
    const diff = Math.round((fDate.getTime() - now.getTime()) / 86_400_000);
    if (diff >= 0 && diff <= windowDays) results.push({ ...f, daysAway: diff });
  }
  results.sort((a, b) => a.daysAway - b.daysAway);
  return results.slice(0, maxCount);
}

function computeActiveSignals(now: Date): DynamicSignal[] {
  const month = now.getMonth();
  const day   = now.getDate();
  const wd    = now.getDay(); // 0=Sun … 6=Sat
  const active: DynamicSignal[] = [];

  // Festival proximity ≤21 days
  const [nextFest] = getUpcomingFestivals(now, 21, 1);
  if (nextFest) {
    const { color, bg, bar } = HUE[nextFest.hue];
    active.push({
      id: "festival", icon: ICON_MAP[nextFest.iconKey],
      name: nextFest.name,
      desc: nextFest.daysAway === 0 ? "Today!" : nextFest.daysAway === 1 ? "Tomorrow" : `${nextFest.daysAway} days away`,
      multiplier: nextFest.mult, color, bg, barColor: bar,
      detail: nextFest.detail,
      urgency: nextFest.daysAway <= 3 ? "critical" : nextFest.daysAway <= 7 ? "high" : "medium",
      daysAway: nextFest.daysAway,
    });
  }

  // Salary week (1st–7th)
  if (day <= 7) {
    active.push({
      id: "salary", icon: Wallet, name: "Salary Week", desc: `Post-salary · day ${day}`,
      multiplier: 1.25, ...HUE.violet, barColor: HUE.violet.bar,
      detail: "First 7 days post-salary see a 25% demand surge across all FMCG categories.",
      urgency: "medium", daysAway: 0,
    });
  }

  // Pre-salary stock-up (25th–31st)
  if (day >= 25) {
    active.push({
      id: "presalary", icon: Wallet, name: "Pre-Salary Surge", desc: "Month-end stock-up",
      multiplier: 1.10, ...HUE.indigo, barColor: HUE.indigo.bar,
      detail: "Families stock up on essentials ahead of month-end salary credit.",
      urgency: "low", daysAway: 0,
    });
  }

  // Weekend
  if (wd === 5 || wd === 6) {
    active.push({
      id: "weekend", icon: Sun,
      name: wd === 6 ? "Saturday Rush" : "Friday Surge",
      desc: wd === 6 ? "Peak shopping day" : "Evening demand spike",
      multiplier: wd === 6 ? 1.22 : 1.15, ...HUE.amber, barColor: HUE.amber.bar,
      detail: "Weekends see 15–22% higher footfall and larger basket sizes.",
      urgency: "medium", daysAway: 0,
    });
  }

  // Monsoon (Jun–Sep)
  if (month >= 5 && month <= 8) {
    const m = ["Jun","Jul","Aug","Sep"][month - 5];
    active.push({
      id: "monsoon", icon: CloudRain, name: "Monsoon Season", desc: `${m} — active`,
      multiplier: 1.18, ...HUE.sky, barColor: HUE.sky.bar,
      detail: "Monsoon boosts home consumption — staples, packaged goods, and comfort foods surge.",
      urgency: "low", daysAway: 0,
    });
  }

  // Summer (Mar–May)
  if (month >= 2 && month <= 4) {
    const m = ["March","April","May"][month - 2];
    active.push({
      id: "summer", icon: Sun, name: "Summer Season", desc: `${m} heat shift`,
      multiplier: 1.15, ...HUE.orange, barColor: HUE.orange.bar,
      detail: "Summer shifts demand to cold drinks, dairy, ice cream, and packaged snacks.",
      urgency: "low", daysAway: 0,
    });
  }

  // Winter (Nov–Jan)
  if (month >= 10 || month === 0) {
    const m = month === 0 ? "January" : month === 10 ? "November" : "December";
    active.push({
      id: "winter", icon: Moon, name: "Winter Season", desc: `${m} warming boost`,
      multiplier: 1.12, ...HUE.blue, barColor: HUE.blue.bar,
      detail: "Winter drives demand for ghee, dry fruits, warm beverages, and root vegetables.",
      urgency: "low", daysAway: 0,
    });
  }

  if (active.length === 0) {
    active.push({
      id: "baseline", icon: TrendingUp, name: "Steady Demand", desc: "No major events this week",
      multiplier: 1.0, color: "text-muted-foreground", bg: "bg-muted", barColor: "#9ca3af",
      detail: "No special demand drivers detected. Standard forecast applies.",
      urgency: "low", daysAway: 0,
    });
  }

  return active;
}

// ── Product Data ───────────────────────────────────────────────────────────
const BASE_PRODUCTS: ForecastProduct[] = [
  { id: 1, product: "Sugar",      baseNum: 20, unit: "kg",    responsive: true,  stock: 30 },
  { id: 2, product: "Ghee",       baseNum: 4,  unit: "kg",    responsive: true,  stock: 12 },
  { id: 3, product: "Rice",       baseNum: 15, unit: "kg",    responsive: true,  risk: "High Risk", stock: 8 },
  { id: 4, product: "Bread",      baseNum: 10, unit: "packs", responsive: false, expiry: "Expiry" },
  { id: 5, product: "Dry Fruits", baseNum: 4,  unit: "kg",    responsive: true,  isNew: true },
  { id: 6, product: "Atta",       baseNum: 25, unit: "kg",    responsive: true,  stock: 55 },
];

function computeRows(products: ForecastProduct[], combinedMult: number): ForecastRow[] {
  return products.map((p) => {
    const finalNum = p.responsive && p.baseNum > 0
      ? Math.round(p.baseNum * combinedMult)
      : p.baseNum;
    return {
      ...p,
      base:     `${p.baseNum} ${p.unit}`,
      final:    `${finalNum} ${p.unit}`,
      finalNum,
      change:   !p.responsive ? "neutral"
              : finalNum > p.baseNum ? "up"
              : finalNum < p.baseNum ? "down"
              : "neutral",
    };
  });
}

// ── Hooks ──────────────────────────────────────────────────────────────────
function useLiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(target);
  const prev = useRef(target);
  const frame = useRef(0);
  useEffect(() => {
    if (prev.current === target) return;
    const start = prev.current;
    prev.current = target;
    let t0: number | null = null;
    const animate = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(start + (target - start) * ease));
      if (p < 1) frame.current = requestAnimationFrame(animate);
      else setValue(target);
    };
    frame.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);
  return value;
}

function AnimatedNumber({ value, unit }: { value: number; unit: string }) {
  const v = useCountUp(value);
  return <span style={{ fontFamily: FONT_MONO }}>{v} {unit}</span>;
}

// ── Signal Card ─────────────────────────────────────────────────────────────
function SignalCard({ signal }: { signal: DynamicSignal }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = signal.icon;
  const barPct = Math.min(((signal.multiplier - 1) / 0.8) * 100, 100);

  return (
    <motion.div layout transition={{ duration: 0.22 }}>
      <Card
        className={`border-border shadow-sm cursor-pointer select-none transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] overflow-hidden ${
          signal.urgency === "critical"
            ? "ring-2 ring-rose-400/60 dark:ring-rose-500/50"
            : signal.urgency === "high"
            ? "ring-1 ring-amber-400/60 dark:ring-amber-500/50"
            : ""
        }`}
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="p-3.5">
          <div className="flex items-start gap-3">
            <div className={`relative mt-0.5 p-2 rounded-lg ${signal.bg} ${signal.color} shrink-0`}>
              <Icon className="w-4 h-4" />
              {(signal.urgency === "critical" || signal.urgency === "high") && (
                <span
                  className={`absolute -top-1 -right-1 w-2 h-2 rounded-full border border-background ${
                    signal.urgency === "critical" ? "bg-rose-500 animate-pulse" : "bg-amber-400"
                  }`}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-sm truncate" style={{ fontFamily: FONT_DISPLAY }}>
                  {signal.name}
                </h3>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 h-4"
                    style={{ fontFamily: FONT_MONO }}
                  >
                    ×{signal.multiplier}
                  </Badge>
                  <span
                    className={`transition-transform duration-200 ${signal.color} inline-block ${expanded ? "rotate-180" : ""}`}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: FONT_DISPLAY }}>
                {signal.desc}
              </p>
            </div>
          </div>

          {/* Demand impact bar */}
          <div className="mt-2.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground" style={{ fontFamily: FONT_DISPLAY }}>
                Demand impact
              </span>
              <span
                className="text-[10px] font-bold"
                style={{ fontFamily: FONT_MONO, color: signal.barColor }}
              >
                +{Math.round((signal.multiplier - 1) * 100)}%
              </span>
            </div>
            <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: signal.barColor }}
                initial={{ width: 0 }}
                animate={{ width: `${barPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              />
            </div>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border leading-relaxed"
                  style={{ fontFamily: FONT_DISPLAY }}>
                  {signal.detail}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}

// ── Demand Pulse Meter ──────────────────────────────────────────────────────
function DemandMeter({ combined, count }: { combined: number; count: number }) {
  const maxMult = 2.5;
  const pct   = Math.min(Math.max((combined - 1) / (maxMult - 1), 0), 1);
  const BARS  = 12;
  const label = pct < 0.15 ? "Baseline" : pct < 0.35 ? "Moderate" : pct < 0.6 ? "Elevated" : pct < 0.82 ? "High" : "Peak";
  const labelColor = pct < 0.15 ? "#9ca3af" : pct < 0.35 ? "#10b981" : pct < 0.6 ? "#f59e0b" : pct < 0.82 ? "#f97316" : "#ef4444";

  return (
    <div className="p-3 rounded-xl bg-primary/6 border border-primary/12">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary" style={{ fontFamily: FONT_DISPLAY }}>
            Demand Pulse
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground" style={{ fontFamily: FONT_DISPLAY }}>
          {count} signal{count !== 1 ? "s" : ""} live
        </span>
      </div>

      <div className="flex items-end justify-center gap-[3px] h-10 my-2 px-1">
        {Array.from({ length: BARS }, (_, i) => {
          const threshold = (i + 1) / BARS;
          const lit = pct >= threshold;
          const h = 30 + (i / (BARS - 1)) * 70;
          const r = i / (BARS - 1);
          const barColor = r < 0.45 ? "#10b981" : r < 0.72 ? "#f59e0b" : "#ef4444";
          return (
            <motion.div
              key={i}
              className="flex-1 rounded-[2px]"
              style={{ height: `${h}%`, backgroundColor: lit ? barColor : "rgb(0 0 0 / 0.08)" }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: lit ? 1 : 0.25, opacity: lit ? 1 : 0.28 }}
              transition={{ delay: i * 0.03, duration: 0.45, ease: "easeOut" }}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold" style={{ color: labelColor, fontFamily: FONT_DISPLAY }}>
          {label}
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-bold text-foreground" style={{ fontFamily: FONT_MONO }}>
            ×{combined.toFixed(2)}
          </span>
          <span className="text-[10px] text-muted-foreground">combined</span>
        </div>
      </div>
    </div>
  );
}

// ── Upcoming Events ─────────────────────────────────────────────────────────
function UpcomingEvents({ now }: { now: Date }) {
  const events = getUpcomingFestivals(now, 90, 3);
  if (events.length === 0) return null;
  return (
    <div>
      <h2
        className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2"
        style={{ fontFamily: FONT_DISPLAY, letterSpacing: "0.1em" }}
      >
        Upcoming Events
      </h2>
      <div className="space-y-1.5">
        {events.map((f) => {
          const { color, bg, bar } = HUE[f.hue];
          const Icon = ICON_MAP[f.iconKey];
          return (
            <div
              key={`${f.name}-${f.year}-${f.month}`}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-border bg-background/40"
            >
              <div className={`p-1.5 rounded-md ${bg} ${color} shrink-0`}>
                <Icon className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ fontFamily: FONT_DISPLAY }}>{f.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {f.daysAway === 0 ? "Today!" : f.daysAway === 1 ? "Tomorrow" : `in ${f.daysAway} days`}
                </p>
              </div>
              <span
                className="text-[10px] font-bold shrink-0 px-1.5 py-0.5 rounded"
                style={{ fontFamily: FONT_MONO, color: bar, background: `${bar}1a` }}
              >
                ×{f.mult}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Alert Card ──────────────────────────────────────────────────────────────
function AlertCard({ variant, icon: Icon, title, message, color }: {
  variant: "warn" | "danger"; icon: React.ComponentType<{ className?: string }>;
  title: string; message: string; color: string;
}) {
  const [dismissed, setDismissed] = useState(false);
  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: 80, scale: 0.92 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          className={`flex-1 rounded-xl p-3 flex items-start gap-3 border relative overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
            variant === "warn"
              ? "bg-orange-50/80 border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/25"
              : "bg-rose-50/80 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/25"
          }`}
        >
          <div className={`shrink-0 mt-0.5 p-1.5 rounded-lg ${
            variant === "warn" ? "bg-orange-100 dark:bg-orange-500/20" : "bg-rose-100 dark:bg-rose-500/20"
          }`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-semibold ${color}`} style={{ fontFamily: FONT_DISPLAY }}>{title}</h4>
            <p className={`text-xs mt-0.5 leading-relaxed opacity-80 ${color}`} style={{ fontFamily: FONT_DISPLAY }}>{message}</p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 p-1 rounded-md opacity-50 hover:opacity-100 transition-opacity"
            aria-label="Dismiss alert"
          >
            <X className={`w-3.5 h-3.5 ${color}`} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Dynamic Background ──────────────────────────────────────────────────────
const MARKET_SHAPES = [
  { id: "cart",   viewBox: "0 0 24 24", d: "M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6M10 17a1 1 0 1 0 2 0 1 1 0 0 0-2 0M16 17a1 1 0 1 0 2 0 1 1 0 0 0-2 0", size: 58, top: "14%", left: "7%",   ax: [0, 22, 6, 0],   ay: [0, 14, -4, 0],  dur: 28, rot: -10 },
  { id: "tag",    viewBox: "0 0 24 24", d: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01",                                                  size: 48, top: "52%", right: "8%",  ax: [0, -18, -4, 0], ay: [0, 22, 6, 0],   dur: 34, rot: 14  },
  { id: "scale",  viewBox: "0 0 24 24", d: "M12 3v18M7 7l5 2 5-2M3 17l4-4 2 3 3-4 2 3 4-4M7 21h10",                                                                                    size: 54, bottom: "26%", left: "52%", ax: [0, 12, -6, 0], ay: [0, -16, -2, 0], dur: 30, rot: 6   },
  { id: "leaf",   viewBox: "0 0 24 24", d: "M17 8C17 8 8 4 3 9C3 9 4 19 12 21C20 19 21 9 17 8ZM12 21V12",                                                                               size: 44, top: "36%", left: "38%",  ax: [0, 16, 4, 0],   ay: [0, 20, -2, 0],  dur: 37, rot: -18 },
  { id: "coin",   viewBox: "0 0 24 24", d: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM8.5 9h7M8.5 13H14M14 13L10.5 18M11 9a3 3 0 0 1 0 4",                                              size: 50, bottom: "28%", right: "20%", ax: [0, -14, 4, 0], ay: [0, -18, 8, 0],  dur: 40, rot: 0   },
  { id: "basket", viewBox: "0 0 24 24", d: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0",                                                           size: 52, top: "68%", left: "18%",  ax: [0, 10, -8, 0],  ay: [0, -12, 4, 0],  dur: 32, rot: 8   },
];

function DynamicBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const baseFill    = isDark ? "hsl(220,28%,12%)" : "hsl(210,40%,97%)";
  const shapeStroke = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.07)";

  const orbs = [
    { color: isDark ? "rgba(20,184,166,0.55)"  : "rgba(13,148,136,0.50)",   top: "0%",   left: "5%",   w: 560, ax: [0,60,10,0],   ay: [0,40,-10,0],  dur: 13 },
    { color: isDark ? "rgba(139,92,246,0.50)"  : "rgba(109,40,217,0.44)",   top: "22%",  right: "3%",  w: 500, ax: [0,-55,-10,0], ay: [0,50,10,0],   dur: 17, delay: 3 },
    { color: isDark ? "rgba(251,146,60,0.45)"  : "rgba(234,88,12,0.42)",    bottom: "4%",left: "30%",  w: 460, ax: [0,45,-5,0],   ay: [0,-45,5,0],   dur: 15, delay: 6 },
    { color: isDark ? "rgba(52,211,153,0.38)"  : "rgba(16,185,129,0.35)",   bottom: "8%",left: "-4%",  w: 380, ax: [0,35,5,0],    ay: [0,-30,-5,0],  dur: 20, delay: 9 },
  ];

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, backgroundColor: baseFill, pointerEvents: "none" }} aria-hidden />
      <div style={{ position: "fixed", inset: 0, zIndex: 1, overflow: "hidden", pointerEvents: "none" }} aria-hidden>
        {orbs.map((orb, i) => (
          <motion.div key={i} style={{
            position: "absolute", borderRadius: "50%", filter: "blur(72px)",
            width: orb.w, height: orb.w,
            top: (orb as any).top, bottom: (orb as any).bottom,
            left: (orb as any).left, right: (orb as any).right,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
          }}
            animate={{ x: orb.ax, y: orb.ay }}
            transition={{ duration: orb.dur, repeat: Infinity, ease: "easeInOut", delay: (orb as any).delay ?? 0, times: [0, 0.33, 0.66, 1] }}
          />
        ))}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: isDark ? 0.07 : 0.055 }}>
          <defs><pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.3" fill="currentColor" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
        {MARKET_SHAPES.map((shape) => (
          <motion.div key={shape.id} style={{
            position: "absolute", top: (shape as any).top, bottom: (shape as any).bottom,
            left: (shape as any).left, right: (shape as any).right, rotate: shape.rot,
          }}
            animate={{ x: shape.ax, y: shape.ay, rotate: [shape.rot, shape.rot + 4, shape.rot - 3, shape.rot] }}
            transition={{ duration: shape.dur, repeat: Infinity, ease: "easeInOut", times: [0, 0.33, 0.66, 1] }}
          >
            <svg width={shape.size} height={shape.size} viewBox={shape.viewBox} fill="none"
              stroke={shapeStroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d={shape.d} />
            </svg>
          </motion.div>
        ))}
      </div>
    </>
  );
}

// ── Stock Cell ─────────────────────────────────────────────────────────────
function StockCell({ row, onUpdate }: {
  row: ForecastRow;
  onUpdate: (id: number, stock: number | undefined) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(row.stock !== undefined ? String(row.stock) : "");
  const inputRef              = useRef<HTMLInputElement>(null);

  const commit = () => {
    const v = draft.trim();
    onUpdate(row.id, v === "" ? undefined : Math.max(0, parseFloat(v) || 0));
    setEditing(false);
  };

  const s       = row.stock;
  const needed  = row.finalNum;
  const pct     = s !== undefined && needed > 0 ? Math.round((s / needed) * 100) : null;
  const cls     = s === undefined ? "text-muted-foreground"
                : s < needed * 0.5 ? "text-rose-600 dark:text-rose-400"
                : s < needed       ? "text-amber-600 dark:text-amber-400"
                :                    "text-emerald-600 dark:text-emerald-400";

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  if (editing) return (
    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
      <Input ref={inputRef} type="number" min="0" value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
        className="h-7 w-20 text-xs text-right px-2" style={{ fontFamily: FONT_MONO }} placeholder="0"
      />
      <span className="text-[10px] text-muted-foreground">{row.unit}</span>
    </div>
  );

  return (
    <button
      className="group flex items-center justify-end gap-1.5 w-full hover:opacity-80 transition-opacity"
      onClick={(e) => { e.stopPropagation(); setDraft(s !== undefined ? String(s) : ""); setEditing(true); }}
      title="Click to edit stock"
    >
      {s !== undefined ? (
        <span className={`text-sm font-medium ${cls}`} style={{ fontFamily: FONT_MONO }}>{s} {row.unit}</span>
      ) : (
        <span className="text-xs text-muted-foreground/50 italic">add stock</span>
      )}
      {pct !== null && (
        <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${
          s! < needed * 0.5
            ? "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
            : s! < needed
            ? "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
            : "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
        }`} style={{ fontFamily: FONT_MONO }}>{pct}%</span>
      )}
      <span className="opacity-0 group-hover:opacity-50 transition-opacity">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
        </svg>
      </span>
    </button>
  );
}

// ── Add Product Modal ───────────────────────────────────────────────────────
function AddProductModal({ open, onClose, onAdd, combinedMult }: {
  open: boolean; onClose: () => void;
  onAdd: (p: ForecastProduct) => void;
  combinedMult: number;
}) {
  const [name,     setName]     = useState("");
  const [baseQty,  setBaseQty]  = useState("");
  const [stockQty, setStockQty] = useState("");
  const [unit,     setUnit]     = useState("kg");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !baseQty) return;
    const base = parseFloat(baseQty);
    const stock = stockQty.trim() !== "" ? Math.max(0, parseFloat(stockQty) || 0) : undefined;
    onAdd({ id: Date.now(), product: name.trim(), baseNum: base, unit, responsive: true, isNew: true, stock });
    setName(""); setBaseQty(""); setStockQty(""); setUnit("kg"); onClose();
  };

  const forecastNum = baseQty && parseFloat(baseQty) > 0
    ? Math.round(parseFloat(baseQty) * combinedMult) : null;
  const stockNum = stockQty.trim() !== "" ? parseFloat(stockQty) : null;
  const coverPct = forecastNum && stockNum !== null ? Math.round((stockNum / forecastNum) * 100) : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: FONT_PLAYFAIR, fontSize: "1.2rem" }}>Add Product</DialogTitle>
          <DialogDescription className="text-xs" style={{ fontFamily: FONT_DISPLAY }}>
            Add a new item — forecast applies all active signal multipliers (×{combinedMult.toFixed(2)}).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="p-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: FONT_DISPLAY }}>
              Product Name
            </Label>
            <Input id="p-name" placeholder="e.g. Mustard Oil" value={name} onChange={(e) => setName(e.target.value)} autoFocus className="h-9" />
          </div>

          <div className="flex gap-3">
            <div className="space-y-1.5 flex-1">
              <Label htmlFor="p-qty" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: FONT_DISPLAY }}>Base Qty</Label>
              <Input id="p-qty" type="number" min="0" placeholder="10" value={baseQty} onChange={(e) => setBaseQty(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5 flex-1">
              <Label htmlFor="p-stock" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: FONT_DISPLAY }}>Current Stock</Label>
              <Input id="p-stock" type="number" min="0" placeholder="optional" value={stockQty} onChange={(e) => setStockQty(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: FONT_DISPLAY }}>Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="w-20 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="packs">packs</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="units">units</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <AnimatePresence>
            {forecastNum && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="rounded-lg border px-3 py-2.5 space-y-1.5"
                style={{
                  background: coverPct !== null && coverPct < 50 ? "rgb(254 242 242 / 0.7)" : coverPct !== null && coverPct < 100 ? "rgb(255 251 235 / 0.7)" : "rgb(240 253 244 / 0.7)",
                  borderColor: coverPct !== null && coverPct < 50 ? "rgb(252 165 165 / 0.5)" : coverPct !== null && coverPct < 100 ? "rgb(253 230 138 / 0.5)" : "rgb(167 243 208 / 0.5)",
                }}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground" style={{ fontFamily: FONT_DISPLAY }}>Forecast qty</span>
                  <span className="font-semibold text-primary" style={{ fontFamily: FONT_MONO }}>
                    {forecastNum} {unit} <span className="font-normal opacity-50">(×{combinedMult.toFixed(2)})</span>
                  </span>
                </div>
                {coverPct !== null && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground" style={{ fontFamily: FONT_DISPLAY }}>Stock cover</span>
                    <span className={`font-bold ${coverPct < 50 ? "text-rose-600" : coverPct < 100 ? "text-amber-600" : "text-emerald-600"}`}
                      style={{ fontFamily: FONT_MONO }}>
                      {coverPct}% {coverPct < 50 ? "— reorder now" : coverPct < 100 ? "— low stock" : "— adequate"}
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" disabled={!name.trim() || !baseQty || parseFloat(baseQty) < 0}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add to Forecast
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Dashboard ───────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const [products, setProducts]       = useState<ForecastProduct[]>(BASE_PRODUCTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRow, setSelectedRow]  = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated]   = useState("2 mins ago");
  const [storeLabel, setStoreLabel]     = useState("Andheri West");
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsUsed, setGpsUsed]           = useState(false);

  // Live clock — only recompute signals when date/day changes
  const now      = useLiveClock();
  const dateKey  = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getDay()}`;
  const activeSignals  = useMemo(() => computeActiveSignals(now), [dateKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const combinedMult   = useMemo(() => activeSignals.reduce((a, s) => a * s.multiplier, 1), [activeSignals]);
  const displayRows    = useMemo(() => computeRows(products, combinedMult), [products, combinedMult]);

  const formattedDate = now.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const formattedTime = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });

  const updateStock = (id: number, stock: number | undefined) =>
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, stock } : p));

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => { setIsRefreshing(false); setLastUpdated("just now"); }, 1200);
  };

  const handleGps = () => {
    if (!navigator.geolocation) return;
    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, { headers: { "Accept-Language": "en" } });
          const data = await res.json();
          const area = data.address?.suburb || data.address?.neighbourhood || data.address?.city_district || data.address?.city || "Current Location";
          setStoreLabel(area); setGpsUsed(true);
        } catch { setStoreLabel("Current Location"); setGpsUsed(true); }
        finally  { setIsGpsLoading(false); }
      },
      () => setIsGpsLoading(false),
      { timeout: 8000 }
    );
  };

  const upliftPct = (row: ForecastRow) => {
    if (row.baseNum === 0) return null;
    return Math.round(((row.finalNum - row.baseNum) / row.baseNum) * 100);
  };

  // Dynamic alerts
  const expiryAlerts   = displayRows.filter((r) => r.expiry);
  const lowStockAlerts = displayRows
    .filter((r) => r.stock !== undefined && r.stock < r.finalNum * 0.5 && r.responsive)
    .sort((a, b) => (a.stock! / a.finalNum) - (b.stock! / b.finalNum))
    .slice(0, 2);

  return (
    <div className="relative flex flex-col h-screen max-h-screen text-foreground overflow-hidden" style={{ zIndex: 2 }}>

      {/* ── Header ── */}
      <header className="relative z-10 flex-none h-14 border-b border-border bg-white/20 dark:bg-black/25 backdrop-blur-md flex items-center px-5 gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: "0.95rem", letterSpacing: "-0.02em" }}>
            <span className="text-primary">Demand</span><span className="text-foreground/80">Ops</span>
          </span>
        </div>

        <div className="h-5 w-px bg-border mx-1" />

        <div className="flex items-center gap-2.5 flex-1">
          <div className="flex items-center gap-1.5 px-3 h-8 bg-background/60 border border-border rounded-md text-xs font-medium"
            style={{ fontFamily: FONT_DISPLAY }}>
            <MapPin className="w-3 h-3 text-primary shrink-0" />
            <span className="truncate max-w-[120px]">{storeLabel}</span>
          </div>

          <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs gap-1.5" onClick={handleGps} disabled={isGpsLoading}>
            {isGpsLoading
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : <MapPin className={`w-3 h-3 ${gpsUsed ? "text-primary" : "text-muted-foreground"}`} />}
            <span style={{ fontFamily: FONT_DISPLAY }}>{isGpsLoading ? "Locating…" : "Use GPS"}</span>
          </Button>

          <div className="h-4 w-px bg-border" />

          {/* Live date + time */}
          <div className="flex items-center gap-2 px-3 h-8 bg-background/60 border border-border rounded-md">
            <span className="text-xs text-foreground/80" style={{ fontFamily: FONT_DISPLAY }}>{formattedDate}</span>
            <span className="text-[11px] text-muted-foreground hidden sm:block" style={{ fontFamily: FONT_MONO }}>{formattedTime}</span>
          </div>

          <Select defaultValue="urban">
            <SelectTrigger className="w-[130px] h-8 text-xs bg-background/60 border-border" style={{ fontFamily: FONT_DISPLAY }}>
              <SelectValue placeholder="Area Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="urban">Urban</SelectItem>
              <SelectItem value="semi-urban">Semi-Urban</SelectItem>
              <SelectItem value="rural">Rural</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-muted-foreground hidden sm:block" style={{ fontFamily: FONT_DISPLAY }}>
            Updated {lastUpdated}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRefresh}>
            <motion.div animate={{ rotate: isRefreshing ? 360 : 0 }} transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}>
              <RefreshCw className="w-3.5 h-3.5" />
            </motion.div>
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={toggleTheme} aria-label="Toggle theme">
            <AnimatePresence mode="wait">
              <motion.div key={theme} initial={{ rotate: -30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 30, opacity: 0 }} transition={{ duration: 0.15 }}>
                {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </motion.div>
            </AnimatePresence>
          </Button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="relative z-10 flex-1 flex min-h-0">

        {/* Sidebar */}
        <div className="w-72 border-r border-border bg-white/25 dark:bg-black/30 backdrop-blur-md p-4 flex flex-col gap-4 overflow-y-auto">

          {/* Active Signals */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                style={{ fontFamily: FONT_DISPLAY, letterSpacing: "0.1em" }}>
                Active Signals
              </h2>
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5" style={{ fontFamily: FONT_MONO }}>
                {activeSignals.length} live
              </Badge>
            </div>
            <div className="flex flex-col gap-2">
              <AnimatePresence>
                {activeSignals.map((sig) => (
                  <SignalCard key={sig.id} signal={sig} />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Demand Pulse Meter */}
          <DemandMeter combined={combinedMult} count={activeSignals.length} />

          {/* Upcoming Events */}
          <UpcomingEvents now={now} />

          {/* Combined Uplift Summary */}
          <div className="mt-auto pt-2 border-t border-border">
            <div className="p-3 rounded-xl bg-primary/8 border border-primary/15">
              <div className="flex items-center gap-2 mb-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-bold text-primary" style={{ fontFamily: FONT_DISPLAY }}>Combined Uplift</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed" style={{ fontFamily: FONT_DISPLAY }}>
                {activeSignals.length} signal{activeSignals.length !== 1 ? "s" : ""} pushing combined demand up to{" "}
                <span className="font-bold text-foreground" style={{ fontFamily: FONT_MONO }}>×{combinedMult.toFixed(2)}</span> for eligible products.
              </p>
            </div>
          </div>
        </div>

        {/* Forecast Table */}
        <div className="flex-1 p-5 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 style={{ fontFamily: FONT_PLAYFAIR, fontWeight: 700, fontSize: "1.35rem", letterSpacing: "-0.01em" }}>
                Today's Forecast
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: FONT_DISPLAY }}>
                Hover final quantities for multiplier breakdown · Click rows to pin
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => setShowAddModal(true)}>
                <Plus className="w-3.5 h-3.5" />
                <span style={{ fontFamily: FONT_DISPLAY }}>Add Product</span>
              </Button>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/40 dark:bg-black/30 border border-border rounded-lg px-3 py-1.5 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span style={{ fontFamily: FONT_MONO }}>Live</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto rounded-xl border border-border shadow-sm bg-white/30 dark:bg-black/30 backdrop-blur-md">
            <Table>
              <TableHeader className="sticky top-0 z-10">
                <TableRow className="border-border hover:bg-transparent bg-white/40 dark:bg-black/20">
                  {["Product", "Base Qty", "Stock", "Final Qty", "Uplift", "Trend"].map((h, i) => (
                    <TableHead
                      key={h}
                      className={`text-[10px] font-bold uppercase tracking-widest text-muted-foreground ${
                        i === 1 || i === 2 || i === 3 ? "text-right" : i >= 4 ? "text-center" : ""
                      } ${i === 5 ? "w-16" : i === 4 ? "w-24" : i === 2 ? "w-36" : ""}`}
                      style={{ fontFamily: FONT_DISPLAY, letterSpacing: "0.08em" }}
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence initial={false}>
                  {displayRows.map((row, index) => {
                    const pct = upliftPct(row);
                    const isSel = selectedRow === row.id;
                    return (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 28 }}
                        className={`border-border transition-colors cursor-pointer table-row ${
                          isSel ? "bg-primary/5 hover:bg-primary/8" : "hover:bg-white/20 dark:hover:bg-white/5"
                        }`}
                        onClick={() => setSelectedRow(isSel ? null : row.id)}
                      >
                        <TableCell className="py-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm" style={{ fontFamily: FONT_DISPLAY }}>{row.product}</span>
                            {row.risk && (
                              <Badge variant="destructive" className="h-4 px-1.5 text-[9px] uppercase font-bold animate-pulse">
                                {row.risk}
                              </Badge>
                            )}
                            {row.expiry && (
                              <Badge variant="outline" className="h-4 px-1.5 text-[9px] uppercase font-bold border-amber-400/60 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10">
                                {row.expiry}
                              </Badge>
                            )}
                            {row.isNew && (
                              <Badge className="h-4 px-1.5 text-[9px] uppercase font-bold bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400 border-violet-200 dark:border-violet-500/20 hover:bg-violet-100">
                                NEW
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground py-3" style={{ fontFamily: FONT_MONO }}>
                          {row.base}
                        </TableCell>
                        <TableCell className="text-right py-2.5 w-36">
                          <StockCell row={row} onUpdate={updateStock} />
                        </TableCell>
                        <TableCell className="text-right py-3">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                className="font-semibold text-sm cursor-help border-b border-dashed border-primary/40 pb-0.5 text-foreground hover:text-primary transition-colors"
                                style={{ fontFamily: FONT_MONO }}
                              >
                                <AnimatedNumber value={row.finalNum} unit={row.unit} />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="bg-popover border border-border p-3.5 max-w-xs shadow-xl rounded-xl" sideOffset={8}>
                              {!row.responsive ? (
                                <p className="text-xs text-muted-foreground" style={{ fontFamily: FONT_DISPLAY }}>
                                  No signal multipliers applied — quantity unchanged.
                                </p>
                              ) : (
                                <div className="space-y-2.5">
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest" style={{ fontFamily: FONT_DISPLAY }}>
                                    Multiplier Breakdown
                                  </p>
                                  <div className="flex items-center flex-wrap gap-1.5 text-xs">
                                    <span className="text-muted-foreground text-[11px]" style={{ fontFamily: FONT_DISPLAY }}>Base</span>
                                    <span style={{ fontFamily: FONT_MONO }} className="font-medium">{row.base}</span>
                                    {activeSignals.map((sig) => (
                                      <span key={sig.id} className="flex items-center gap-1">
                                        <span className="text-muted-foreground">×</span>
                                        <Badge
                                          variant="outline"
                                          className={`text-[10px] h-5 px-1.5 ${HUE[activeSignals.find((s) => s.id === sig.id) ? "orange" : "amber"]?.color}`}
                                          style={{ fontFamily: FONT_MONO }}
                                        >
                                          {sig.name} ×{sig.multiplier}
                                        </Badge>
                                      </span>
                                    ))}
                                    <span className="text-muted-foreground">=</span>
                                    <span className="font-bold text-primary" style={{ fontFamily: FONT_MONO }}>
                                      {row.finalNum} {row.unit}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="text-center py-3">
                          {pct !== null ? (
                            <span
                              className={`text-xs font-semibold ${pct > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}
                              style={{ fontFamily: FONT_MONO }}
                            >
                              {pct > 0 ? `+${pct}%` : `${pct}%`}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground" style={{ fontFamily: FONT_MONO }}>—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center py-3">
                          {row.change === "up" && (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/15">
                              <ArrowUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            </span>
                          )}
                          {row.change === "neutral" && (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted">
                              <ArrowRight className="w-3 h-3 text-muted-foreground" />
                            </span>
                          )}
                          {row.change === "down" && (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-500/15">
                              <ChevronUp className="w-3 h-3 text-sky-600 dark:text-sky-400 rotate-180" />
                            </span>
                          )}
                          {row.change === "new" && (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-500/15">
                              <ChevronUp className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                            </span>
                          )}
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      {/* ── Alerts Footer ── */}
      <footer className="relative z-10 flex-none border-t border-border bg-white/25 dark:bg-black/30 backdrop-blur-md px-5 py-3 flex gap-3">
        {expiryAlerts.map((r) => (
          <AlertCard
            key={r.id}
            variant="warn"
            icon={AlertTriangle}
            title={`${r.product} — Expiry Warning`}
            message="8 packs expire in 2 days. Consider running a discount or returning stock."
            color="text-amber-600 dark:text-amber-400"
          />
        ))}
        {lowStockAlerts.map((r) => {
          const daysCover = r.stock !== undefined && r.finalNum > 0 ? Math.round((r.stock / (r.finalNum / 7))) : 0;
          return (
            <AlertCard
              key={r.id}
              variant="danger"
              icon={AlertCircle}
              title={`${r.product} — Stockout Risk`}
              message={`Current stock covers ~${daysCover} days at forecast demand (×${combinedMult.toFixed(2)}). Reorder now.`}
              color="text-rose-600 dark:text-rose-400"
            />
          );
        })}
        {expiryAlerts.length === 0 && lowStockAlerts.length === 0 && (
          <div className="flex-1 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span style={{ fontFamily: FONT_DISPLAY }}>All stock levels healthy — no alerts today.</span>
          </div>
        )}
      </footer>

      <DynamicBackground />

      <AddProductModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(p) => setProducts((prev) => [...prev, p])}
        combinedMult={combinedMult}
      />
    </div>
  );
}
