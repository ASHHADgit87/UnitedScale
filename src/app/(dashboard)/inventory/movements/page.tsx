"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Filter,
  FileSpreadsheet,
  Clock,
  Warehouse,
  ShieldCheck,
  User,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MovementLog {
  id: string;
  reference: string;
  type: "PURCHASE" | "SALE_DEDUCTION" | "TRANSFER_IN" | "TRANSFER_OUT" | "OPENING_STOCK";
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  sourceWarehouse?: string;
  destWarehouse?: string;
  performedBy: string;
  timestamp: string;
  reason: string;
}

const mockMovements: MovementLog[] = [
  {
    id: "MOV-001",
    reference: "MOV-20261002-014",
    type: "SALE_DEDUCTION",
    productName: "D-900s LCD Indicator",
    sku: "IND-D900S-LCD",
    quantity: 12,
    unitCost: 18500,
    totalCost: 222000,
    sourceWarehouse: "Mashriq Centre HQ",
    performedBy: "Tariq Mahmood (Admin)",
    timestamp: "02 Oct 2026 15:20",
    reason: "Sale Invoice SI-2026-1088 (Lucky Cement Karachi Terminal)",
  },
  {
    id: "MOV-002",
    reference: "MOV-20261001-008",
    type: "TRANSFER_OUT",
    productName: "S-Type Load Cell",
    sku: "LC-STYPE-5T",
    quantity: 10,
    unitCost: 14200,
    totalCost: 142000,
    sourceWarehouse: "Mashriq Centre HQ",
    destWarehouse: "Gulshan Godown",
    performedBy: "Imran Khan (Manager)",
    timestamp: "01 Oct 2026 11:45",
    reason: "Internal Stock Rebalance to Gulshan Godown",
  },
  {
    id: "MOV-003",
    reference: "MOV-20261001-009",
    type: "TRANSFER_IN",
    productName: "S-Type Load Cell",
    sku: "LC-STYPE-5T",
    quantity: 10,
    unitCost: 14200,
    totalCost: 142000,
    sourceWarehouse: "Mashriq Centre HQ",
    destWarehouse: "Gulshan Godown",
    performedBy: "Imran Khan (Manager)",
    timestamp: "01 Oct 2026 12:15",
    reason: "Transfer Received at Gulshan Godown",
  },
  {
    id: "MOV-004",
    reference: "MOV-20260928-005",
    type: "PURCHASE",
    productName: "500X600 Platform Scale",
    sku: "PS-500X600-300KG",
    quantity: 10,
    unitCost: 42000,
    totalCost: 420000,
    destWarehouse: "Mashriq Centre HQ",
    performedBy: "Tariq Mahmood (Admin)",
    timestamp: "28 Sep 2026 10:00",
    reason: "Import Consignment Shipment PO-2026-SEP-301",
  },
  {
    id: "MOV-005",
    reference: "MOV-20260915-001",
    type: "PURCHASE",
    productName: "D-900s LCD Indicator",
    sku: "IND-D900S-LCD",
    quantity: 20,
    unitCost: 18500,
    totalCost: 370000,
    destWarehouse: "Mashriq Centre HQ",
    performedBy: "Imran Khan (Manager)",
    timestamp: "15 Sep 2026 09:30",
    reason: "Procurement shipment PO-2026-SEP-104",
  },
];

