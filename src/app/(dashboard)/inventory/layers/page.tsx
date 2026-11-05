"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Warehouse,
  Boxes,
  Info,
  Calendar,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LayerDisplay {
  id: string;
  batchNumber: string;
  productName: string;
  sku: string;
  warehouseName: string;
  warehouseCode: string;
  originalQty: number;
  remainingQty: number;
  unitCost: number;
  source: string;
  sourceReference: string;
  fifoDate: string;
  status: "ACTIVE" | "DEPLETED";
  isFirstInLine?: boolean;
}

const mockLayers: LayerDisplay[] = [
  {
    id: "LAYER-001",
    batchNumber: "LOT-2026-AUG-44",
    productName: "S-Type Load Cell",
    sku: "LC-STYPE-5T",
    warehouseName: "Mashriq Centre HQ",
    warehouseCode: "HQ-MASHRIQ",
    originalQty: 15,
    remainingQty: 5,
    unitCost: 14200,
    source: "PURCHASE",
    sourceReference: "PO-2026-AUG-088",
    fifoDate: "2026-08-20 11:00",
    status: "ACTIVE",
    isFirstInLine: true,
  },
  {
    id: "LAYER-002",
    batchNumber: "LOT-2026-SEP-01",
    productName: "D-900s LCD Indicator",
    sku: "IND-D900S-LCD",
    warehouseName: "Mashriq Centre HQ",
    warehouseCode: "HQ-MASHRIQ",
    originalQty: 20,
    remainingQty: 8,
    unitCost: 18500,
    source: "PURCHASE",
    sourceReference: "PO-2026-SEP-104",
    fifoDate: "2026-09-15 09:00",
    status: "ACTIVE",
    isFirstInLine: true,
  },
  {
    id: "LAYER-003",
    batchNumber: "LOT-2026-SEP-77",
    productName: "500X600 Platform Scale",
    sku: "PS-500X600-300KG",
    warehouseName: "Mashriq Centre HQ",
    warehouseCode: "HQ-MASHRIQ",
    originalQty: 10,
    remainingQty: 4,
    unitCost: 42000,
    source: "PURCHASE",
    sourceReference: "PO-2026-SEP-301",
    fifoDate: "2026-09-28 10:00",
    status: "ACTIVE",
    isFirstInLine: true,
  },
  {
    id: "LAYER-004",
    batchNumber: "LOT-2026-OCT-09",
    productName: "S-Type Load Cell",
    sku: "LC-STYPE-5T",
    warehouseName: "Gulshan Godown",
    warehouseCode: "WH-GULSHAN",
    originalQty: 30,
    remainingQty: 30,
    unitCost: 15100,
    source: "PURCHASE",
    sourceReference: "PO-2026-OCT-155",
    fifoDate: "2026-10-09 16:00",
    status: "ACTIVE",
    isFirstInLine: true,
  },
  {
    id: "LAYER-005",
    batchNumber: "LOT-2026-OCT-18",
    productName: "D-900s LCD Indicator",
    sku: "IND-D900S-LCD",
    warehouseName: "Mashriq Centre HQ",
    warehouseCode: "HQ-MASHRIQ",
    originalQty: 25,
    remainingQty: 25,
    unitCost: 19800,
    source: "PURCHASE",
    sourceReference: "PO-2026-OCT-220",
    fifoDate: "2026-10-18 14:30",
    status: "ACTIVE",
    isFirstInLine: false,
  },
  {
    id: "LAYER-006",
    batchNumber: "LOT-2026-OCT-30",
    productName: "500X600 Platform Scale",
    sku: "PS-500X600-300KG",
    warehouseName: "Gulshan Godown",
    warehouseCode: "WH-GULSHAN",
    originalQty: 12,
    remainingQty: 12,
    unitCost: 44500,
    source: "PURCHASE",
    sourceReference: "PO-2026-OCT-410",
    fifoDate: "2026-10-30 13:00",
    status: "ACTIVE",
    isFirstInLine: true,
  },
  {
    id: "LAYER-007",
    batchNumber: "LOT-2026-JUN-12",
    productName: "D-900s LCD Indicator",
    sku: "IND-D900S-LCD",
    warehouseName: "Mashriq Centre HQ",
    warehouseCode: "HQ-MASHRIQ",
    originalQty: 10,
    remainingQty: 0,
    unitCost: 17200,
    source: "OPENING_STOCK",
    sourceReference: "AUDIT-2026-JUN",
    fifoDate: "2026-06-12 08:00",
    status: "DEPLETED",
    isFirstInLine: false,
  },
];

