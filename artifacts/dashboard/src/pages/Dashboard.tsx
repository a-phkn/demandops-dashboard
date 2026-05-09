import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, CloudRain, Wallet, AlertTriangle, AlertCircle,
  ArrowUp, ArrowRight, Sun, Moon, X, ChevronDown, ChevronUp,
  ShoppingBasket, TrendingUp, Store, RefreshCw
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTheme } from "@/components/ThemeProvider";

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
  multipliers: number[]; baseNum: number;
};

const forecastData: ForecastRow[] = [
  { id: 1, product: "Sugar", base: "20 kg", final: "45 kg", finalNum: 45, baseNum: 20, unit: "kg", change: "up", multipliers: [1.5, 1.2, 1.25] },
  { id: 2, product: "Ghee", base: "4 kg", final: "8 kg", finalNum: 8, baseNum: 4, unit: "kg", change: "up", multipliers: [1.5, 1.2] },
  { id: 3, product: "Rice", base: "15 kg", final: "32 kg", finalNum: 32, baseNum: 15, unit: "kg", change: "up", risk: "High Risk", multipliers: [1.5, 1.2, 1.25] },
  { id: 4, product: "Bread", base: "10 packs", final: "10 packs", finalNum: 10, baseNum: 10, unit: "packs", change: "neutral", expiry: "Expiry", multipliers: [] },
  { id: 5, product: "Dry Fruits", base: "0 kg", final: "5 kg", finalNum: 5, baseNum: 0, unit: "kg", change: "new", isNew: true, multipliers: [1.5] },
  { id: 6, product: "Atta", base: "25 kg", final: "50 kg", finalNum: 50, baseNum: 25, unit: "kg", change: "up", multipliers: [1.5, 1.2] },
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
  return <span>{displayed} {unit}</span>;
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
                <h3 className="font-semibold text-sm truncate">{signal.name}</h3>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-mono text-xs">
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
              ? "bg-orange-50 border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/25"
              : "bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/25"
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
            <h4 className={`text-sm font-semibold ${color}`}>{title}</h4>
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

function DynamicBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <motion.div
        className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-30 ${
          isDark ? "bg-teal-500/20" : "bg-teal-300/40"
        }`}
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className={`absolute top-1/3 -right-24 w-80 h-80 rounded-full blur-3xl opacity-20 ${
          isDark ? "bg-violet-500/20" : "bg-violet-300/35"
        }`}
        animate={{ x: [0, -25, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
      <motion.div
        className={`absolute -bottom-20 left-1/3 w-72 h-72 rounded-full blur-3xl opacity-20 ${
          isDark ? "bg-orange-500/15" : "bg-orange-200/40"
        }`}
        animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 6 }}
      />
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <div className="absolute top-20 right-40 opacity-[0.04] rotate-12 select-none pointer-events-none">
        <ShoppingBasket className="w-24 h-24" />
      </div>
      <div className="absolute bottom-24 left-24 opacity-[0.04] -rotate-6 select-none pointer-events-none">
        <Store className="w-20 h-20" />
      </div>
      <div className="absolute top-1/2 right-16 opacity-[0.04] rotate-6 select-none pointer-events-none">
        <TrendingUp className="w-16 h-16" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const [lastUpdated, setLastUpdated] = useState("2 mins ago");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated("just now");
    }, 1200);
  };

  const upliftPct = (row: ForecastRow) => {
    if (row.baseNum === 0) return null;
    return Math.round(((row.finalNum - row.baseNum) / row.baseNum) * 100);
  };

  return (
    <div className="relative flex flex-col h-screen max-h-screen bg-background text-foreground overflow-hidden font-sans">
      <DynamicBackground />

      {/* Zone 1 — Filter bar */}
      <header className="relative z-10 flex-none h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center px-5 gap-4 shadow-sm">
        <div className="flex items-center gap-2 text-primary font-bold tracking-tight text-sm shrink-0">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          <span>Demand<span className="text-foreground font-medium">Ops</span></span>
        </div>

        <div className="h-5 w-px bg-border mx-1" />

        <div className="flex items-center gap-3 flex-1">
          <Select defaultValue="andheri" data-testid="select-store">
            <SelectTrigger className="w-[165px] h-8 text-xs bg-background/60 border-border">
              <SelectValue placeholder="Select Store" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="andheri">Andheri West</SelectItem>
              <SelectItem value="bandra">Bandra East</SelectItem>
              <SelectItem value="borivali">Borivali North</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center px-3 h-8 bg-background/60 border border-border rounded-md text-xs font-medium text-foreground/80">
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
          <span className="text-[11px] text-muted-foreground hidden sm:block">
            Updated {lastUpdated}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleRefresh}
            data-testid="btn-refresh"
          >
            <motion.div animate={{ rotate: isRefreshing ? 360 : 0 }} transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}>
              <RefreshCw className="w-3.5 h-3.5" />
            </motion.div>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={toggleTheme}
            data-testid="btn-theme-toggle"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={theme}
                initial={{ rotate: -30, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 30, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </motion.div>
            </AnimatePresence>
          </Button>
        </div>
      </header>

      {/* Zone 2 — Middle section */}
      <main className="relative z-10 flex-1 flex min-h-0">

        {/* Left: Context Panel */}
        <div className="w-72 border-r border-border bg-sidebar/60 backdrop-blur-sm p-4 flex flex-col gap-4 overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Active Signals</h2>
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{signals.length} live</Badge>
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
                <span className="text-xs font-semibold text-primary">Combined Uplift</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                3 active signals pushing combined demand up to <span className="font-semibold text-foreground">×2.25</span> for eligible products.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Forecast Table */}
        <div className="flex-1 p-5 flex flex-col min-h-0 bg-background/40 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Today's Forecast</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Hover final quantities for multiplier breakdown · Click rows to pin</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-card/80 border border-border rounded-lg px-3 py-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto rounded-xl border border-border shadow-sm bg-card/80 backdrop-blur-sm">
            <Table>
              <TableHeader className="sticky top-0 z-10">
                <TableRow className="border-border hover:bg-transparent bg-muted/50">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Base Qty</TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Final Qty</TableHead>
                  <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground w-24">Uplift</TableHead>
                  <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground w-16">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forecastData.map((row, index) => {
                  const pct = upliftPct(row);
                  const isSelected = selectedRow === row.id;
                  return (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06, type: "spring", stiffness: 300, damping: 28 }}
                      className={`border-border transition-colors cursor-pointer table-row ${
                        isSelected
                          ? "bg-primary/5 hover:bg-primary/8"
                          : "hover:bg-muted/40"
                      }`}
                      onClick={() => setSelectedRow(isSelected ? null : row.id)}
                      data-testid={`row-product-${row.id}`}
                    >
                      <TableCell className="font-medium text-sm py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span>{row.product}</span>
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
                      <TableCell className="text-right text-sm text-muted-foreground py-3">
                        {row.base}
                      </TableCell>
                      <TableCell className="text-right py-3">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span
                              className="font-mono font-semibold text-sm cursor-help border-b border-dashed border-primary/40 pb-0.5 text-foreground hover:text-primary transition-colors"
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
                                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Multiplier Breakdown</p>
                                <div className="flex items-center flex-wrap gap-1.5 text-xs">
                                  <span className="text-muted-foreground text-[11px]">Base</span>
                                  <span className="font-mono font-medium">{row.base}</span>
                                  {row.multipliers.map((m) => (
                                    <span key={m} className="flex items-center gap-1">
                                      <span className="text-muted-foreground">×</span>
                                      <Badge variant="outline" className={`font-mono text-[10px] h-5 px-1.5 ${multiplierMeta[m]?.colorClass}`}>
                                        {multiplierMeta[m]?.label}
                                      </Badge>
                                    </span>
                                  ))}
                                  <span className="text-muted-foreground">=</span>
                                  <span className="font-mono font-bold text-primary">{row.finalNum} {row.unit}</span>
                                </div>
                              </div>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="text-center py-3">
                        {pct !== null ? (
                          <span className={`text-xs font-semibold font-mono ${
                            pct > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                          }`}>
                            {pct > 0 ? `+${pct}%` : `${pct}%`}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground font-mono">—</span>
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
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      {/* Zone 3 — Alerts strip */}
      <footer className="relative z-10 flex-none border-t border-border bg-card/70 backdrop-blur-sm px-5 py-3 flex gap-3">
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
    </div>
  );
}
