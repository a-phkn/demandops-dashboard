import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, CloudRain, Wallet, AlertTriangle, AlertCircle,
  ArrowUp, ArrowRight, Sun, Moon, X, ChevronDown, ChevronUp,
  TrendingUp, RefreshCw, MapPin, Plus, Loader2
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

const FONT_SYNE = "'Syne', sans-serif";
const FONT_PLAYFAIR = "'Playfair Display', serif";
const FONT_MONO = "'DM Mono', monospace";

const signals = [
  {
    id: 1, icon: Flame, name: "Diwali Festival", desc: "8 days away",
    multiplier: 1.5, color: "text-orange-500 dark:text-orange-400",
    bg: "bg-orange-100 dark:bg-orange-500/15",
    detail: "Festival demand historically drives 40–60% uplift across sweets, snacks, and staples."
  },
  {
    id: 2, icon: CloudRain, name: "Rain Forecast", desc: "today",
    multiplier: 1.2, color: "text-sky-500 dark:text-sky-400",
    bg: "bg-sky-100 dark:bg-sky-500/15",
    detail: "Rain suppresses footfall but increases per-visit basket size by ~20%."
  },
  {
    id: 3, icon: Wallet, name: "Salary Week", desc: "this week",
    multiplier: 1.25, color: "text-violet-500 dark:text-violet-400",
    bg: "bg-violet-100 dark:bg-violet-500/15",
    detail: "First week of month shows 25% demand surge across all FMCG categories."
  },
];

type ForecastRow = {
  id: number; product: string; base: string; final: string; finalNum: number;
  unit: string; change: string; risk?: string; expiry?: string; isNew?: boolean;
  multipliers: number[]; baseNum: number; stock?: number;
};

const INITIAL_ROWS: ForecastRow[] = [
  { id: 1, product: "Sugar",      base: "20 kg",     final: "45 kg",     finalNum: 45, baseNum: 20, unit: "kg",    change: "up",      multipliers: [1.5, 1.2, 1.25], stock: 30 },
  { id: 2, product: "Ghee",       base: "4 kg",      final: "8 kg",      finalNum: 8,  baseNum: 4,  unit: "kg",    change: "up",      multipliers: [1.5, 1.2],        stock: 12 },
  { id: 3, product: "Rice",       base: "15 kg",     final: "32 kg",     finalNum: 32, baseNum: 15, unit: "kg",    change: "up",      risk: "High Risk", multipliers: [1.5, 1.2, 1.25], stock: 8 },
  { id: 4, product: "Bread",      base: "10 packs",  final: "10 packs",  finalNum: 10, baseNum: 10, unit: "packs", change: "neutral", expiry: "Expiry",  multipliers: [] },
  { id: 5, product: "Dry Fruits", base: "0 kg",      final: "5 kg",      finalNum: 5,  baseNum: 0,  unit: "kg",    change: "new",     isNew: true,       multipliers: [1.5] },
  { id: 6, product: "Atta",       base: "25 kg",     final: "50 kg",     finalNum: 50, baseNum: 25, unit: "kg",    change: "up",      multipliers: [1.5, 1.2],        stock: 55 },
];

