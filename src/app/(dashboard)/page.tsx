"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Boxes,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Warehouse,
  ShieldCheck,
  Cpu,
  Radio,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  FileCheck2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const initialHardware = [
  {
    sku: "IND-D900S-LCD",
    name: "D-900s LCD Indicator",
    brand: "Yaohua / United Scale",
    category: "Weighing Indicators",
    totalStock: 33,
    activeLayers: 2,
    oldestCost: 18500,
    newestCost: 19800,
    sellingPrice: 24500,
    rs232: "Active (9600-8-N-1)",
    status: "OPTIMAL",
  },
  {
    sku: "LC-STYPE-5T",
    name: "S-Type Load Cell",
    brand: "Omega",
    category: "Load Cells",
    totalStock: 35,
    activeLayers: 2,
    oldestCost: 14200,
    newestCost: 15100,
    sellingPrice: 19800,
    rs232: "Analog mV/V",
    status: "OPTIMAL",
  },
  {
    sku: "PS-500X600-300KG",
    name: "500X600 Platform Scale",
    brand: "United Scale",
    category: "Platform Scales",
    totalStock: 16,
    activeLayers: 2,
    oldestCost: 42000,
    newestCost: 44500,
    sellingPrice: 58000,
    rs232: "Continuous Stream",
    status: "LOW_STOCK_ALERT",
  },
  {
    sku: "IND-D60-LED",
    name: "D-60 LED Indicator",
    brand: "Yaohua",
    category: "Weighing Indicators",
    totalStock: 18,
    activeLayers: 1,
    oldestCost: 13200,
    newestCost: 13200,
    sellingPrice: 16500,
    rs232: "Active (RS-232)",
    status: "OPTIMAL",
  },
];

