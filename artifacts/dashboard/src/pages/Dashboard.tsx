import React from "react";
import { motion } from "framer-motion";
import { Flame, CloudRain, Wallet, AlertTriangle, AlertCircle, ArrowUp, ArrowRight, ArrowDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const signals = [
  { id: 1, icon: Flame, name: "Diwali Festival", desc: "8 days away", multiplier: 1.5, color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: 2, icon: CloudRain, name: "Rain forecast", desc: "today", multiplier: 1.2, color: "text-blue-400", bg: "bg-blue-400/10" },
  { id: 3, icon: Wallet, name: "Salary week", desc: "this week", multiplier: 1.25, color: "text-emerald-400", bg: "bg-emerald-400/10" },
];

const forecastData = [
  { id: 1, product: "Sugar", base: "20 kg", final: "45 kg", finalNum: 45, unit: "kg", change: "up", multipliers: [1.5, 1.2, 1.25] },
  { id: 2, product: "Ghee", base: "4 kg", final: "8 kg", finalNum: 8, unit: "kg", change: "up", multipliers: [1.5, 1.2] },
  { id: 3, product: "Rice", base: "15 kg", final: "32 kg", finalNum: 32, unit: "kg", change: "up", risk: "High Risk", multipliers: [1.5, 1.2, 1.25] },
  { id: 4, product: "Bread", base: "10 packs", final: "10 packs", finalNum: 10, unit: "packs", change: "neutral", expiry: "Expiry", multipliers: [] },
  { id: 5, product: "Dry Fruits", base: "0 kg", final: "5 kg", finalNum: 5, unit: "kg", change: "new", isNew: true, multipliers: [1.5] },
  { id: 6, product: "Atta", base: "25 kg", final: "50 kg", finalNum: 50, unit: "kg", change: "up", multipliers: [1.5, 1.2] },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  return (
    <div className="flex flex-col h-screen max-h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Zone 1 — Filter bar */}
      <header className="flex-none h-16 border-b border-border bg-card/50 flex items-center px-6 gap-6">
        <div className="flex items-center gap-2 text-primary font-semibold tracking-tight uppercase text-sm">
          <div className="w-6 h-6 bg-primary rounded-[4px] flex items-center justify-center">
            <span className="text-primary-foreground leading-none mb-[1px]">D</span>
          </div>
          Demand<span className="text-foreground">Ops</span>
        </div>
        
        <div className="h-6 w-[1px] bg-border mx-2" />

        <div className="flex items-center gap-4 flex-1">
          <Select defaultValue="andheri" data-testid="select-store">
            <SelectTrigger className="w-[180px] bg-input/50 border-border">
              <SelectValue placeholder="Select Store" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="andheri">Andheri West</SelectItem>
              <SelectItem value="bandra">Bandra East</SelectItem>
              <SelectItem value="borivali">Borivali North</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center px-3 py-2 bg-input/50 border border-border rounded-md text-sm font-medium">
            May 9, 2026
          </div>

          <Select defaultValue="urban" data-testid="select-area">
            <SelectTrigger className="w-[140px] bg-input/50 border-border">
              <SelectValue placeholder="Area Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="urban">Urban</SelectItem>
              <SelectItem value="semi-urban">Semi-Urban</SelectItem>
              <SelectItem value="rural">Rural</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center text-xs text-muted-foreground">
          Last updated: 2 mins ago
        </div>
      </header>

      {/* Zone 2 — Middle section */}
      <main className="flex-1 flex min-h-0">
        
        {/* Left: Context Panel */}
        <div className="w-80 border-r border-border bg-sidebar/30 p-6 flex flex-col gap-6 overflow-y-auto">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Active Signals</h2>
            <div className="flex flex-col gap-3">
              {signals.map((signal) => (
                <Card key={signal.id} className="bg-card/50 border-border p-4 shadow-none">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 p-2 rounded-md ${signal.bg} ${signal.color}`}>
                      <signal.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">{signal.name}</h3>
                        <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20 hover:bg-primary/20">
                          ×{signal.multiplier}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{signal.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          
          <div className="mt-auto">
            <div className="p-4 rounded-md bg-accent/30 border border-border">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Baseline data trained on previous 45 days. Multipliers applied sequentially.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Forecast Table */}
        <div className="flex-1 p-6 bg-background flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Today's Forecast</h1>
              <p className="text-sm text-muted-foreground mt-1">Projected end-of-day demand with active multipliers.</p>
            </div>
          </div>

          <div className="flex-1 overflow-auto border border-border rounded-md">
            <Table>
              <TableHeader className="bg-card sticky top-0 z-10">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-[200px]">Product</TableHead>
                  <TableHead className="text-right">Base Qty</TableHead>
                  <TableHead className="text-right">Final Qty</TableHead>
                  <TableHead className="w-[100px] text-center">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {forecastData.map((row, index) => (
                    <motion.tr 
                      key={row.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted table-row"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {row.product}
                          {row.risk && <Badge variant="destructive" className="h-5 px-1.5 text-[10px] uppercase font-bold">{row.risk}</Badge>}
                          {row.expiry && <Badge variant="outline" className="h-5 px-1.5 text-[10px] uppercase font-bold border-amber-500/50 text-amber-500">{row.expiry}</Badge>}
                          {row.isNew && <Badge className="h-5 px-1.5 text-[10px] uppercase font-bold bg-amber-500 text-amber-950 hover:bg-amber-500">NEW</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {row.base}
                      </TableCell>
                      <TableCell className="text-right">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="font-mono font-medium text-[15px] cursor-help border-b border-dashed border-primary/50 pb-0.5" data-testid={`qty-${row.product.toLowerCase().replace(' ', '-')}`}>
                              {row.final}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="bg-popover border border-border p-3 max-w-sm shadow-xl" sideOffset={10}>
                            <div className="flex items-center flex-wrap gap-2 text-sm">
                              <span className="text-muted-foreground">Base</span>
                              <span className="font-mono">{row.base}</span>
                              
                              {row.multipliers.includes(1.5) && (
                                <>
                                  <span className="text-muted-foreground">×</span>
                                  <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-mono">Fest ×1.5</Badge>
                                </>
                              )}
                              {row.multipliers.includes(1.2) && (
                                <>
                                  <span className="text-muted-foreground">×</span>
                                  <Badge variant="outline" className="bg-blue-400/10 text-blue-400 border-blue-400/20 font-mono">Rain ×1.2</Badge>
                                </>
                              )}
                              {row.multipliers.includes(1.25) && (
                                <>
                                  <span className="text-muted-foreground">×</span>
                                  <Badge variant="outline" className="bg-emerald-400/10 text-emerald-400 border-emerald-400/20 font-mono">Sal ×1.25</Badge>
                                </>
                              )}
                              
                              <span className="text-muted-foreground">=</span>
                              <span className="font-mono font-bold text-primary">{row.finalNum} {row.unit}</span>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          {row.change === "up" && <ArrowUp className="w-4 h-4 text-emerald-500" />}
                          {row.change === "neutral" && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                          {row.change === "new" && <ArrowUp className="w-4 h-4 text-amber-500" />}
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      {/* Zone 3 — Alerts strip */}
      <footer className="flex-none h-24 border-t border-border bg-card/80 p-3 flex gap-3 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex-1 bg-amber-500/10 border border-amber-500/20 rounded-md p-3 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-amber-500">Warning: Bread Expiry</h4>
            <p className="text-xs text-amber-500/80 mt-1">8 packs expire in 2 days. Consider running a discount or returning stock.</p>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex-1 bg-destructive/10 border border-destructive/20 rounded-md p-3 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-destructive">Danger: Rice Stockout Risk</h4>
            <p className="text-xs text-destructive/80 mt-1">HIGH stockout risk before Diwali. Current stock covers 4 days, festival peak starts in 8 days. Reorder now.</p>
          </div>
        </motion.div>
      </footer>
    </div>
  );
}