const multiplierMeta: Record<number, { label: string; colorClass: string }> = {
  1.5:  { label: "Festival ×1.5",  colorClass: "bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/20" },
  1.2:  { label: "Rain ×1.2",      colorClass: "bg-sky-100 text-sky-600 border-sky-200 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/20" },
  1.25: { label: "Salary ×1.25",   colorClass: "bg-violet-100 text-violet-600 border-violet-200 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/20" },
};

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const frameRef = useRef<number>(0);
  useEffect(() => {
    startTime.current = null;
    const animate = (ts: number) => {
      if (!startTime.current) startTime.current = ts;
      const progress = Math.min((ts - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);
  return value;
}

function AnimatedNumber({ value, unit }: { value: number; unit: string }) {
  const displayed = useCountUp(value);
  return <span style={{ fontFamily: FONT_MONO }}>{displayed} {unit}</span>;
}

function SignalCard({ signal }: { signal: typeof signals[0] }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = signal.icon;
  return (
    <motion.div layout transition={{ duration: 0.22 }}>
      <Card
        className="border-border shadow-sm cursor-pointer select-none transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]"
        onClick={() => setExpanded((v) => !v)}
        data-testid={`signal-card-${signal.id}`}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 p-2 rounded-lg ${signal.bg} ${signal.color} shrink-0`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-sm truncate" style={{ fontFamily: FONT_SYNE }}>{signal.name}</h3>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs" style={{ fontFamily: FONT_MONO }}>
                    ×{signal.multiplier}
                  </Badge>
                  <span className={`transition-transform duration-200 ${signal.color} ${expanded ? "rotate-180" : ""}`}>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{signal.desc}</p>
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
                <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border leading-relaxed">
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

function AlertCard({ variant, icon: Icon, title, message, color }: {
  variant: "warn" | "danger"; icon: typeof AlertTriangle; title: string; message: string; color: string;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [hovered, setHovered] = useState(false);
  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: 80, scale: 0.92 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          className={`flex-1 rounded-xl p-3 flex items-start gap-3 border relative overflow-hidden transition-shadow duration-200 ${
            variant === "warn"
              ? "bg-orange-50/80 border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/25"
              : "bg-rose-50/80 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/25"
          } ${hovered ? "shadow-md" : "shadow-sm"}`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          data-testid={`alert-${variant}`}
        >
          <div className={`shrink-0 mt-0.5 p-1.5 rounded-lg ${
            variant === "warn" ? "bg-orange-100 dark:bg-orange-500/20" : "bg-rose-100 dark:bg-rose-500/20"
          }`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-semibold ${color}`} style={{ fontFamily: FONT_SYNE }}>{title}</h4>
            <p className={`text-xs mt-0.5 leading-relaxed opacity-80 ${color}`}>{message}</p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 p-1 rounded-md opacity-50 hover:opacity-100 transition-opacity"
            data-testid={`dismiss-alert-${variant}`}
            aria-label="Dismiss alert"
          >
            <X className={`w-3.5 h-3.5 ${color}`} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const MARKET_SHAPES = [
  {
    id: "cart",
    viewBox: "0 0 24 24",
    d: "M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6M10 17a1 1 0 1 0 2 0 1 1 0 0 0-2 0M16 17a1 1 0 1 0 2 0 1 1 0 0 0-2 0",
    size: 58, top: "14%", left: "7%",
    ax: [0, 22, 6, 0], ay: [0, 14, -4, 0], dur: 28, rot: -10,
  },
  {
    id: "tag",
    viewBox: "0 0 24 24",
    d: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01",
    size: 48, top: "52%", right: "8%",
    ax: [0, -18, -4, 0], ay: [0, 22, 6, 0], dur: 34, rot: 14,
  },
  {
    id: "scale",
    viewBox: "0 0 24 24",
    d: "M12 3v18M7 7l5 2 5-2M3 17l4-4 2 3 3-4 2 3 4-4M7 21h10",
    size: 54, bottom: "26%", left: "52%",
    ax: [0, 12, -6, 0], ay: [0, -16, -2, 0], dur: 30, rot: 6,
  },
  {
    id: "leaf",
    viewBox: "0 0 24 24",
    d: "M17 8C17 8 8 4 3 9C3 9 4 19 12 21C20 19 21 9 17 8ZM12 21V12",
    size: 44, top: "36%", left: "38%",
    ax: [0, 16, 4, 0], ay: [0, 20, -2, 0], dur: 37, rot: -18,
  },
  {
    id: "coin",
    viewBox: "0 0 24 24",
    d: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM8.5 9h7M8.5 13H14M14 13L10.5 18M11 9a3 3 0 0 1 0 4",
    size: 50, bottom: "28%", right: "20%",
    ax: [0, -14, 4, 0], ay: [0, -18, 8, 0], dur: 40, rot: 0,
  },
  {
    id: "basket",
    viewBox: "0 0 24 24",
    d: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0",
    size: 52, top: "68%", left: "18%",
    ax: [0, 10, -8, 0], ay: [0, -12, 4, 0], dur: 32, rot: 8,
  },
];

function DynamicBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const baseFill = isDark ? "hsl(220,28%,12%)" : "hsl(210,40%,97%)";
  const shapeStroke = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.07)";

  const orbs = [
    {
      color: isDark ? "rgba(20,184,166,0.55)" : "rgba(13,148,136,0.50)",
      top: "0%", left: "5%", w: 560,
      ax: [0, 60, 10, 0], ay: [0, 40, -10, 0], dur: 13,
    },
    {
      color: isDark ? "rgba(139,92,246,0.50)" : "rgba(109,40,217,0.44)",
      top: "22%", right: "3%", w: 500,
      ax: [0, -55, -10, 0], ay: [0, 50, 10, 0], dur: 17, delay: 3,
    },
    {
      color: isDark ? "rgba(251,146,60,0.45)" : "rgba(234,88,12,0.42)",
      bottom: "4%", left: "30%", w: 460,
      ax: [0, 45, -5, 0], ay: [0, -45, 5, 0], dur: 15, delay: 6,
    },
    {
      color: isDark ? "rgba(52,211,153,0.38)" : "rgba(16,185,129,0.35)",
      bottom: "8%", left: "-4%", w: 380,
      ax: [0, 35, 5, 0], ay: [0, -30, -5, 0], dur: 20, delay: 9,
    },
  ];

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, backgroundColor: baseFill, pointerEvents: "none" }} aria-hidden />

      <div style={{ position: "fixed", inset: 0, zIndex: 1, overflow: "hidden", pointerEvents: "none" }} aria-hidden>
        {orbs.map((orb, i) => (
          <motion.div
            key={i}
            style={{
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

        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: isDark ? 0.07 : 0.055 }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.3" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        {MARKET_SHAPES.map((shape) => (
          <motion.div
            key={shape.id}
            style={{
              position: "absolute",
              top: (shape as any).top,
              bottom: (shape as any).bottom,
              left: (shape as any).left,
              right: (shape as any).right,
              rotate: shape.rot,
            }}
            animate={{ x: shape.ax, y: shape.ay, rotate: [shape.rot, shape.rot + 4, shape.rot - 3, shape.rot] }}
            transition={{ duration: shape.dur, repeat: Infinity, ease: "easeInOut", times: [0, 0.33, 0.66, 1] }}
          >
            <svg
              width={shape.size}
              height={shape.size}
              viewBox={shape.viewBox}
              fill="none"
              stroke={shapeStroke}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={shape.d} />
            </svg>
          </motion.div>
        ))}
      </div>
    </>
  );
}