const fifoQueueVisual = [
  {
    id: "LAYER-01",
    product: "D-900s LCD Indicator",
    date: "15 Sep 2026",
    qty: "8 / 20 PCS",
    unitCost: "PKR 18,500",
    warehouse: "Mashriq Centre HQ",
    status: "FIRST IN QUEUE",
    isNext: true,
  },
  {
    id: "LAYER-02",
    product: "D-900s LCD Indicator",
    date: "18 Oct 2026",
    qty: "25 / 25 PCS",
    unitCost: "PKR 19,800",
    warehouse: "Mashriq Centre HQ",
    status: "QUEUED",
    isNext: false,
  },
  {
    id: "LAYER-03",
    product: "S-Type Load Cell",
    date: "20 Aug 2026",
    qty: "5 / 15 PCS",
    unitCost: "PKR 14,200",
    warehouse: "Mashriq Centre HQ",
    status: "FIRST IN QUEUE",
    isNext: true,
  },
  {
    id: "LAYER-04",
    product: "500X600 Platform Scale",
    date: "28 Sep 2026",
    qty: "4 / 10 PCS",
    unitCost: "PKR 42,000",
    warehouse: "Mashriq Centre HQ",
    status: "FIRST IN QUEUE",
    isNext: true,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="relative rounded-xl border border-red-900/40 bg-gradient-to-r from-zinc-950 via-zinc-900/80 to-red-950/20 p-6 backdrop-blur-md overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Cpu className="w-48 h-48 text-red-500" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.9)] animate-pulse" />
              <span className="text-xs font-mono tracking-widest text-red-400 uppercase">
                United Scale Core Command // Mashriq Centre Hub
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100 uppercase">
              Industrial Weighing & FIFO Telemetry
            </h1>
            <p className="text-xs text-zinc-400 font-mono max-w-2xl">
              Strict First-In-First-Out valuation engine active. Multi-warehouse synchronization across
              Mashriq Centre HQ & Gulshan Godown with Sindh Weights & Measures compliance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/sales">
              <Button variant="cyber" size="sm" className="gap-2 text-xs">
                <ArrowDownLeft className="w-3.5 h-3.5" />
                FIFO Stock Deduction
              </Button>
            </Link>
            <Link href="/purchasing">
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                Add Inventory Layer
              </Button>
            </Link>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <Card className="relative overflow-hidden border-zinc-800 bg-zinc-950/70 hover:border-red-600/40 transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-60" />
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-zinc-400">TOTAL INVENTORY VALUATION</CardDescription>
              <Boxes className="w-4 h-4 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-zinc-100 mono-numbers pt-1">
              PKR 2,410,500
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-zinc-400 flex items-center justify-between">
            <span className="text-emerald-400 flex items-center gap-1 font-mono">
              <TrendingUp className="w-3 h-3" />
              100% Strict FIFO Costed
            </span>
            <span className="font-mono text-[11px] text-zinc-400">8 Active Layers</span>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-zinc-800 bg-zinc-950/70 hover:border-red-600/40 transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-60" />
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-zinc-400">WAREHOUSE HUBS</CardDescription>
              <Warehouse className="w-4 h-4 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-zinc-100 mono-numbers pt-1">
              2 Locations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-zinc-400 flex items-center justify-between">
            <span className="text-zinc-300 font-mono">Mashriq HQ + Gulshan</span>
            <span className="text-emerald-400 font-mono text-[11px]">Synced ACID</span>
          </CardContent>
        </Card>


        <Card className="relative overflow-hidden border-zinc-800 bg-zinc-950/70 hover:border-red-600/40 transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-60" />
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-zinc-400">OLDEST LAYER DEPLETION</CardDescription>
              <Layers className="w-4 h-4 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-zinc-100 mono-numbers pt-1">
              64.2% Drained
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-zinc-400 flex items-center justify-between">
            <span className="text-zinc-400 font-mono">Next: LOT-2026-SEP-01</span>
            <span className="text-red-400 font-mono text-[11px]">Auto Shift</span>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-zinc-800 bg-zinc-950/70 hover:border-red-600/40 transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-60" />
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-zinc-400">SINDH CALIBRATION STATUS</CardDescription>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-emerald-400 mono-numbers pt-1">
              100% Verified
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-zinc-400 flex items-center justify-between">
            <span className="text-zinc-300 font-mono">Reg: W&M Sindh</span>
            <span className="text-emerald-400 font-mono text-[11px]">Phase 3 Ready</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardHeader className="p-5 border-b border-zinc-850 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600" />
                  Strict FIFO Chronological Layer Queue
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 font-mono">
                  Items sold will automatically deduct from the top chronological layer first.
                </CardDescription>
              </div>
              <Link href="/inventory/layers">
                <Button variant="ghost" size="sm" className="text-xs text-red-400 hover:text-red-300 gap-1 font-mono">
                  View All Layers
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-zinc-850">
                {fifoQueueVisual.map((layer, idx) => (
                  <div
                    key={layer.id}
                    className="p-4 flex items-center justify-between hover:bg-zinc-900/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center w-8 h-8 rounded border border-zinc-800 bg-zinc-900 font-mono text-xs text-zinc-400">
                        0{idx + 1}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-zinc-100">{layer.product}</span>
                          {layer.isNext && (
                            <Badge variant="cyber" className="text-[10px] py-0 px-1.5">
                              NEXT DEDUCTION
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-zinc-400 font-mono flex items-center gap-3">
                          <span>Layer: {layer.id}</span>
                          <span>•</span>
                          <span>Procured: {layer.date}</span>
                          <span>•</span>
                          <span className="text-zinc-400">{layer.warehouse}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-0.5">
                      <div className="text-sm font-bold text-zinc-100 mono-numbers">
                        {layer.unitCost} <span className="text-[10px] text-zinc-400 font-normal">/ unit</span>
                      </div>
                      <div className="text-xs font-mono text-emerald-400">
                        Remaining: <span className="font-bold">{layer.qty}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardHeader className="p-5 border-b border-zinc-850 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-200">
                  Target Hardware Inventory Status
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 font-mono">
                  Real client hardware catalog deployed at Mashriq Centre HQ.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="font-mono text-xs">
                4 Models Active
              </Badge>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-900/60 text-zinc-400 uppercase tracking-wider border-b border-zinc-850">
                  <tr>
                    <th className="p-3.5 pl-5">Hardware / Model</th>
                    <th className="p-3.5">Brand</th>
                    <th className="p-3.5">RS-232 Port</th>
                    <th className="p-3.5">FIFO Cost Base</th>
                    <th className="p-3.5">Selling Price</th>
                    <th className="p-3.5">Available</th>
                    <th className="p-3.5 pr-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {initialHardware.map((hw) => (
                    <tr key={hw.sku} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="p-3.5 pl-5 font-sans font-medium text-zinc-200">
                        <div>{hw.name}</div>
                        <div className="text-[11px] font-mono text-zinc-400">{hw.sku}</div>
                      </td>
                      <td className="p-3.5 text-zinc-400">{hw.brand}</td>
                      <td className="p-3.5">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 text-[10px]">
                          {hw.rs232}
                        </span>
                      </td>
                      <td className="p-3.5 text-zinc-300 mono-numbers">
                        PKR {hw.oldestCost.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-red-400 font-bold mono-numbers">
                        PKR {hw.sellingPrice.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-zinc-200 font-bold mono-numbers">
                        {hw.totalStock} PCS
                      </td>
                      <td className="p-3.5 pr-5 text-right">
                        {hw.status === "OPTIMAL" ? (
                          <Badge variant="cyberGreen" className="text-[10px]">
                            HEALTHY
                          </Badge>
                        ) : (
                          <Badge variant="cyberAmber" className="text-[10px]">
                            LOW STOCK
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">

          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardHeader className="p-5 border-b border-zinc-850">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-200 flex items-center justify-between">
                <span>Multi-Warehouse Hubs</span>
                <Warehouse className="w-4 h-4 text-red-500" />
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400 font-mono">
                Real-time stock distribution across physical sites
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">

              <div className="p-3.5 rounded-lg border border-red-900/40 bg-zinc-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                    <span className="font-semibold text-zinc-100 text-xs uppercase">
                      Mashriq Centre HQ
                    </span>
                  </div>
                  <Badge variant="cyber" className="text-[9px] py-0">
                    PRIMARY HUB
                  </Badge>
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">
                  Shop #G-12, Sir Shah Suleman Rd, Gulshan-e-Iqbal, Karachi
                </div>
                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Holding: 55 Units</span>
                  <span className="text-red-400 font-bold">Valuation: PKR 1,480,000</span>
                </div>
              </div>


              <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-zinc-500" />
                    <span className="font-semibold text-zinc-200 text-xs uppercase">
                      Gulshan Godown
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-[9px] py-0">
                    STORAGE NODE
                  </Badge>
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">
                  Plot #B-44, Block 13-D, Gulshan-e-Iqbal, Karachi
                </div>
                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Holding: 42 Units</span>
                  <span className="text-zinc-300 font-bold">Valuation: PKR 930,500</span>
                </div>
              </div>

              <Link href="/transfers" className="block pt-1">
                <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 font-mono">
                  <span>Transfer Stock Between Warehouses</span>
                  <ExternalLink className="w-3 h-3 text-red-400" />
                </Button>
              </Link>
            </CardContent>
          </Card>


          <Card className="border-red-950/60 bg-gradient-to-b from-zinc-950 to-red-950/20">
            <CardHeader className="p-5 border-b border-red-900/30">
              <div className="flex items-center justify-between">
                <Badge variant="destructive" className="text-[9px]">
                  PHASE 3 ARCHITECTURE HOOK
                </Badge>
                <FileCheck2 className="w-4 h-4 text-red-500" />
              </div>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-200 pt-1">
                Sindh Govt Verification Module
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400 font-mono">
                Weights & Measures Directorate, Sindh
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <div className="p-3 rounded bg-zinc-900/80 border border-zinc-800 font-mono text-xs space-y-1.5">
                <div className="text-zinc-400 text-[11px]">Active Certificate On Record:</div>
                <div className="text-red-400 font-bold">US-CAL-SINDH-2026-089</div>
                <div className="text-zinc-300 text-[11px]">Client: Lucky Cement Ltd (Karachi)</div>
                <div className="text-emerald-400 text-[10px]">Status: APPROVED_GOVT_SINDH</div>
              </div>

              <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
                Schema model `CalibrationCertificate` is initialized. Ready for Phase 3 automated PDF
                generation, inspector digital seals, and RS-232 telemetry direct parsing.
              </p>

              <Link href="/calibration" className="block">
                <Button variant="secondary" size="sm" className="w-full text-xs font-mono text-zinc-400">
                  Inspect Phase 3 Blueprint
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