export default function StockMovementsPage() {
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filtered = mockMovements.filter((m) => {
    if (filterType !== "ALL" && m.type !== filterType) return false;
    if (
      searchTerm &&
      !m.reference.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !m.productName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !m.reason.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
            <span className="text-xs font-mono uppercase text-red-400 tracking-wider">
              Audit Subsystem // Immutable Ledger
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 uppercase">
            Stock Movements & Audit Trail
          </h1>
          <p className="text-xs text-zinc-400 font-mono">
            Every addition, sale deduction, and multi-warehouse transfer is permanently recorded with exact FIFO cost.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/sales">
            <Button variant="cyber" size="sm" className="gap-2 text-xs">
              <ArrowDownLeft className="w-3.5 h-3.5" />
              New Sale Deduction
            </Button>
          </Link>
        </div>
      </div>


      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg bg-zinc-900/60 border border-zinc-800">
        <div className="flex items-center gap-2 bg-zinc-950/80 border border-zinc-800 rounded px-3 py-1.5 w-72">
          <Search className="w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search Reference, Product, Reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-xs text-zinc-200 outline-none w-full placeholder:text-zinc-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase text-zinc-400">Type:</span>
          {["ALL", "PURCHASE", "SALE_DEDUCTION", "TRANSFER_OUT", "TRANSFER_IN"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${filterType === type
                  ? "bg-red-950 text-red-300 border border-red-700/60 font-semibold"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200"
                }`}
            >
              {type === "ALL" ? "All" : type.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>


      <Card className="border-zinc-800 bg-zinc-950/80 overflow-hidden">
        <CardHeader className="p-5 border-b border-zinc-850">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-200">
            Movement Log Ledger ({filtered.length} entries)
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-900/80 text-zinc-400 uppercase tracking-wider border-b border-zinc-850">
              <tr>
                <th className="p-3.5 pl-5">Timestamp / Ref</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Product & SKU</th>
                <th className="p-3.5">Quantity</th>
                <th className="p-3.5">FIFO Unit Cost</th>
                <th className="p-3.5">Total Valuation</th>
                <th className="p-3.5">Warehouse Route</th>
                <th className="p-3.5 pr-5">Officer / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="p-3.5 pl-5">
                    <div className="font-bold text-zinc-200">{m.reference}</div>
                    <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-red-500" />
                      <span>{m.timestamp}</span>
                    </div>
                  </td>

                  <td className="p-3.5">
                    {m.type === "SALE_DEDUCTION" && (
                      <Badge variant="destructive" className="text-[9px]">
                        SALE DEDUCT
                      </Badge>
                    )}
                    {m.type === "PURCHASE" && (
                      <Badge variant="cyberGreen" className="text-[9px]">
                        PURCHASE IN
                      </Badge>
                    )}
                    {m.type === "TRANSFER_OUT" && (
                      <Badge variant="cyberAmber" className="text-[9px]">
                        TRANSFER OUT
                      </Badge>
                    )}
                    {m.type === "TRANSFER_IN" && (
                      <Badge variant="cyber" className="text-[9px]">
                        TRANSFER IN
                      </Badge>
                    )}
                  </td>

                  <td className="p-3.5 font-sans font-medium text-zinc-100">
                    <div>{m.productName}</div>
                    <div className="text-[11px] font-mono text-zinc-400">{m.sku}</div>
                  </td>

                  <td className="p-3.5 mono-numbers text-zinc-100 font-bold">
                    {m.type === "SALE_DEDUCTION" || m.type === "TRANSFER_OUT" ? "-" : "+"}
                    {m.quantity} PCS
                  </td>

                  <td className="p-3.5 text-zinc-300 mono-numbers">
                    PKR {m.unitCost.toLocaleString()}
                  </td>

                  <td className="p-3.5 text-red-400 mono-numbers font-bold">
                    PKR {m.totalCost.toLocaleString()}
                  </td>

                  <td className="p-3.5 text-zinc-300">
                    {m.sourceWarehouse && m.destWarehouse ? (
                      <div className="flex items-center gap-1.5">
                        <span>{m.sourceWarehouse}</span>
                        <ArrowLeftRight className="w-3 h-3 text-red-400" />
                        <span>{m.destWarehouse}</span>
                      </div>
                    ) : m.sourceWarehouse ? (
                      <span>From {m.sourceWarehouse}</span>
                    ) : (
                      <span>To {m.destWarehouse}</span>
                    )}
                  </td>

                  <td className="p-3.5 pr-5">
                    <div className="text-zinc-200">{m.reason}</div>
                    <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{m.performedBy}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