function StockCell({ row, onUpdate }: {
  row: ForecastRow;
  onUpdate: (id: number, stock: number | undefined) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(row.stock !== undefined ? String(row.stock) : "");
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = () => {
    const val = draft.trim();
    onUpdate(row.id, val === "" ? undefined : Math.max(0, parseFloat(val) || 0));
    setEditing(false);
  };

  const stockNum = row.stock;
  const needed = row.finalNum;
  const pctCover = stockNum !== undefined && needed > 0 ? Math.round((stockNum / needed) * 100) : null;
  const coverClass =
    stockNum === undefined ? "text-muted-foreground" :
    stockNum < needed * 0.5 ? "text-rose-600 dark:text-rose-400" :
    stockNum < needed ? "text-amber-600 dark:text-amber-400" :
    "text-emerald-600 dark:text-emerald-400";

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  if (editing) {
    return (
      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
        <Input
          ref={inputRef}
          type="number"
          min="0"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
          className="h-7 w-20 text-xs text-right px-2"
          style={{ fontFamily: FONT_MONO }}
          placeholder="0"
        />
        <span className="text-[10px] text-muted-foreground">{row.unit}</span>
      </div>
    );
  }

  return (
    <button
      className="group flex items-center justify-end gap-1.5 w-full hover:opacity-80 transition-opacity"
      onClick={(e) => { e.stopPropagation(); setDraft(stockNum !== undefined ? String(stockNum) : ""); setEditing(true); }}
      title="Click to edit stock"
    >
      {stockNum !== undefined ? (
        <span className={`text-sm font-medium ${coverClass}`} style={{ fontFamily: FONT_MONO }}>
          {stockNum} {row.unit}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground/50 italic">add stock</span>
      )}
      {pctCover !== null && (
        <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${
          stockNum! < needed * 0.5
            ? "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
            : stockNum! < needed
            ? "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
            : "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
        }`} style={{ fontFamily: FONT_MONO }}>
          {pctCover}%
        </span>
      )}
      <span className="opacity-0 group-hover:opacity-50 transition-opacity">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
        </svg>
      </span>
    </button>
  );
}

function AddProductModal({ open, onClose, onAdd }: {
  open: boolean;
  onClose: () => void;
  onAdd: (row: ForecastRow) => void;
}) {
  const [name, setName] = useState("");
  const [baseQty, setBaseQty] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [unit, setUnit] = useState("kg");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !baseQty) return;
    const base = parseFloat(baseQty);
    const mults = [1.5, 1.2, 1.25];
    const finalNum = Math.round(base * mults.reduce((a, b) => a * b, 1));
    const stock = stockQty.trim() !== "" ? Math.max(0, parseFloat(stockQty) || 0) : undefined;
    const newRow: ForecastRow = {
      id: Date.now(),
      product: name.trim(),
      base: `${base} ${unit}`,
      final: `${finalNum} ${unit}`,
      finalNum, baseNum: base, unit, stock,
      change: finalNum > base ? "up" : "neutral",
      multipliers: mults,
      isNew: true,
    };
    onAdd(newRow);
    setName(""); setBaseQty(""); setStockQty(""); setUnit("kg");
    onClose();
  };

  const forecastNum = baseQty && parseFloat(baseQty) > 0
    ? Math.round(parseFloat(baseQty) * 1.5 * 1.2 * 1.25) : null;
  const stockNum = stockQty.trim() !== "" ? parseFloat(stockQty) : null;
  const coverPct = forecastNum && stockNum !== null ? Math.round((stockNum / forecastNum) * 100) : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: FONT_PLAYFAIR, fontSize: "1.2rem" }}>Add Product</DialogTitle>
          <DialogDescription className="text-xs">
            Add a new item — forecast applies all active signal multipliers.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="p-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product Name</Label>
            <Input id="p-name" placeholder="e.g. Mustard Oil" value={name} onChange={(e) => setName(e.target.value)} autoFocus className="h-9" />
          </div>

          <div className="flex gap-3">
            <div className="space-y-1.5 flex-1">
              <Label htmlFor="p-qty" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Base Qty</Label>
              <Input id="p-qty" type="number" min="0" placeholder="10" value={baseQty} onChange={(e) => setBaseQty(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5 flex-1">
              <Label htmlFor="p-stock" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Stock</Label>
              <Input id="p-stock" type="number" min="0" placeholder="optional" value={stockQty} onChange={(e) => setStockQty(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="w-20 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
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
              <motion.div
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="rounded-lg border px-3 py-2.5 space-y-1.5"
                style={{
                  background: coverPct !== null && coverPct < 50 ? "rgb(254 242 242 / 0.7)" :
                    coverPct !== null && coverPct < 100 ? "rgb(255 251 235 / 0.7)" :
                    "rgb(240 253 244 / 0.7)",
                  borderColor: coverPct !== null && coverPct < 50 ? "rgb(252 165 165 / 0.5)" :
                    coverPct !== null && coverPct < 100 ? "rgb(253 230 138 / 0.5)" :
                    "rgb(167 243 208 / 0.5)",
                }}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Forecast qty</span>
                  <span className="font-semibold text-primary" style={{ fontFamily: FONT_MONO }}>
                    {forecastNum} {unit} <span className="font-normal opacity-50">(×2.25)</span>
                  </span>
                </div>
                {coverPct !== null && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Stock cover</span>
                    <span
                      className={`font-bold ${coverPct < 50 ? "text-rose-600" : coverPct < 100 ? "text-amber-600" : "text-emerald-600"}`}
                      style={{ fontFamily: FONT_MONO }}
                    >
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

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const [lastUpdated, setLastUpdated] = useState("2 mins ago");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [forecastRows, setForecastRows] = useState<ForecastRow[]>(INITIAL_ROWS);
  const [showAddModal, setShowAddModal] = useState(false);

  const updateStock = (id: number, stock: number | undefined) => {
    setForecastRows((prev) => prev.map((r) => r.id === id ? { ...r, stock } : r));
  };
  const [storeLabel, setStoreLabel] = useState("Andheri West");
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsUsed, setGpsUsed] = useState(false);

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
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const area =
            data.address?.suburb ||
            data.address?.neighbourhood ||
            data.address?.city_district ||
            data.address?.city ||
            "Current Location";
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

  return (
    <div className="relative flex flex-col h-screen max-h-screen text-foreground overflow-hidden" style={{ zIndex: 2 }}>

      {/* Zone 1 — Header */}
      <header className="relative z-10 flex-none h-14 border-b border-border bg-white/20 dark:bg-black/25 backdrop-blur-md flex items-center px-5 gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          <span style={{ fontFamily: FONT_SYNE, fontWeight: 800, fontSize: "0.95rem", letterSpacing: "-0.02em" }}>
            <span className="text-primary">Demand</span>
            <span className="text-foreground/80">Ops</span>
          </span>
        </div>

        <div className="h-5 w-px bg-border mx-1" />

        <div className="flex items-center gap-2.5 flex-1">
          <div className="flex items-center gap-1.5 px-3 h-8 bg-background/60 border border-border rounded-md text-xs font-medium">
            <MapPin className="w-3 h-3 text-primary shrink-0" />
            <span className="truncate max-w-[120px]">{storeLabel}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2.5 text-xs gap-1.5"
            onClick={handleGps}
            disabled={isGpsLoading}
            title="Detect location via GPS"
          >
            {isGpsLoading
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : <MapPin className={`w-3 h-3 ${gpsUsed ? "text-primary" : "text-muted-foreground"}`} />
            }
            {isGpsLoading ? "Locating…" : "Use GPS"}
          </Button>

          <div className="h-4 w-px bg-border" />

          <div className="flex items-center px-3 h-8 bg-background/60 border border-border rounded-md text-xs font-medium text-foreground/80" style={{ fontFamily: FONT_MONO }}>
            May 9, 2026
          </div>

          <Select defaultValue="urban" data-testid="select-area">
            <SelectTrigger className="w-[130px] h-8 text-xs bg-background/60 border-border">
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
          <span className="text-[11px] text-muted-foreground hidden sm:block">Updated {lastUpdated}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRefresh} data-testid="btn-refresh">
            <motion.div animate={{ rotate: isRefreshing ? 360 : 0 }} transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}>
              <RefreshCw className="w-3.5 h-3.5" />
            </motion.div>
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={toggleTheme} data-testid="btn-theme-toggle" aria-label="Toggle theme">
            <AnimatePresence mode="wait">
              <motion.div key={theme} initial={{ rotate: -30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 30, opacity: 0 }} transition={{ duration: 0.15 }}>
                {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </motion.div>
            </AnimatePresence>
          </Button>
        </div>
      </header>

      {/* Zone 2 — Middle */}
      <main className="relative z-10 flex-1 flex min-h-0">

        {/* Left: Context Panel */}
        <div className="w-72 border-r border-border bg-white/25 dark:bg-black/30 backdrop-blur-md p-4 flex flex-col gap-4 overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2
                className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest"
                style={{ fontFamily: FONT_SYNE, letterSpacing: "0.1em" }}
              >
                Active Signals
              </h2>
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5" style={{ fontFamily: FONT_MONO }}>{signals.length} live</Badge>
            </div>
            <div className="flex flex-col gap-2">
              {signals.map((signal) => (
                <SignalCard key={signal.id} signal={signal} />
              ))}
            </div>
          </div>

          <div className="mt-auto pt-2 border-t border-border">
            <div className="p-3 rounded-xl bg-primary/8 border border-primary/15">
              <div className="flex items-center gap-2 mb-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary" style={{ fontFamily: FONT_SYNE }}>Combined Uplift</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                3 active signals pushing combined demand up to{" "}
                <span className="font-semibold text-foreground" style={{ fontFamily: FONT_MONO }}>×2.25</span> for eligible products.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Forecast Table */}
        <div className="flex-1 p-5 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 style={{ fontFamily: FONT_PLAYFAIR, fontWeight: 700, fontSize: "1.35rem", letterSpacing: "-0.01em" }}>
                Today's Forecast
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">Hover final quantities for multiplier breakdown · Click rows to pin</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => setShowAddModal(true)}
                data-testid="btn-add-product"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Product
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
                      style={{ fontFamily: FONT_SYNE, letterSpacing: "0.08em" }}
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence initial={false}>
                  {forecastRows.map((row, index) => {
                    const pct = upliftPct(row);
                    const isSelected = selectedRow === row.id;
                    return (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 28 }}
                        className={`border-border transition-colors cursor-pointer table-row ${
                          isSelected ? "bg-primary/5 hover:bg-primary/8" : "hover:bg-white/20 dark:hover:bg-white/5"
                        }`}
                        onClick={() => setSelectedRow(isSelected ? null : row.id)}
                        data-testid={`row-product-${row.id}`}
                      >
                        <TableCell className="py-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{row.product}</span>
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
                                data-testid={`qty-${row.product.toLowerCase().replace(" ", "-")}`}
                              >
                                <AnimatedNumber value={row.finalNum} unit={row.unit} />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="bg-popover border border-border p-3.5 max-w-xs shadow-xl rounded-xl" sideOffset={8}>
                              {row.multipliers.length === 0 ? (
                                <p className="text-xs text-muted-foreground">No multipliers applied — quantity unchanged.</p>
                              ) : (
                                <div className="space-y-2.5">
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest" style={{ fontFamily: FONT_SYNE }}>
                                    Multiplier Breakdown
                                  </p>
                                  <div className="flex items-center flex-wrap gap-1.5 text-xs">
                                    <span className="text-muted-foreground text-[11px]">Base</span>
                                    <span style={{ fontFamily: FONT_MONO }} className="font-medium">{row.base}</span>
                                    {row.multipliers.map((m) => (
                                      <span key={m} className="flex items-center gap-1">
                                        <span className="text-muted-foreground">×</span>
                                        <Badge variant="outline" className={`text-[10px] h-5 px-1.5 ${multiplierMeta[m]?.colorClass}`} style={{ fontFamily: FONT_MONO }}>
                                          {multiplierMeta[m]?.label}
                                        </Badge>
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

      {/* Zone 3 — Alerts */}
      <footer className="relative z-10 flex-none border-t border-border bg-white/25 dark:bg-black/30 backdrop-blur-md px-5 py-3 flex gap-3">
        <AlertCard
          variant="warn"
          icon={AlertTriangle}
          title="Bread — Expiry Warning"
          message="8 packs expire in 2 days. Consider running a discount or returning stock."
          color="text-amber-600 dark:text-amber-400"
        />
        <AlertCard
          variant="danger"
          icon={AlertCircle}
          title="Rice — HIGH Stockout Risk"
          message="Current stock covers 4 days. Festival peak starts in 8 days. Reorder now."
          color="text-rose-600 dark:text-rose-400"
        />
      </footer>

      <DynamicBackground />

      <AddProductModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(row) => setForecastRows((prev) => [...prev, row])}
      />
    </div>
  );
}
