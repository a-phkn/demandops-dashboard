import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, CloudRain, Wallet, AlertTriangle, AlertCircle, ArrowUp, ArrowRight,
  Sun, Moon, X, ChevronDown, TrendingUp, RefreshCw, MapPin,
  Plus, Loader2, Star, Gift, Zap, Heart, Building2, Tractor, Leaf,
  Wheat, Flower, Sparkles, Flag, Activity, Trash2, BarChart2,
  Package, Target, Layers, ChevronUp,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/components/ThemeProvider";

const FONT_DISPLAY = "'Space Grotesk', sans-serif";
const FONT_PLAYFAIR = "'Playfair Display', serif";
const FONT_MONO = "'DM Mono', monospace";

type ForecastProduct = {
  id: number;
  product: string;
  baseNum: number;
  unit: string;
  responsive: boolean;
  risk?: string;
  expiry?: string;
  isNew?: boolean;
  stock?: number;
};
type ForecastRow = ForecastProduct & {
  base: string;
  final: string;
  finalNum: number;
  change: string;
};
type DynamicSignal = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  desc: string;
  multiplier: number;
  color: string;
  bg: string;
  barColor: string;
  detail: string;
  urgency: "critical" | "high" | "medium" | "low";
  daysAway: number;
};

const HUE: Record<string, { color: string; bg: string; bar: string }> = {
  rose: { color: "text-rose-500 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-500/15", bar: "#f43f5e" },
  orange: { color: "text-orange-500 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-500/15", bar: "#f97316" },
  amber: { color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/15", bar: "#f59e0b" },
  yellow: { color: "text-yellow-500 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-500/15", bar: "#eab308" },
  green: { color: "text-green-500 dark:text-green-400", bg: "bg-green-50 dark:bg-green-500/15", bar: "#22c55e" },
  emerald: { color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/15", bar: "#10b981" },
  sky: { color: "text-sky-500 dark:text-sky-400", bg: "bg-sky-50 dark:bg-sky-500/15", bar: "#0ea5e9" },
  blue: { color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/15", bar: "#3b82f6" },
  indigo: { color: "text-indigo-500 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-500/15", bar: "#6366f1" },
  violet: { color: "text-violet-500 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-500/15", bar: "#8b5cf6" },
  pink: { color: "text-pink-500 dark:text-pink-400", bg: "bg-pink-50 dark:bg-pink-500/15", bar: "#ec4899" },
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  flame: Flame, sun: Sun, zap: Zap, star: Star, gift: Gift, heart: Heart,
  moon: Moon, rain: CloudRain, wallet: Wallet, trend: TrendingUp,
  urban: Building2, rural: Tractor, leaf: Leaf, wheat: Wheat,
  flower: Flower, sparkles: Sparkles, flag: Flag,
};

const FESTIVALS = [
  { name: "Onam", month: 7, day: 25, region: "Kerala", multiplier: 1.8, hue: "emerald", iconKey: "leaf" },
  { name: "Pongal", month: 0, day: 14, region: "Tamil Nadu", multiplier: 1.7, hue: "yellow", iconKey: "wheat" },
  { name: "Ugadi", month: 2, day: 22, region: "Karnataka", multiplier: 1.6, hue: "emerald", iconKey: "flower" },
  { name: "Bonalu", month: 6, day: 10, region: "Telangana", multiplier: 1.5, hue: "rose", iconKey: "sparkles" },
  { name: "Ganesh Chaturthi", month: 8, day: 15, region: "Maharashtra", multiplier: 1.9, hue: "orange", iconKey: "sparkles" },
  { name: "Navratri", month: 9, day: 13, region: "Gujarat", multiplier: 1.8, hue: "amber", iconKey: "star" },
  { name: "Gudi Padwa", month: 2, day: 22, region: "Maharashtra", multiplier: 1.5, hue: "yellow", iconKey: "sun" },
  { name: "Durga Puja", month: 9, day: 10, region: "West Bengal", multiplier: 2.1, hue: "amber", iconKey: "flame" },
  { name: "Bihu", month: 3, day: 14, region: "Assam", multiplier: 1.6, hue: "green", iconKey: "leaf" },
  { name: "Chhath Puja", month: 10, day: 7, region: "Bihar", multiplier: 1.9, hue: "orange", iconKey: "sun" },
  { name: "Hornbill Fest", month: 11, day: 1, region: "Nagaland", multiplier: 1.6, hue: "rose", iconKey: "sparkles" },
  { name: "Ratha Yatra", month: 6, day: 14, region: "Odisha", multiplier: 1.8, hue: "orange", iconKey: "star" },
  { name: "Lohri", month: 0, day: 13, region: "Punjab", multiplier: 1.6, hue: "orange", iconKey: "flame" },
  { name: "Baisakhi", month: 3, day: 13, region: "Punjab", multiplier: 1.7, hue: "yellow", iconKey: "wheat" },
  { name: "Karwa Chauth", month: 9, day: 28, region: "Delhi", multiplier: 1.4, hue: "rose", iconKey: "moon" },
  { name: "Hareli", month: 7, day: 4, region: "Chhattisgarh", multiplier: 1.3, hue: "emerald", iconKey: "leaf" },
  { name: "Lokrang", month: 0, day: 26, region: "Madhya Pradesh", multiplier: 1.3, hue: "blue", iconKey: "flag" },
  { name: "Diwali", month: 10, day: 20, region: "All", multiplier: 2.0, hue: "amber", iconKey: "sparkles" },
  { name: "Holi", month: 2, day: 25, region: "All", multiplier: 1.7, hue: "rose", iconKey: "sun" },
  { name: "Eid al-Adha", month: 4, day: 27, region: "All", multiplier: 1.6, hue: "emerald", iconKey: "moon" },
  { name: "Christmas", month: 11, day: 25, region: "All", multiplier: 1.5, hue: "rose", iconKey: "star" },
  { name: "Republic Day", month: 0, day: 26, region: "All", multiplier: 1.25, hue: "blue", iconKey: "flag" },
  { name: "Independence Day", month: 7, day: 15, region: "All", multiplier: 1.3, hue: "orange", iconKey: "flag" },
];

function getUpcomingFestivals(now: Date, region: string, windowDays: number, maxCount: number) {
  const results: Array<any> = [];
  for (const f of FESTIVALS) {
    if (f.region !== region && f.region !== "All") continue;
    const fDate = new Date(now.getFullYear(), f.month, f.day);
    const diff = Math.round((fDate.getTime() - now.getTime()) / 86_400_000);
    if (diff >= 0 && diff <= windowDays) {
      results.push({ ...f, daysAway: diff, date: fDate, mult: f.multiplier });
    }
  }
  return results.sort((a, b) => a.daysAway - b.daysAway).slice(0, maxCount);
}

function computeActiveSignals(now: Date, region: string, setting: string): DynamicSignal[] {
  const month = now.getMonth();
  const day = now.getDate();
  const wd = now.getDay();
  const active: DynamicSignal[] = [];

  const settingMult = setting === "Urban" ? 1.12 : 0.90;
  active.push({
    id: "setting", icon: setting === "Urban" ? Building2 : Tractor, name: `${setting} Context`,
    desc: setting === "Urban" ? "High density area" : "Lower density, bulk demand", multiplier: settingMult,
    ...HUE.blue, barColor: HUE.blue.bar, detail: "Adjusts baseline demand based on store geographic density.", urgency: "low", daysAway: 0
  });

  const [nextFest] = getUpcomingFestivals(now, region, 21, 1);
  if (nextFest) {
    const { color, bg, bar } = HUE[nextFest.hue] || HUE.amber;
    active.push({
      id: "festival", icon: ICON_MAP[nextFest.iconKey.toLowerCase()] || Star, name: nextFest.name,
      desc: nextFest.daysAway === 0 ? "Today!" : nextFest.daysAway === 1 ? "Tomorrow" : `${nextFest.daysAway} days away`,
      multiplier: nextFest.mult, color, bg, barColor: bar, detail: "Major regional driver for staples and gifting items.",
      urgency: nextFest.daysAway <= 3 ? "critical" : nextFest.daysAway <= 7 ? "high" : "medium", daysAway: nextFest.daysAway,
    });
  }

  if (day <= 7) active.push({ id: "salary", icon: Wallet, name: "Salary Week", desc: `Post-salary · day ${day}`, multiplier: 1.25, ...HUE.violet, barColor: HUE.violet.bar, detail: "First 7 days post-salary see a 25% demand surge.", urgency: "medium", daysAway: 0 });
  if (day >= 25) active.push({ id: "presalary", icon: Wallet, name: "Pre-Salary Surge", desc: "Month-end stock-up", multiplier: 1.1, ...HUE.indigo, barColor: HUE.indigo.bar, detail: "Families stock up ahead of salary credit.", urgency: "low", daysAway: 0 });
  if (wd === 5 || wd === 6) active.push({ id: "weekend", icon: Sun, name: wd === 6 ? "Saturday Rush" : "Friday Surge", desc: "Peak shopping day", multiplier: wd === 6 ? 1.22 : 1.15, ...HUE.amber, barColor: HUE.amber.bar, detail: "Weekends see higher footfall.", urgency: "medium", daysAway: 0 });
  if (month >= 5 && month <= 8) active.push({ id: "monsoon", icon: CloudRain, name: "Monsoon Season", desc: "Active rain shift", multiplier: 1.18, ...HUE.sky, barColor: HUE.sky.bar, detail: "Boosts home consumption staples.", urgency: "low", daysAway: 0 });
  if (month >= 2 && month <= 4) active.push({ id: "summer", icon: Sun, name: "Summer Season", desc: "Heatwave shift", multiplier: 1.15, ...HUE.orange, barColor: HUE.orange.bar, detail: "Cold drinks and dairy spike.", urgency: "low", daysAway: 0 });
  if (month >= 10 || month === 0) active.push({ id: "winter", icon: Moon, name: "Winter Season", desc: "Warming boost", multiplier: 1.12, ...HUE.blue, barColor: HUE.blue.bar, detail: "Winter drives demand for dry fruits and ghee.", urgency: "low", daysAway: 0 });

  if (active.length === 0) active.push({ id: "baseline", icon: TrendingUp, name: "Steady Demand", desc: "No major events", multiplier: 1.0, color: "text-muted-foreground", bg: "bg-muted", barColor: "#9ca3af", detail: "Standard forecast applies.", urgency: "low", daysAway: 0 });

  return active;
}

const BASE_PRODUCTS: ForecastProduct[] = [
  { id: 1, product: "Sugar", baseNum: 20, unit: "kg", responsive: true, stock: 30 },
  { id: 2, product: "Ghee", baseNum: 4, unit: "kg", responsive: true, risk: "Med Risk", stock: 12 },
  { id: 3, product: "Rice", baseNum: 15, unit: "kg", responsive: true, risk: "High Risk", stock: 8 },
  { id: 4, product: "Bread", baseNum: 10, unit: "packs", responsive: false, expiry: "Expiry" },
  { id: 5, product: "Dry Fruits", baseNum: 4, unit: "kg", responsive: true, isNew: true },
  { id: 6, product: "Atta", baseNum: 25, unit: "kg", responsive: true, risk: "Med Risk", stock: 55 },
];

function computeRows(products: ForecastProduct[], combinedMult: number): ForecastRow[] {
  return products.map((p) => {
    const finalNum = p.responsive && p.baseNum > 0 ? Math.round(p.baseNum * combinedMult) : p.baseNum;
    return { ...p, base: `${p.baseNum} ${p.unit}`, final: `${finalNum} ${p.unit}`, finalNum, change: !p.responsive ? "neutral" : finalNum > p.baseNum ? "up" : finalNum < p.baseNum ? "down" : "neutral" };
  });
}

function useLiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  return now;
}

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(target);
  const prev = useRef(target);
  const frame = useRef(0);
  useEffect(() => {
    if (prev.current === target) return;
    const start = prev.current; prev.current = target; let t0: number | null = null;
    const animate = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      setValue(Math.round(start + (target - start) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame.current = requestAnimationFrame(animate); else setValue(target);
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

const INITIAL_LOCATIONS: Record<string, string> = {
  "Mylasandra": "Karnataka",
  "Andheri West": "Maharashtra",
  "Salt Lake": "West Bengal",
  "Indira Nagar": "Karnataka",
  "Chandni Chowk": "Delhi",
  "Amaravati": "Andhra Pradesh",
  "Itanagar": "Arunachal Pradesh",
  "Dispur": "Assam",
  "Patna": "Bihar",
  "Raipur": "Chhattisgarh",
  "Panaji": "Goa",
  "Gandhinagar": "Gujarat",
  "Chandigarh": "Haryana",
  "Shimla": "Himachal Pradesh",
  "Ranchi": "Jharkhand",
  "Bengaluru": "Karnataka",
  "Thiruvananthapuram": "Kerala",
  "Bhopal": "Madhya Pradesh",
  "Mumbai": "Maharashtra",
  "Imphal": "Manipur",
  "Shillong": "Meghalaya",
  "Aizawl": "Mizoram",
  "Kohima": "Nagaland",
  "Bhubaneswar": "Odisha",
  "Jaipur": "Rajasthan",
  "Gangtok": "Sikkim",
  "Chennai": "Tamil Nadu",
  "Hyderabad": "Telangana",
  "Agartala": "Tripura",
  "Lucknow": "Uttar Pradesh",
  "Dehradun": "Uttarakhand",
  "Kolkata": "West Bengal",
  "New Delhi": "Delhi",
  "Srinagar": "Jammu and Kashmir"
};

// ── Floating Background Objects ─────────────────────────────────────────────
const FLOAT_OBJECTS = [
  {
    id: "barchart",
    jsx: (stroke: string) => (
      <svg width="64" height="52" viewBox="0 0 64 52" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="28" width="10" height="20" rx="2" />
        <rect x="20" y="16" width="10" height="32" rx="2" />
        <rect x="36" y="8" width="10" height="40" rx="2" />
        <rect x="52" y="20" width="10" height="28" rx="2" />
        <line x1="0" y1="49" x2="64" y2="49" strokeWidth="1.2" />
      </svg>
    ),
    top: "10%", left: "6%", ax: [0, 18, 4, 0], ay: [0, 12, -6, 0], dur: 32, rot: -8,
  },
  {
    id: "trendline",
    jsx: (stroke: string) => (
      <svg width="72" height="44" viewBox="0 0 72 44" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4,38 16,28 28,32 40,16 52,20 68,6" />
        <circle cx="68" cy="6" r="3" fill={stroke} />
        <line x1="62" y1="10" x2="72" y2="2" strokeWidth="1.2" strokeDasharray="2 2" />
      </svg>
    ),
    top: "62%", left: "3%", ax: [0, 14, -4, 0], ay: [0, -18, 2, 0], dur: 38, rot: 6,
  },
  {
    id: "package",
    jsx: (stroke: string) => (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M26 4L48 16v20L26 48 4 36V16L26 4z" />
        <line x1="26" y1="4" x2="26" y2="48" />
        <line x1="4" y1="16" x2="48" y2="16" />
        <path d="M16 10l10 6 10-6" />
      </svg>
    ),
    top: "18%", right: "7%", ax: [0, -16, -2, 0], ay: [0, 20, 8, 0], dur: 42, rot: 12,
  },
  {
    id: "target",
    jsx: (stroke: string) => (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="28" cy="28" r="24" />
        <circle cx="28" cy="28" r="14" />
        <circle cx="28" cy="28" r="5" />
        <line x1="28" y1="4" x2="28" y2="14" />
        <line x1="28" y1="42" x2="28" y2="52" />
        <line x1="4" y1="28" x2="14" y2="28" />
        <line x1="42" y1="28" x2="52" y2="28" />
      </svg>
    ),
    bottom: "22%", right: "5%", ax: [0, -20, 4, 0], ay: [0, -14, -4, 0], dur: 35, rot: 0,
  },
  {
    id: "layers",
    jsx: (stroke: string) => (
      <svg width="62" height="48" viewBox="0 0 62 48" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M31 4L58 18 31 32 4 18 31 4z" />
        <path d="M4 28l27 14 27-14" />
        <path d="M4 38l27 14 27-14" opacity="0.5" />
      </svg>
    ),
    top: "45%", left: "45%", ax: [0, 10, -8, 0], ay: [0, -20, -2, 0], dur: 28, rot: -5,
  },
  {
    id: "piechart",
    jsx: (stroke: string) => (
      <svg width="54" height="54" viewBox="0 0 54 54" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M27 4 A23 23 0 0 1 50 27 L27 27 Z" />
        <path d="M50 27 A23 23 0 0 1 11 44 L27 27 Z" />
        <path d="M11 44 A23 23 0 1 1 27 4 L27 27 Z" opacity="0.6" />
      </svg>
    ),
    bottom: "12%", left: "20%", ax: [0, 22, 6, 0], ay: [0, -10, 4, 0], dur: 45, rot: 15,
  },
  {
    id: "arrow-up",
    jsx: (stroke: string) => (
      <svg width="36" height="52" viewBox="0 0 36 52" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="48" x2="18" y2="8" />
        <polyline points="6,20 18,8 30,20" />
        <line x1="10" y1="36" x2="26" y2="36" strokeWidth="1.2" strokeDasharray="2 3" opacity="0.6" />
        <line x1="10" y1="44" x2="26" y2="44" strokeWidth="1.2" strokeDasharray="2 3" opacity="0.3" />
      </svg>
    ),
    top: "30%", right: "20%", ax: [0, -10, 2, 0], ay: [0, 16, -8, 0], dur: 30, rot: -10,
  },
  {
    id: "grid",
    jsx: (stroke: string) => (
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round">
        <line x1="0" y1="20" x2="60" y2="20" />
        <line x1="0" y1="40" x2="60" y2="40" />
        <line x1="20" y1="0" x2="20" y2="60" />
        <line x1="40" y1="0" x2="40" y2="60" />
        <circle cx="20" cy="20" r="3" fill={stroke} />
        <circle cx="40" cy="40" r="3" fill={stroke} />
        <circle cx="20" cy="40" r="2" fill={stroke} opacity="0.5" />
      </svg>
    ),
    top: "75%", right: "30%", ax: [0, -12, -4, 0], ay: [0, 10, 6, 0], dur: 50, rot: 20,
  },
];

function DynamicBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const orbs = isDark ? [
    { color: "rgba(30,58,138,0.80)", top: "0%", left: "0%", w: 620, ax: [0, 40, 10, 0], ay: [0, 30, -8, 0], dur: 20 },
    { color: "rgba(212,167,67,0.28)", top: "10%", right: "0%", w: 500, ax: [0, -40, -8, 0], ay: [0, 40, 8, 0], dur: 26, delay: 4 },
    { color: "rgba(15,23,42,0.90)", bottom: "0%", left: "25%", w: 560, ax: [0, 30, -4, 0], ay: [0, -30, 4, 0], dur: 22, delay: 8 },
    { color: "rgba(37,99,235,0.22)", bottom: "10%", right: "10%", w: 380, ax: [0, 25, 5, 0], ay: [0, -25, -5, 0], dur: 30, delay: 12 },
  ] : [
    { color: "rgba(191,219,254,0.90)", top: "-5%", left: "-5%", w: 600, ax: [0, 35, 8, 0], ay: [0, 25, -6, 0], dur: 20 },
    { color: "rgba(254,243,199,0.85)", top: "5%", right: "-5%", w: 500, ax: [0, -30, -6, 0], ay: [0, 35, 6, 0], dur: 26, delay: 4 },
    { color: "rgba(219,234,254,0.80)", bottom: "0%", left: "20%", w: 520, ax: [0, 25, -4, 0], ay: [0, -28, 4, 0], dur: 22, delay: 8 },
    { color: "rgba(255,237,213,0.70)", bottom: "5%", right: "5%", w: 360, ax: [0, 22, 4, 0], ay: [0, -22, -4, 0], dur: 30, delay: 12 },
  ];

  const shapeStroke = isDark ? "rgba(212,167,67,0.13)" : "rgba(30,58,138,0.10)";

  return (
    <>
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          background: isDark
            ? "linear-gradient(135deg, hsl(222,47%,6%) 0%, hsl(220,45%,8%) 50%, hsl(218,42%,7%) 100%)"
            : "linear-gradient(135deg, hsl(218,40%,94%) 0%, hsl(215,35%,96%) 50%, hsl(220,38%,93%) 100%)",
        }}
        aria-hidden
      />
      <div style={{ position: "fixed", inset: 0, zIndex: 1, overflow: "hidden", pointerEvents: "none" }} aria-hidden>
        {orbs.map((orb, i) => (
          <motion.div
            key={i}
            style={{
              position: "absolute", borderRadius: "50%", filter: "blur(80px)",
              width: orb.w, height: orb.w,
              top: (orb as any).top, bottom: (orb as any).bottom,
              left: (orb as any).left, right: (orb as any).right,
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            }}
            animate={{ x: orb.ax, y: orb.ay }}
            transition={{ duration: orb.dur, repeat: Infinity, ease: "easeInOut", delay: (orb as any).delay ?? 0, times: [0, 0.33, 0.66, 1] }}
          />
        ))}

        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: isDark ? 0.06 : 0.05 }}>
          <defs>
            <pattern id="finegrid" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#finegrid)" />
        </svg>

        {FLOAT_OBJECTS.map((obj) => (
          <motion.div
            key={obj.id}
            style={{
              position: "absolute",
              top: (obj as any).top, bottom: (obj as any).bottom,
              left: (obj as any).left, right: (obj as any).right,
              rotate: obj.rot,
            }}
            animate={{ x: obj.ax, y: obj.ay, rotate: [obj.rot, obj.rot + 5, obj.rot - 4, obj.rot] }}
            transition={{ duration: obj.dur, repeat: Infinity, ease: "easeInOut", times: [0, 0.33, 0.66, 1] }}
          >
            {obj.jsx(shapeStroke)}
          </motion.div>
        ))}
      </div>
    </>
  );
}

// ── Dashboard Component ────────────────────────────────────────────────────
export default function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const [products, setProducts] = useState<ForecastProduct[]>(BASE_PRODUCTS);
  const [currentDate, setCurrentDate] = useState(new Date("2026-05-10"));

  const [dynamicLocations, setDynamicLocations] = useState<Record<string, string>>(INITIAL_LOCATIONS);
  const [currentLocation, setCurrentLocation] = useState("Mumbai");
  const [currentSetting, setCurrentSetting] = useState("Urban");

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("2 mins ago");
  const [storeLabel, setStoreLabel] = useState("Mumbai");
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsUsed, setGpsUsed] = useState(false);

  const realTime = useLiveClock();

  const userRegion = dynamicLocations[currentLocation] || "All";
  const activeSignals = useMemo(() => computeActiveSignals(currentDate, userRegion, currentSetting), [currentDate, currentLocation, currentSetting, dynamicLocations]);
  const combinedMult = useMemo(() => activeSignals.reduce((a, s) => a * s.multiplier, 1), [activeSignals]);
  const displayRows = useMemo(() => computeRows(products, combinedMult), [products, combinedMult]);

  const formattedTime = realTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });

  useEffect(() => {
    const fetchLiveInventory = async () => {
      try {
        const API_URL = "/api/inventory";
        const response = await fetch(API_URL);
        if (response.ok) {
          const liveData = await response.json();
          setProducts(liveData);
        }
      } catch (_) {}
    };
    fetchLiveInventory();
  }, []);

  const updateStock = async (id: number, stock: number | undefined) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock } : p)));
    try {
      const response = await fetch("/api/stock/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product_id: id, new_stock: stock || 0 }) });
      if (response.ok) {
        const updatedData = await fetch("/api/inventory").then((res) => res.json());
        setProducts(updatedData);
      }
    } catch (_) {}
  };

  const handleDeleteProduct = async (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await fetch(`/api/inventory/${id}`, { method: "DELETE" });
    } catch (_) {}
  };

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
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, { headers: { "Accept-Language": "en" } });
          const data = await res.json();
          const state = data.address?.state || "All";
          const area = data.address?.suburb || data.address?.neighbourhood || data.address?.city_district || data.address?.city || "Current Location";
          setDynamicLocations(prev => ({ ...prev, [area]: state }));
          setCurrentLocation(area);
          setStoreLabel(area);
          setGpsUsed(true);
        } catch {
          setStoreLabel("Current Location");
          setGpsUsed(true);
        } finally {
          setIsGpsLoading(false);
        }
      },
      () => setIsGpsLoading(false),
      { timeout: 8000 }
    );
  };

  const upliftPct = (row: ForecastRow) => {
    if (row.baseNum === 0) return null;
    return Math.round(((row.finalNum - row.baseNum) / row.baseNum) * 100);
  };

  const expiryAlerts = displayRows.filter((r) => r.expiry);
  const lowStockAlerts = displayRows.filter((r) => r.stock !== undefined && r.stock < r.finalNum * 0.5 && r.responsive).sort((a, b) => a.stock! / a.finalNum - b.stock! / b.finalNum).slice(0, 2);
  const sortedLocations = Object.keys(dynamicLocations).sort((a, b) => a.localeCompare(b));

  const totalForecastUnits = displayRows.reduce((s, r) => s + r.finalNum, 0);
  const alertCount = expiryAlerts.length + lowStockAlerts.length;

  const glassPanel = "bg-white/12 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10";
  const glassHeader = "bg-white/15 dark:bg-white/6 backdrop-blur-2xl border-b border-white/20 dark:border-white/10";

  return (
    <div className="relative flex flex-col h-screen max-h-screen text-foreground overflow-hidden" style={{ zIndex: 2 }}>
      <DynamicBackground />

      {/* ── Header ── */}
      <header className={`relative z-10 flex-none h-14 ${glassHeader} flex items-center px-5 gap-4`}>
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: theme === "dark" ? "linear-gradient(135deg,#f59e0b,#d97706)" : "linear-gradient(135deg,#1e3a8a,#1d4ed8)" }}>
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: "1rem", letterSpacing: "-0.02em" }}>
            <span className="text-primary">Demand</span><span className="text-foreground/70">Ops</span>
          </span>
        </div>

        <div className="h-5 w-px bg-border/50 mx-1" />

        <div className="flex items-center gap-2.5 flex-1">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <Select value={currentLocation} onValueChange={(val) => { setCurrentLocation(val); setStoreLabel(val); }}>
              <SelectTrigger className="w-[155px] h-8 text-xs bg-white/20 dark:bg-white/5 border-white/25 dark:border-white/10 backdrop-blur-sm" style={{ fontFamily: FONT_DISPLAY }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {sortedLocations.map(loc => (
                  <SelectItem key={loc} value={loc}>
                    {loc} <span className="opacity-40 text-[9px] ml-1">({dynamicLocations[loc]})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs gap-1.5 bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 border border-white/20 dark:border-white/10" onClick={handleGps} disabled={isGpsLoading}>
            {isGpsLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className={`w-3 h-3 ${gpsUsed ? "text-primary" : "text-muted-foreground"}`} />}
            <span style={{ fontFamily: FONT_DISPLAY }}>{isGpsLoading ? "Locating…" : "Use GPS"}</span>
          </Button>

          <div className="h-4 w-px bg-border/40 hidden sm:block" />

          <div className="flex items-center gap-2 px-3 h-8 bg-white/15 dark:bg-white/5 border border-white/25 dark:border-white/10 rounded-lg backdrop-blur-sm">
            <input
              type="date"
              value={currentDate.toISOString().split("T")[0]}
              onChange={(e) => { const d = new Date(e.target.value); if (!isNaN(d.getTime())) setCurrentDate(d); }}
              className="bg-transparent text-xs font-semibold cursor-pointer outline-none hover:text-primary transition-colors appearance-none"
              style={{ fontFamily: FONT_MONO }}
            />
            <span className="text-[9px] text-muted-foreground uppercase tracking-tight border-l border-border/40 pl-2 hidden sm:block">Sim Date</span>
          </div>

          <Select value={currentSetting} onValueChange={setCurrentSetting}>
            <SelectTrigger className="w-[110px] h-8 text-xs bg-white/15 dark:bg-white/5 border-white/25 dark:border-white/10 backdrop-blur-sm" style={{ fontFamily: FONT_DISPLAY }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Urban">Urban</SelectItem>
              <SelectItem value="Semi-Urban">Semi-Urban</SelectItem>
              <SelectItem value="Rural">Rural</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-muted-foreground hidden sm:block" style={{ fontFamily: FONT_MONO }}>{formattedTime}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 border border-white/20 dark:border-white/10" onClick={handleRefresh}>
            <motion.div animate={{ rotate: isRefreshing ? 360 : 0 }} transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}>
              <RefreshCw className="w-3.5 h-3.5" />
            </motion.div>
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 bg-white/10 dark:bg-white/5 border-white/25 dark:border-white/10" onClick={toggleTheme} aria-label="Toggle theme">
            <AnimatePresence mode="wait">
              <motion.div key={theme} initial={{ rotate: -30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 30, opacity: 0 }} transition={{ duration: 0.15 }}>
                {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </motion.div>
            </AnimatePresence>
          </Button>
        </div>
      </header>

      {/* ── Stats Strip ── */}
      <div className={`relative z-10 flex-none border-b border-white/15 dark:border-white/8 bg-white/8 dark:bg-white/3 backdrop-blur-lg px-5 py-2 flex gap-4`}>
        {[
          { label: "Store", value: storeLabel, sub: userRegion, icon: MapPin, accent: false },
          { label: "Combined Uplift", value: `×${combinedMult.toFixed(2)}`, sub: `${activeSignals.length} signals active`, icon: TrendingUp, accent: true },
          { label: "Total Forecast", value: `${totalForecastUnits}`, sub: "units today", icon: BarChart2, accent: false },
          { label: "Products Tracked", value: `${displayRows.length}`, sub: "in forecast", icon: Package, accent: false },
          { label: "Alerts", value: `${alertCount}`, sub: alertCount === 0 ? "all clear" : "need attention", icon: AlertTriangle, accent: alertCount > 0 },
        ].map((stat) => (
          <div key={stat.label} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border ${stat.accent ? "border-primary/30 bg-primary/8 dark:bg-primary/12" : "border-white/15 dark:border-white/8 bg-white/8 dark:bg-white/4"}`}>
            <stat.icon className={`w-3.5 h-3.5 shrink-0 ${stat.accent ? "text-primary" : "text-muted-foreground"}`} />
            <div>
              <div className={`text-xs font-bold ${stat.accent ? "text-primary" : "text-foreground"}`} style={{ fontFamily: FONT_MONO }}>{stat.value}</div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-wider" style={{ fontFamily: FONT_DISPLAY }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main ── */}
      <main className="relative z-10 flex-1 flex min-h-0">
        {/* Sidebar */}
        <aside className={`w-68 border-r border-white/15 dark:border-white/8 ${glassPanel} p-4 flex flex-col gap-3 overflow-y-auto`} style={{ width: "17rem" }}>
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground" style={{ fontFamily: FONT_DISPLAY, letterSpacing: "0.12em" }}>Active Signals</h2>
              <Badge variant="secondary" className="text-[9px] h-4 px-1.5 bg-primary/15 text-primary border-primary/20" style={{ fontFamily: FONT_MONO }}>{activeSignals.length} live</Badge>
            </div>
            <div className="flex flex-col gap-1.5">
              <AnimatePresence>{activeSignals.map((sig) => <SignalCard key={sig.id} signal={sig} />)}</AnimatePresence>
            </div>
          </div>

          <DemandMeter combined={combinedMult} count={activeSignals.length} />
          <UpcomingEvents now={currentDate} region={userRegion} />

          <div className="mt-auto pt-2 border-t border-white/15 dark:border-white/8">
            <div className="p-3 rounded-xl bg-primary/10 dark:bg-primary/15 border border-primary/20">
              <div className="flex items-center gap-2 mb-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-bold text-primary" style={{ fontFamily: FONT_DISPLAY }}>Combined Uplift</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed" style={{ fontFamily: FONT_DISPLAY }}>
                {activeSignals.length} signal{activeSignals.length !== 1 ? "s" : ""} pushing demand to{" "}
                <span className="font-bold text-foreground" style={{ fontFamily: FONT_MONO }}>×{combinedMult.toFixed(2)}</span>.
              </p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 p-5 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 style={{ fontFamily: FONT_PLAYFAIR, fontWeight: 700, fontSize: "1.3rem", letterSpacing: "-0.01em" }}>Today's Forecast</h1>
              <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: FONT_DISPLAY }}>Hover final quantities for multiplier breakdown · Click rows to pin</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="h-8 text-xs gap-1.5 shadow-sm" onClick={() => setShowAddModal(true)}>
                <Plus className="w-3.5 h-3.5" />
                <span style={{ fontFamily: FONT_DISPLAY }}>Add Product</span>
              </Button>
              <div className={`flex items-center gap-1.5 text-xs text-muted-foreground ${glassPanel} rounded-lg px-3 py-1.5`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span style={{ fontFamily: FONT_MONO }}>Live · {lastUpdated}</span>
              </div>
            </div>
          </div>

          <div className={`flex-1 overflow-auto rounded-2xl border border-white/20 dark:border-white/10 shadow-lg bg-white/20 dark:bg-white/4 backdrop-blur-xl`}>
            <Table>
              <TableHeader className="sticky top-0 z-10">
                <TableRow className="border-white/15 dark:border-white/8 hover:bg-transparent bg-white/30 dark:bg-white/6">
                  {["Product", "Base Qty", "Stock", "Final Qty", "Uplift", "Trend"].map((h, i) => (
                    <TableHead
                      key={h}
                      className={`text-[9px] font-bold uppercase tracking-widest text-muted-foreground ${i === 1 || i === 2 || i === 3 ? "text-right" : i >= 4 ? "text-center" : ""} ${i === 5 ? "w-16" : i === 4 ? "w-24" : i === 2 ? "w-36" : ""}`}
                      style={{ fontFamily: FONT_DISPLAY, letterSpacing: "0.10em" }}
                    >{h}</TableHead>
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
                        className={`group border-white/10 dark:border-white/6 transition-colors cursor-pointer table-row ${isSel ? "bg-primary/8 hover:bg-primary/12" : "hover:bg-white/20 dark:hover:bg-white/6"}`}
                        onClick={() => setSelectedRow(isSel ? null : row.id)}
                      >
                        <TableCell className="py-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm" style={{ fontFamily: FONT_DISPLAY }}>{row.product}</span>
                            {row.risk && <Badge variant={row.risk === "High Risk" ? "destructive" : "outline"} className={`h-4 px-1.5 text-[9px] uppercase font-bold ${row.risk === "High Risk" ? "animate-pulse" : "bg-amber-100/80 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/20"}`}>{row.risk}</Badge>}
                            {row.expiry && <Badge variant="outline" className="h-4 px-1.5 text-[9px] uppercase font-bold border-amber-400/50 text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-500/10">{row.expiry}</Badge>}
                            {row.isNew && <Badge className="h-4 px-1.5 text-[9px] uppercase font-bold bg-primary/15 text-primary border-primary/25 hover:bg-primary/15">NEW</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground py-3" style={{ fontFamily: FONT_MONO }}>{row.base}</TableCell>
                        <TableCell className="text-right py-2.5 w-36"><StockCell row={row} onUpdate={updateStock} /></TableCell>
                        <TableCell className="text-right py-3">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="font-semibold text-sm cursor-help border-b border-dashed border-primary/40 pb-0.5 text-foreground hover:text-primary transition-colors" style={{ fontFamily: FONT_MONO }}>
                                <AnimatedNumber value={row.finalNum} unit={row.unit} />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="bg-popover border border-border p-3.5 max-w-xs shadow-xl rounded-xl" sideOffset={8}>
                              {!row.responsive ? (
                                <p className="text-xs text-muted-foreground" style={{ fontFamily: FONT_DISPLAY }}>No multipliers applied — quantity unchanged.</p>
                              ) : (
                                <div className="space-y-2.5">
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest" style={{ fontFamily: FONT_DISPLAY }}>Multiplier Breakdown</p>
                                  <div className="flex items-center flex-wrap gap-1.5 text-xs">
                                    <span className="text-muted-foreground text-[11px]" style={{ fontFamily: FONT_DISPLAY }}>Base</span>
                                    <span style={{ fontFamily: FONT_MONO }} className="font-medium">{row.base}</span>
                                    {activeSignals.map((sig) => (
                                      <span key={sig.id} className="flex items-center gap-1">
                                        <span className="text-muted-foreground">×</span>
                                        <Badge variant="outline" className="text-[10px] h-5 px-1.5" style={{ fontFamily: FONT_MONO }}>{sig.name} ×{sig.multiplier}</Badge>
                                      </span>
                                    ))}
                                    <span className="text-muted-foreground">=</span>
                                    <span className="font-bold text-primary" style={{ fontFamily: FONT_MONO }}>{row.finalNum} {row.unit}</span>
                                  </div>
                                </div>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="text-center py-3">
                          {pct !== null ? (
                            <span className={`text-xs font-semibold ${pct > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`} style={{ fontFamily: FONT_MONO }}>
                              {pct > 0 ? `+${pct}%` : `${pct}%`}
                            </span>
                          ) : <span className="text-xs text-muted-foreground" style={{ fontFamily: FONT_MONO }}>—</span>}
                        </TableCell>
                        <TableCell className="text-center py-3">
                          <div className="flex items-center justify-center gap-2 group">
                            {row.change === "up" && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100/80 dark:bg-emerald-500/15"><ArrowUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /></span>}
                            {row.change === "neutral" && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted/60"><ArrowRight className="w-3 h-3 text-muted-foreground" /></span>}
                            {row.change === "down" && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-100/80 dark:bg-sky-500/15"><ChevronUp className="w-3 h-3 text-sky-600 dark:text-sky-400 rotate-180" /></span>}
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteProduct(row.id); }} className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-50/80 dark:hover:bg-rose-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100" title="Delete Product">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
      <footer className={`relative z-10 flex-none border-t border-white/15 dark:border-white/8 ${glassPanel} px-5 py-2.5 flex gap-3`}>
        {expiryAlerts.map((r) => (
          <AlertCard key={r.id} variant="warn" icon={AlertTriangle} title={`${r.product} — Expiry Warning`} message="8 packs expire in 2 days. Consider running a discount or returning stock." color="text-amber-600 dark:text-amber-400" />
        ))}
        {lowStockAlerts.map((r) => {
          const daysCover = r.stock !== undefined && r.finalNum > 0 ? Math.round(r.stock / (r.finalNum / 7)) : 0;
          return <AlertCard key={r.id} variant="danger" icon={AlertCircle} title={`${r.product} — Stockout Risk`} message={`Stock covers ~${daysCover} days at ×${combinedMult.toFixed(2)} demand. Reorder now.`} color="text-rose-600 dark:text-rose-400" />;
        })}
        {expiryAlerts.length === 0 && lowStockAlerts.length === 0 && (
          <div className="flex-1 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span style={{ fontFamily: FONT_DISPLAY }}>All stock levels healthy — no alerts today.</span>
          </div>
        )}
      </footer>

      <AddProductModal open={showAddModal} onClose={() => setShowAddModal(false)} onAdd={(p) => setProducts((prev) => [...prev, p])} combinedMult={combinedMult} />
    </div>
  );
}

// ── Sub-Components ─────────────────────────────────────────────────────────

function SignalCard({ signal }: { signal: DynamicSignal }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = signal.icon || Activity;
  const barPct = Math.min(((signal.multiplier - 1) / 0.8) * 100, 100);

  return (
    <motion.div layout transition={{ duration: 0.22 }}>
      <div
        className={`rounded-xl border cursor-pointer select-none transition-all duration-200 hover:-translate-y-0.5 overflow-hidden bg-white/15 dark:bg-white/4 backdrop-blur-md ${signal.urgency === "critical" ? "border-rose-400/50 ring-1 ring-rose-400/30" : signal.urgency === "high" ? "border-amber-400/50 ring-1 ring-amber-400/25" : "border-white/20 dark:border-white/10"}`}
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="p-3">
          <div className="flex items-start gap-2.5">
            <div className={`relative mt-0.5 p-1.5 rounded-lg ${signal.bg} ${signal.color} shrink-0`}>
              <Icon className="w-3.5 h-3.5" />
              {(signal.urgency === "critical" || signal.urgency === "high") && (
                <span className={`absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full border border-background ${signal.urgency === "critical" ? "bg-rose-500 animate-pulse" : "bg-amber-400"}`} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-xs truncate" style={{ fontFamily: FONT_DISPLAY }}>{signal.name}</h3>
                <div className="flex items-center gap-1 shrink-0">
                  <Badge variant="secondary" className="bg-primary/12 text-primary border-primary/20 text-[9px] px-1 h-3.5" style={{ fontFamily: FONT_MONO }}>×{signal.multiplier}</Badge>
                  <span className={`transition-transform duration-200 ${signal.color} inline-block ${expanded ? "rotate-180" : ""}`}><ChevronDown className="w-3 h-3" /></span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5" style={{ fontFamily: FONT_DISPLAY }}>{signal.desc}</p>
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-muted-foreground" style={{ fontFamily: FONT_DISPLAY }}>Demand impact</span>
              <span className="text-[9px] font-bold" style={{ fontFamily: FONT_MONO, color: signal.barColor }}>+{Math.round((signal.multiplier - 1) * 100)}%</span>
            </div>
            <div className="h-1 bg-black/8 dark:bg-white/10 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: signal.barColor }} initial={{ width: 0 }} animate={{ width: `${barPct}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }} />
            </div>
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <p className="text-[10px] text-muted-foreground mt-2.5 pt-2.5 border-t border-white/15 dark:border-white/8 leading-relaxed" style={{ fontFamily: FONT_DISPLAY }}>{signal.detail}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function DemandMeter({ combined, count }: { combined: number; count: number }) {
  const maxMult = 2.5;
  const pct = Math.min(Math.max((combined - 1) / (maxMult - 1), 0), 1);
  const BARS = 12;
  const label = pct < 0.15 ? "Baseline" : pct < 0.35 ? "Moderate" : pct < 0.6 ? "Elevated" : pct < 0.82 ? "High" : "Peak";
  const labelColor = pct < 0.15 ? "#9ca3af" : pct < 0.35 ? "#10b981" : pct < 0.6 ? "#f59e0b" : pct < 0.82 ? "#f97316" : "#ef4444";

  return (
    <div className="p-3 rounded-xl bg-primary/8 dark:bg-primary/12 border border-primary/18">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-primary" /><span className="text-[9px] font-bold uppercase tracking-widest text-primary" style={{ fontFamily: FONT_DISPLAY }}>Demand Pulse</span></div>
        <span className="text-[9px] text-muted-foreground" style={{ fontFamily: FONT_DISPLAY }}>{count} live</span>
      </div>
      <div className="flex items-end justify-center gap-[3px] h-9 my-1.5 px-1">
        {Array.from({ length: BARS }, (_, i) => {
          const threshold = (i + 1) / BARS;
          const lit = pct >= threshold;
          const h = 30 + (i / (BARS - 1)) * 70;
          const r = i / (BARS - 1);
          const barColor = r < 0.45 ? "#10b981" : r < 0.72 ? "#f59e0b" : "#ef4444";
          return (
            <motion.div key={i} className="flex-1 rounded-[2px]" style={{ height: `${h}%`, backgroundColor: lit ? barColor : "rgba(0,0,0,0.08)" }}
              initial={{ scaleY: 0 }} animate={{ scaleY: lit ? 1 : 0.25, opacity: lit ? 1 : 0.22 }}
              transition={{ delay: i * 0.03, duration: 0.45, ease: "easeOut" }} />
          );
        })}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold" style={{ color: labelColor, fontFamily: FONT_DISPLAY }}>{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-bold text-foreground" style={{ fontFamily: FONT_MONO }}>×{combined.toFixed(2)}</span>
          <span className="text-[9px] text-muted-foreground">combined</span>
        </div>
      </div>
    </div>
  );
}

function UpcomingEvents({ now, region }: { now: Date; region: string }) {
  const events = getUpcomingFestivals(now, region, 90, 3);
  if (!events || events.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h2 className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground" style={{ fontFamily: FONT_DISPLAY }}>Regional Outlook</h2>
        <div className="h-px flex-1 bg-border/30 ml-3" />
      </div>
      <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="space-y-1.5">
        {events.map((f) => {
          const { color, bg, bar } = HUE[f.hue] || HUE.blue;
          const Icon = ICON_MAP[f.iconKey.toLowerCase()] || Star;
          const isSoon = f.daysAway <= 7;
          return (
            <motion.div
              key={`${f.name}-${f.date}`}
              variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
              whileHover={{ scale: 1.02, x: 4 }}
              className="group relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-white/18 dark:border-white/8 bg-white/10 dark:bg-white/4 backdrop-blur-sm hover:border-primary/30 hover:bg-primary/5 transition-all cursor-default"
            >
              <div className={`p-1.5 rounded-lg ${bg} ${color} shadow-sm group-hover:rotate-12 transition-transform shrink-0`}><Icon className="w-3 h-3" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold truncate group-hover:text-primary transition-colors" style={{ fontFamily: FONT_DISPLAY }}>{f.name}</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-[9px] text-muted-foreground uppercase font-medium">{new Date(f.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</p>
                  {isSoon && <span className="w-1 h-1 rounded-full bg-rose-500 animate-ping" />}
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold block" style={{ fontFamily: FONT_MONO, color: bar }}>×{f.mult}</span>
                <p className="text-[9px] text-muted-foreground whitespace-nowrap">{f.daysAway === 0 ? "TODAY" : `in ${f.daysAway}d`}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

function StockCell({ row, onUpdate }: { row: ForecastRow; onUpdate: (id: number, stock: number | undefined) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(row.stock !== undefined ? String(row.stock) : "");
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = () => { const v = draft.trim(); onUpdate(row.id, v === "" ? undefined : Math.max(0, parseFloat(v) || 0)); setEditing(false); };
  const s = row.stock; const needed = row.finalNum;
  const pct = s !== undefined && needed > 0 ? Math.round((s / needed) * 100) : null;
  const cls = s === undefined ? "text-muted-foreground" : s < needed * 0.5 ? "text-rose-600 dark:text-rose-400" : s < needed ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400";

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  if (editing) return (
    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
      <Input ref={inputRef} type="number" min="0" value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit} onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }} className="h-7 w-20 text-xs text-right px-2" style={{ fontFamily: FONT_MONO }} placeholder="0" />
      <span className="text-[10px] text-muted-foreground">{row.unit}</span>
    </div>
  );

  return (
    <button className="group flex items-center justify-end gap-1.5 w-full hover:opacity-80 transition-opacity" onClick={(e) => { e.stopPropagation(); setDraft(s !== undefined ? String(s) : ""); setEditing(true); }} title="Click to edit stock">
      {s !== undefined ? <span className={`text-sm font-medium ${cls}`} style={{ fontFamily: FONT_MONO }}>{s} {row.unit}</span> : <span className="text-xs text-muted-foreground/50 italic">add stock</span>}
      {pct !== null && (
        <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${s! < needed * 0.5 ? "bg-rose-100/80 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400" : s! < needed ? "bg-amber-100/80 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400" : "bg-emerald-100/80 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"}`} style={{ fontFamily: FONT_MONO }}>{pct}%</span>
      )}
      <span className="opacity-0 group-hover:opacity-50 transition-opacity">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" /></svg>
      </span>
    </button>
  );
}

function AddProductModal({ open, onClose, onAdd, combinedMult }: { open: boolean; onClose: () => void; onAdd: (p: ForecastProduct) => void; combinedMult: number }) {
  const [name, setName] = useState("");
  const [baseQty, setBaseQty] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [unit, setUnit] = useState("kg");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); if (!name.trim() || !baseQty) return;
    const base = parseFloat(baseQty);
    const stock = stockQty.trim() !== "" ? Math.max(0, parseFloat(stockQty) || 0) : undefined;
    onAdd({ id: Date.now(), product: name.trim(), baseNum: base, unit, responsive: true, isNew: true, stock });
    setName(""); setBaseQty(""); setStockQty(""); setUnit("kg"); onClose();
  };

  const forecastNum = baseQty && parseFloat(baseQty) > 0 ? Math.round(parseFloat(baseQty) * combinedMult) : null;
  const stockNum = stockQty.trim() !== "" ? parseFloat(stockQty) : null;
  const coverPct = forecastNum && stockNum !== null ? Math.round((stockNum / forecastNum) * 100) : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: FONT_PLAYFAIR, fontSize: "1.2rem" }}>Add Product</DialogTitle>
          <DialogDescription className="text-xs" style={{ fontFamily: FONT_DISPLAY }}>Forecast applies all active signal multipliers (×{combinedMult.toFixed(2)}).</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="p-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: FONT_DISPLAY }}>Product Name</Label>
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
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-lg border px-3 py-2.5 space-y-1.5" style={{
                background: coverPct !== null && coverPct < 50 ? "rgb(254 242 242 / 0.7)" : coverPct !== null && coverPct < 100 ? "rgb(255 251 235 / 0.7)" : "rgb(240 253 244 / 0.7)",
                borderColor: coverPct !== null && coverPct < 50 ? "rgb(252 165 165 / 0.5)" : coverPct !== null && coverPct < 100 ? "rgb(253 230 138 / 0.5)" : "rgb(167 243 208 / 0.5)"
              }}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground" style={{ fontFamily: FONT_DISPLAY }}>Forecast qty</span>
                  <span className="font-semibold text-primary" style={{ fontFamily: FONT_MONO }}>{forecastNum} {unit} <span className="font-normal opacity-50">(×{combinedMult.toFixed(2)})</span></span>
                </div>
                {coverPct !== null && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground" style={{ fontFamily: FONT_DISPLAY }}>Stock cover</span>
                    <span className={`font-bold ${coverPct < 50 ? "text-rose-600" : coverPct < 100 ? "text-amber-600" : "text-emerald-600"}`} style={{ fontFamily: FONT_MONO }}>{coverPct}% {coverPct < 50 ? "— reorder now" : coverPct < 100 ? "— low stock" : "— adequate"}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" disabled={!name.trim() || !baseQty || parseFloat(baseQty) < 0}><Plus className="w-3.5 h-3.5 mr-1" /> Add to Forecast</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AlertCard({ variant, icon: Icon, title, message, color }: { variant: "warn" | "danger"; icon: React.ComponentType<{ className?: string }>; title: string; message: string; color: string }) {
  const [dismissed, setDismissed] = useState(false);
  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 80, scale: 0.92 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          className={`flex-1 rounded-xl p-2.5 flex items-start gap-2.5 border relative overflow-hidden shadow-sm hover:shadow-md transition-shadow ${variant === "warn" ? "bg-amber-50/60 border-amber-200/60 dark:bg-amber-500/8 dark:border-amber-500/20" : "bg-rose-50/60 border-rose-200/60 dark:bg-rose-500/8 dark:border-rose-500/20"}`}
        >
          <div className={`shrink-0 mt-0.5 p-1.5 rounded-lg ${variant === "warn" ? "bg-amber-100/80 dark:bg-amber-500/15" : "bg-rose-100/80 dark:bg-rose-500/15"}`}>
            <Icon className={`w-3.5 h-3.5 ${color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`text-xs font-semibold ${color}`} style={{ fontFamily: FONT_DISPLAY }}>{title}</h4>
            <p className={`text-[10px] mt-0.5 leading-relaxed opacity-80 ${color}`} style={{ fontFamily: FONT_DISPLAY }}>{message}</p>
          </div>
          <button onClick={() => setDismissed(true)} className="shrink-0 p-1 rounded-md opacity-40 hover:opacity-100 transition-opacity" aria-label="Dismiss">
            <X className={`w-3 h-3 ${color}`} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
