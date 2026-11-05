"use client";

import React from "react";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  ShieldAlert,
  Printer,
  FileSpreadsheet,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
            <span className="text-xs font-mono uppercase text-red-400 tracking-wider">
              Financial & Audit Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 uppercase">
            Reports & Valuation Ledgers
          </h1>
          <p className="text-xs text-zinc-400 font-mono">
            Auditable FIFO inventory valuation schedules and Sindh Weights & Measures regulatory tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 text-xs font-mono">
            <Printer className="w-3.5 h-3.5" />
            Print Schedule
          </Button>
          <Button variant="cyber" size="sm" className="gap-2 text-xs font-mono">
            <Download className="w-3.5 h-3.5" />
            Export Audit CSV
          </Button>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-zinc-800 bg-zinc-950/80">
          <CardHeader className="p-5 border-b border-zinc-850">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-200 flex items-center justify-between">
              <span>FIFO Stock Valuation By Category</span>
              <BarChart3 className="w-4 h-4 text-red-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 font-mono text-xs">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span>Weighing Indicators (D-900s, D-60)</span>
                  <span className="font-bold text-red-400">PKR 880,500</span>
                </div>
                <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-red-600 rounded-full" style={{ width: "36.5%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span>Load Cells (S-Type 5T, Truck Scale)</span>
                  <span className="font-bold text-red-400">PKR 524,000</span>
                </div>
                <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-red-700 rounded-full" style={{ width: "21.7%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span>Platform Scales (500x600 300kg)</span>
                  <span className="font-bold text-red-400">PKR 702,000</span>
                </div>
                <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-red-800 rounded-full" style={{ width: "29.1%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span>Calibration Weights & Standards</span>
                  <span className="font-bold text-red-400">PKR 304,000</span>
                </div>
                <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-700 rounded-full" style={{ width: "12.7%" }} />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-850 flex justify-between text-sm">
              <span className="text-zinc-400">Total Net Inventory Valuation:</span>
              <span className="font-bold text-zinc-100 mono-numbers">PKR 2,410,500</span>
            </div>
          </CardContent>
        </Card>


        <Card className="border-zinc-800 bg-zinc-950/80">
          <CardHeader className="p-5 border-b border-zinc-850">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-200 flex items-center justify-between">
              <span>Govt. of Sindh Re-Verification Schedule</span>
              <ShieldAlert className="w-4 h-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3 font-mono text-xs">
            <div className="p-3 rounded-lg border border-zinc-850 bg-zinc-900/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-200">Lucky Cement Ltd (Karachi)</span>
                <Badge variant="cyberGreen" className="text-[9px]">
                  VALID (340 DAYS)
                </Badge>
              </div>
              <div className="text-[11px] text-zinc-400">
                Equipment: 500x600 Platform Scale | Cert: US-CAL-SINDH-2026-089
              </div>
              <div className="text-[10px] text-zinc-500">
                Next Sindh Re-verification due: 14 October 2027
              </div>
            </div>

            <div className="p-3 rounded-lg border border-amber-900/40 bg-zinc-900/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-200">National Foods (SITE Karachi)</span>
                <Badge variant="cyberAmber" className="text-[9px]">
                  DUE IN 28 DAYS
                </Badge>
              </div>
              <div className="text-[11px] text-zinc-400">
                Equipment: Precision Bench Scale 30kg | Cert: US-CAL-SINDH-2025-412
              </div>
              <div className="text-[10px] text-zinc-500">
                Next Sindh Re-verification due: 03 December 2026
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