export default function FifoLayersPage() {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredLayers = mockLayers.filter((layer) => {
    if (selectedWarehouse !== "ALL" && layer.warehouseCode !== selectedWarehouse) {
      return false;
    }
    if (statusFilter !== "ALL" && layer.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const totalActiveValuation = filteredLayers
    .filter((l) => l.status === "ACTIVE")
    .reduce((sum, l) => sum + l.remainingQty * l.unitCost, 0);

  const totalRemainingUnits = filteredLayers
    .filter((l) => l.status === "ACTIVE")
    .reduce((sum, l) => sum + l.remainingQty, 0);

  return (
    <div className="space-y-6">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
            <span className="text-xs font-mono uppercase text-red-400 tracking-wider">
              Inventory Subsystem // Phase 2
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 uppercase">
            Strict FIFO Inventory Layers
          </h1>
          <p className="text-xs text-zinc-400 font-mono">
            Every purchase batch creates a discrete financial layer. Deductions drain the oldest active
            layer first.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/sales">
            <Button variant="cyber" size="sm" className="gap-2 text-xs">
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Deduct Stock (Sale)
            </Button>
          </Link>
          <Link href="/purchasing">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              Receive New Layer
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-zinc-950/70 border-zinc-800">
          <div className="text-xs font-mono text-zinc-400">TOTAL FIFO VALUATION (ACTIVE)</div>
          <div className="text-xl font-bold text-zinc-100 mono-numbers mt-1">
            PKR {totalActiveValuation.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
            Sum of (RemainingQty × UnitCost)
          </div>
        </Card>

        <Card className="p-4 bg-zinc-950/70 border-zinc-800">
          <div className="text-xs font-mono text-zinc-400">TOTAL ACTIVE UNITS HELD</div>
          <div className="text-xl font-bold text-red-400 mono-numbers mt-1">
            {totalRemainingUnits} Units
          </div>
          <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
            Across {filteredLayers.filter((l) => l.status === "ACTIVE").length} Active Batches
          </div>
        </Card>

        <Card className="p-4 bg-zinc-950/70 border-zinc-800">
          <div className="text-xs font-mono text-zinc-400">FIFO QUEUE ALGORITHM</div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1 flex items-center gap-2">
            <span>CHRONO ASC</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
            PostgreSQL Serializable Lock Protected
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg bg-zinc-900/60 border border-zinc-800">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-red-500" />
          <span className="text-xs font-mono uppercase text-zinc-300">Filter By Hub:</span>
          <div className="flex gap-1.5">
            {["ALL", "HQ-MASHRIQ", "WH-GULSHAN"].map((wh) => (
              <button
                key={wh}
                onClick={() => setSelectedWarehouse(wh)}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors ${selectedWarehouse === wh
                    ? "bg-red-950 text-red-300 border border-red-700/60 font-semibold shadow-[0_0_8px_rgba(220,38,38,0.3)]"
                    : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200"
                  }`}
              >
                {wh === "ALL" ? "All Warehouses" : wh === "HQ-MASHRIQ" ? "Mashriq HQ" : "Gulshan Godown"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono uppercase text-zinc-400">Status:</span>
          <div className="flex gap-1.5">
            {["ALL", "ACTIVE", "DEPLETED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors ${statusFilter === st
                    ? "bg-zinc-800 text-zinc-100 border border-zinc-700 font-semibold"
                    : "bg-zinc-900/60 text-zinc-400 border border-zinc-850 hover:text-zinc-200"
                  }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Card className="border-zinc-800 bg-zinc-950/80 overflow-hidden">
        <CardHeader className="p-5 border-b border-zinc-850">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-200 flex items-center justify-between">
            <span>Registered FIFO Inventory Layers Ledger</span>
            <Badge variant="secondary" className="font-mono text-xs">
              {filteredLayers.length} Layers Displayed
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-900/80 text-zinc-400 uppercase tracking-wider border-b border-zinc-850">
              <tr>
                <th className="p-3.5 pl-5">FIFO Date / Batch</th>
                <th className="p-3.5">Product & SKU</th>
                <th className="p-3.5">Warehouse Location</th>
                <th className="p-3.5">Original Qty</th>
                <th className="p-3.5">Remaining Qty</th>
                <th className="p-3.5">Unit Cost (FIFO)</th>
                <th className="p-3.5">Layer Valuation</th>
                <th className="p-3.5">Queue Priority</th>
                <th className="p-3.5 pr-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {filteredLayers.map((layer) => {
                const depletionPct =
                  layer.originalQty > 0
                    ? Math.round(((layer.originalQty - layer.remainingQty) / layer.originalQty) * 100)
                    : 100;
                const valuation = layer.remainingQty * layer.unitCost;

                return (
                  <tr
                    key={layer.id}
                    className={`hover:bg-zinc-900/40 transition-colors ${layer.status === "DEPLETED" ? "opacity-50 bg-zinc-950/40" : ""
                      }`}
                  >
                    <td className="p-3.5 pl-5">
                      <div className="font-bold text-zinc-200">{layer.batchNumber}</div>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-red-500" />
                        <span>{layer.fifoDate}</span>
                      </div>
                    </td>

                    <td className="p-3.5 font-sans font-medium text-zinc-100">
                      <div>{layer.productName}</div>
                      <div className="text-[11px] font-mono text-zinc-400">{layer.sku}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="text-zinc-300 font-medium">{layer.warehouseName}</div>
                      <div className="text-[10px] text-zinc-400">{layer.warehouseCode}</div>
                    </td>

                    <td className="p-3.5 mono-numbers text-zinc-400">
                      {layer.originalQty} PCS
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-zinc-100 mono-numbers">
                        {layer.remainingQty} PCS
                      </div>
                      <div className="w-24 bg-zinc-800 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${layer.remainingQty === 0
                              ? "bg-zinc-600"
                              : depletionPct > 50
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                          style={{ width: `${100 - depletionPct}%` }}
                        />
                      </div>
                    </td>

                    <td className="p-3.5 text-zinc-200 mono-numbers font-medium">
                      PKR {layer.unitCost.toLocaleString()}
                    </td>

                    <td className="p-3.5 text-red-400 mono-numbers font-bold">
                      PKR {valuation.toLocaleString()}
                    </td>

                    <td className="p-3.5">
                      {layer.status === "ACTIVE" && layer.isFirstInLine ? (
                        <Badge variant="cyber" className="text-[9px] py-0 px-2">
                          1ST IN QUEUE
                        </Badge>
                      ) : layer.status === "ACTIVE" ? (
                        <span className="text-[11px] text-zinc-400 font-mono">Queued</span>
                      ) : (
                        <span className="text-[11px] text-zinc-400 font-mono">Exhausted</span>
                      )}
                    </td>

                    <td className="p-3.5 pr-5 text-right">
                      {layer.status === "ACTIVE" ? (
                        <Badge variant="cyberGreen" className="text-[10px]">
                          ACTIVE
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          DEPLETED
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="p-4 rounded-lg border border-red-900/30 bg-zinc-950/90 text-xs font-mono text-zinc-400 flex items-start gap-3">
        <Info className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="text-zinc-200 font-bold uppercase tracking-wider">
            Strict FIFO Costing Specification (IAS 2 / Financial-Grade)
          </div>
          <div className="leading-relaxed">
            United Scale applies strict FIFO costing at the transactional database engine level (`/src/lib/fifo-engine.ts`).
            When sales occur, inventory is costed using the actual historical procurement expense of the oldest available layer.
            This prevents inflation-based margin distortion and complies with Karachi industrial audit standards.
          </div>
        </div>
      </div>
    </div>
  );
}

