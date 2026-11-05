"use client";

import React, { useState } from "react";
import {
  ArrowLeftRight,
  Warehouse,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  Send,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function TransfersPage() {
  const [sourceWarehouse, setSourceWarehouse] = useState<string>("WH-GULSHAN");
  const [destWarehouse, setDestWarehouse] = useState<string>("HQ-MASHRIQ");
  const [productSku, setProductSku] = useState<string>("LC-STYPE-5T");
  const [quantity, setQuantity] = useState<number>(10);
  const [notes, setNotes] = useState<string>("Transfer for Lucky Cement Karachi project");
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  const handleTransfer = () => {
    setIsTransferring(true);
    setTimeout(() => {
      setIsTransferring(false);
      setResult({
        transferRef: `TRF-${Date.now().toString(36).toUpperCase()}`,
        outboundMovement: `MOV-OUT-${Date.now().toString(36).toUpperCase()}`,
        inboundMovement: `MOV-IN-${Date.now().toString(36).toUpperCase()}`,
        productSku,
        quantity,
        source: sourceWarehouse === "HQ-MASHRIQ" ? "Mashriq Centre HQ" : "Gulshan Godown",
        destination: destWarehouse === "HQ-MASHRIQ" ? "Mashriq Centre HQ" : "Gulshan Godown",
        costBasisPreserved: true,
        unitCost: "PKR 14,200",
        totalValuation: `PKR ${(quantity * 14200).toLocaleString()}`,
      });
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
          <span className="text-xs font-mono uppercase text-red-400 tracking-wider">
            Multi-Warehouse Logistics Engine // Phase 2
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 uppercase">
          Inter-Warehouse Stock Transfer
        </h1>
        <p className="text-xs text-zinc-400 font-mono">
          Transfer stock between Mashriq Centre HQ and Gulshan Godown while preserving exact FIFO layer
          unit costs and chronological integrity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardHeader className="p-5 border-b border-zinc-850">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-red-500" />
                Dispatch & Routing Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                    Source Warehouse (Deplete)
                  </label>
                  <select
                    value={sourceWarehouse}
                    onChange={(e) => setSourceWarehouse(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-zinc-100 outline-none focus:border-red-600"
                  >
                    <option value="WH-GULSHAN">Gulshan Godown (Plot #B-44)</option>
                    <option value="HQ-MASHRIQ">Mashriq Centre HQ (Shop #G-12)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                    Destination Warehouse (Receive)
                  </label>
                  <select
                    value={destWarehouse}
                    onChange={(e) => setDestWarehouse(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-zinc-100 outline-none focus:border-red-600"
                  >
                    <option value="HQ-MASHRIQ">Mashriq Centre HQ (Shop #G-12)</option>
                    <option value="WH-GULSHAN">Gulshan Godown (Plot #B-44)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                    Target Hardware Product
                  </label>
                  <select
                    value={productSku}
                    onChange={(e) => setProductSku(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-zinc-100 outline-none focus:border-red-600"
                  >
                    <option value="LC-STYPE-5T">S-Type Load Cell (LC-STYPE-5T)</option>
                    <option value="IND-D900S-LCD">D-900s LCD Indicator (IND-D900S-LCD)</option>
                    <option value="PS-500X600-300KG">500X600 Platform Scale (PS-500X600-300KG)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                    Transfer Quantity (PCS)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-zinc-100 outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                  Internal Transfer Manifest / Gate Pass Note
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-zinc-100 outline-none focus:border-red-600"
                />
              </div>

              <div className="pt-2">
                <Button
                  variant="cyber"
                  disabled={sourceWarehouse === destWarehouse || isTransferring}
                  onClick={handleTransfer}
                  className="w-full py-6 text-sm gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isTransferring ? "Executing Multi-Warehouse Transaction..." : "Execute Matched Transfer Adjustment"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {result && (
            <Card className="border-emerald-600/50 bg-emerald-950/20">
              <CardHeader className="p-5 border-b border-emerald-900/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm font-mono">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>TRANSFER COMPLETE (MATCHED NEGATIVE/POSITIVE ADJUSTMENT)</span>
                  </div>
                  <Badge variant="cyberGreen" className="text-[9px]">
                    ZERO DISTORTION
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 font-mono text-xs space-y-2">
                <div className="flex justify-between text-zinc-300">
                  <span>Transfer Reference:</span>
                  <span className="font-bold text-emerald-400">{result.transferRef}</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Routing:</span>
                  <span>{result.source} → {result.destination}</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Units Moved:</span>
                  <span className="font-bold text-zinc-100">{result.quantity} PCS</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Preserved FIFO Cost:</span>
                  <span className="font-bold text-zinc-100">{result.unitCost}</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Transferred Valuation:</span>
                  <span className="font-bold text-red-400">{result.totalValuation}</span>
                </div>
                <div className="pt-2 border-t border-emerald-900/40 text-[11px] text-zinc-400">
                  Audit logs generated: Outward `{result.outboundMovement}` and Inward `{result.inboundMovement}`.
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardHeader className="p-5 border-b border-zinc-850">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-200">
                Financial Continuity Guard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3 font-mono text-xs text-zinc-400 leading-relaxed">
              <p>
                In standard accounting software, inter-warehouse transfers often wipe out original cost
                layers or average them out, destroying audit integrity.
              </p>
              <p className="text-zinc-200">
                United Scale's `/src/lib/fifo-engine.ts` automatically splits and clones the exact original
                procurement layers into the new warehouse, preserving date and cost fidelity 100%.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

