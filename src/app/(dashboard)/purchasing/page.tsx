"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PackagePlus,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  Boxes,
  Truck,
  Building,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PurchasingPage() {
  const [poReference, setPoReference] = useState<string>("PO-2026-NOV-501");
  const [productId, setProductId] = useState<string>("IND-D900S-LCD");
  const [warehouse, setWarehouse] = useState<string>("HQ-MASHRIQ");
  const [quantity, setQuantity] = useState<number>(20);
  const [unitCost, setUnitCost] = useState<number>(19500);
  const [batchNumber, setBatchNumber] = useState<string>("LOT-2026-NOV-01");
  const [supplier, setSupplier] = useState<string>("Yaohua Electric / Import Consignment");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successResult, setSuccessResult] = useState<any>(null);

  const totalConsignmentCost = quantity * unitCost;

  const handleCreateLayer = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessResult({
        layerId: `LAYER-NEW-${Date.now().toString(36).toUpperCase()}`,
        movementRef: `MOV-IN-${Date.now().toString(36).toUpperCase()}`,
        batchNumber,
        product: productId,
        quantity,
        unitCost,
        totalCost: totalConsignmentCost,
        warehouse,
      });
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
          <span className="text-xs font-mono uppercase text-red-400 tracking-wider">
            Procurement Subsystem // FIFO Inflow Engine
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 uppercase">
          Inward Stock & FIFO Layer Creation
        </h1>
        <p className="text-xs text-zinc-400 font-mono">
          Each procurement consignment establishes a standalone FIFO cost basis layer with historical
          date stamping.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardHeader className="p-5 border-b border-zinc-850">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                <PackagePlus className="w-4 h-4 text-emerald-500" />
                Inward Consignment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                    PO Reference Number
                  </label>
                  <input
                    type="text"
                    value={poReference}
                    onChange={(e) => setPoReference(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-zinc-100 outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                    Batch / Lot Number
                  </label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-zinc-100 outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                    Target Hardware Product
                  </label>
                  <select
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-zinc-100 outline-none focus:border-red-600"
                  >
                    <option value="IND-D900S-LCD">D-900s LCD Indicator (IND-D900S-LCD)</option>
                    <option value="LC-STYPE-5T">S-Type Load Cell (LC-STYPE-5T)</option>
                    <option value="PS-500X600-300KG">500X600 Platform Scale (PS-500X600-300KG)</option>
                    <option value="IND-D60-LED">D-60 LED Indicator (IND-D60-LED)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                    Receiving Warehouse Hub
                  </label>
                  <select
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-zinc-100 outline-none focus:border-red-600"
                  >
                    <option value="HQ-MASHRIQ">Mashriq Centre HQ, Karachi (Shop #G-12)</option>
                    <option value="WH-GULSHAN">Gulshan Godown, Karachi (Plot #B-44)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                    Quantity Received (PCS)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-zinc-100 outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                    Exact Unit Cost (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={unitCost}
                    onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-zinc-100 outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                  Supplier / Customs Manifest
                </label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-zinc-100 outline-none focus:border-red-600"
                />
              </div>

              <div className="pt-2">
                <Button
                  variant="cyber"
                  disabled={isSubmitting}
                  onClick={handleCreateLayer}
                  className="w-full py-6 text-sm gap-2"
                >
                  <PackagePlus className="w-4 h-4" />
                  {isSubmitting ? "Generating Inventory Layer..." : "Commit Inward Consignment & Create FIFO Layer"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {successResult && (
            <Card className="border-emerald-600/50 bg-emerald-950/20">
              <CardHeader className="p-5 border-b border-emerald-900/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm font-mono">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>NEW FIFO LAYER COMMITTED</span>
                  </div>
                  <Badge variant="cyberGreen" className="text-[9px]">
                    ACTIVE QUEUE
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 font-mono text-xs space-y-2">
                <div className="flex justify-between text-zinc-300">
                  <span>Layer ID:</span>
                  <span className="font-bold text-emerald-400">{successResult.layerId}</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Batch Number:</span>
                  <span className="text-zinc-100">{successResult.batchNumber}</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Stock Movement Reference:</span>
                  <span className="text-zinc-100">{successResult.movementRef}</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Inward Units:</span>
                  <span className="font-bold text-zinc-100">{successResult.quantity} PCS</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Layer Valuation:</span>
                  <span className="font-bold text-emerald-400">PKR {successResult.totalCost.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>


        <div className="space-y-6">
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardHeader className="p-5 border-b border-zinc-850">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-200">
                Layer Valuation Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 font-mono text-xs">
              <div className="flex justify-between text-zinc-400 pb-2 border-b border-zinc-850">
                <span>Quantity</span>
                <span className="text-zinc-100 mono-numbers">{quantity} PCS</span>
              </div>
              <div className="flex justify-between text-zinc-400 pb-2 border-b border-zinc-850">
                <span>Unit Cost</span>
                <span className="text-zinc-100 mono-numbers">PKR {unitCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-400 pb-2 border-b border-zinc-850">
                <span>Total Consignment Valuation</span>
                <span className="text-emerald-400 font-bold mono-numbers">
                  PKR {totalConsignmentCost.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                <div className="text-zinc-200 font-semibold">FIFO Cost Basis Rule:</div>
                <p>
                  This layer will be queued chronologically. Future sales will only deduct against this layer
                  after all prior active layers for this SKU have been completely depleted.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

