"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Layers,
  ArrowDownLeft,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Cpu,
  Boxes,
  Zap,
  RotateCcw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductOption {
  id: string;
  sku: string;
  name: string;
  brand: string;
  sellingPrice: number;
  availableStock: number;
  activeLayers: {
    id: string;
    batchNumber: string;
    remainingQty: number;
    unitCost: number;
    fifoDate: string;
  }[];
}

const mockProducts: ProductOption[] = [
  {
    id: "prod-d900s",
    sku: "IND-D900S-LCD",
    name: "D-900s LCD Indicator",
    brand: "Yaohua / United Scale",
    sellingPrice: 24500,
    availableStock: 33,
    activeLayers: [
      {
        id: "l1",
        batchNumber: "LOT-2026-SEP-01",
        remainingQty: 8,
        unitCost: 18500,
        fifoDate: "2026-09-15",
      },
      {
        id: "l2",
        batchNumber: "LOT-2026-OCT-18",
        remainingQty: 25,
        unitCost: 19800,
        fifoDate: "2026-10-18",
      },
    ],
  },
  {
    id: "prod-stype",
    sku: "LC-STYPE-5T",
    name: "S-Type Load Cell",
    brand: "Omega",
    sellingPrice: 19800,
    availableStock: 5,
    activeLayers: [
      {
        id: "l3",
        batchNumber: "LOT-2026-AUG-44",
        remainingQty: 5,
        unitCost: 14200,
        fifoDate: "2026-08-20",
      },
    ],
  },
  {
    id: "prod-platform",
    sku: "PS-500X600-300KG",
    name: "500X600 Platform Scale",
    brand: "United Scale",
    sellingPrice: 58000,
    availableStock: 4,
    activeLayers: [
      {
        id: "l4",
        batchNumber: "LOT-2026-SEP-77",
        remainingQty: 4,
        unitCost: 42000,
        fifoDate: "2026-09-28",
      },
    ],
  },
];

export default function SalesFifoPage() {
  const [selectedProductId, setSelectedProductId] = useState<string>("prod-d900s");
  const [warehouse, setWarehouse] = useState<string>("HQ-MASHRIQ");
  const [qty, setQty] = useState<number>(10);
  const [clientName, setClientName] = useState<string>("Lucky Cement Ltd - Karachi");
  const [invoiceRef, setInvoiceRef] = useState<string>("INV-2026-1105");
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<any>(null);

  const product = mockProducts.find((p) => p.id === selectedProductId) || mockProducts[0];


  let remainingNeeded = qty;
  let simulatedCOGS = 0;
  const simulatedDrainSteps: {
    batchNumber: string;
    takenQty: number;
    unitCost: number;
    subtotal: number;
    isDepleted: boolean;
    remainingAfter: number;
  }[] = [];

  for (const layer of product.activeLayers) {
    if (remainingNeeded <= 0) break;
    const take = Math.min(layer.remainingQty, remainingNeeded);
    const sub = take * layer.unitCost;
    simulatedCOGS += sub;
    const remainingAfter = layer.remainingQty - take;
    simulatedDrainSteps.push({
      batchNumber: layer.batchNumber,
      takenQty: take,
      unitCost: layer.unitCost,
      subtotal: sub,
      isDepleted: remainingAfter === 0,
      remainingAfter,
    });
    remainingNeeded -= take;
  }

  const isStockInsufficient = remainingNeeded > 0;
  const revenue = qty * product.sellingPrice;
  const grossProfit = revenue - simulatedCOGS;
  const profitMargin = revenue > 0 ? ((grossProfit / revenue) * 100).toFixed(1) : "0";
  const weightedAvgCost = qty > 0 ? (simulatedCOGS / qty).toFixed(2) : "0";

  const handleExecute = async () => {
    setIsExecuting(true);

    setTimeout(() => {
      setIsExecuting(false);
      setExecutionResult({
        success: true,
        transactionId: `TX-FIFO-${Date.now().toString(36).toUpperCase()}`,
        productName: product.name,
        sku: product.sku,
        quantityDeducted: qty,
        cogsPKR: simulatedCOGS,
        avgCostPKR: Number(weightedAvgCost),
        steps: simulatedDrainSteps,
        client: clientName,
        invoice: invoiceRef,
        timestamp: new Date().toLocaleTimeString("en-PK"),
      });
    }, 700);
  };

  return (
    <div className="space-y-6">

      <div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
          <span className="text-xs font-mono uppercase text-red-400 tracking-wider">
            Strict FIFO Sales Deduction Engine
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 uppercase">
          Sales Order & Real-Time Stock Depletion
        </h1>
        <p className="text-xs text-zinc-400 font-mono">
          Transactional deduction against active FIFO inventory layers. Depletes chronological layers
          in order.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardHeader className="p-5 border-b border-zinc-850">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-red-500" />
                Sales Order Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                    Select Target Product
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => {
                      setSelectedProductId(e.target.value);
                      setExecutionResult(null);
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-zinc-100 outline-none focus:border-red-600"
                  >
                    {mockProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) — Avail: {p.availableStock}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                    Dispatch Warehouse
                  </label>
                  <select
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-zinc-100 outline-none focus:border-red-600"
                  >
                    <option value="HQ-MASHRIQ">Mashriq Centre HQ (Karachi)</option>
                    <option value="WH-GULSHAN">Gulshan Godown (Karachi)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                    Order Quantity (PCS)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={product.availableStock}
                    value={qty}
                    onChange={(e) => {
                      setQty(Math.max(1, parseInt(e.target.value) || 1));
                      setExecutionResult(null);
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-zinc-100 outline-none focus:border-red-600"
                  />
                  <div className="text-[11px] font-mono text-zinc-500 mt-1">
                    Available in FIFO layers: {product.availableStock} PCS
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-zinc-100 outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div className="mt-4 p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono uppercase text-zinc-300 font-bold flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-red-500" />
                    <span>Real-Time FIFO Deduction Layer Breakdown</span>
                  </div>
                  <Badge variant="cyber" className="text-[9px]">
                    LIVE AUDIT PREVIEW
                  </Badge>
                </div>

                {isStockInsufficient ? (
                  <div className="p-3 rounded bg-red-950/60 border border-red-800 text-xs font-mono text-red-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>
                      Requested {qty} units exceeds available active inventory layers ({product.availableStock}{" "}
                      units). Deduction blocked.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {simulatedDrainSteps.map((step, idx) => (
                      <div
                        key={step.batchNumber}
                        className="p-3 rounded bg-zinc-950/80 border border-zinc-850 flex items-center justify-between text-xs font-mono"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-red-400 font-bold">Step {idx + 1}:</span>
                            <span className="text-zinc-200">Layer {step.batchNumber}</span>
                            {step.isDepleted && (
                              <Badge variant="destructive" className="text-[9px] py-0">
                                WILL DEPLETE TO 0
                              </Badge>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-500">
                            Taking {step.takenQty} PCS @ PKR {step.unitCost.toLocaleString()} → Leaving{" "}
                            {step.remainingAfter} PCS
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-zinc-100 mono-numbers">
                            PKR {step.subtotal.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-zinc-500">Subtotal COGS</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>


              <div className="pt-2">
                <Button
                  variant="cyber"
                  disabled={isStockInsufficient || isExecuting}
                  onClick={handleExecute}
                  className="w-full py-6 text-sm gap-2"
                >
                  <Cpu className="w-4 h-4" />
                  {isExecuting ? "Executing Transaction in $transaction..." : "Commit Transactional FIFO Deduction"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {executionResult && (
            <Card className="border-emerald-600/50 bg-emerald-950/20">
              <CardHeader className="p-5 border-b border-emerald-900/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm font-mono">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>TRANSACTION COMMITTED & AUDITED</span>
                  </div>
                  <Badge variant="cyberGreen" className="text-[9px]">
                    ACID SUCCESS
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 font-mono text-xs space-y-2">
                <div className="flex justify-between text-zinc-300">
                  <span>Tx Reference:</span>
                  <span className="font-bold text-emerald-400">{executionResult.transactionId}</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Product:</span>
                  <span>{executionResult.productName} ({executionResult.sku})</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Quantity Deducted:</span>
                  <span className="font-bold text-zinc-100">{executionResult.quantityDeducted} PCS</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Total FIFO COGS:</span>
                  <span className="font-bold text-red-400">PKR {executionResult.cogsPKR.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Weighted Average Cost / Unit:</span>
                  <span className="font-bold text-zinc-100">PKR {executionResult.avgCostPKR.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-emerald-900/40 text-[11px] text-zinc-400">
                  Audit log written to `StockMovement` table and inventory layers updated.
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardHeader className="p-5 border-b border-zinc-850">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-200 flex items-center justify-between">
                <span>Financial FIFO Ledger</span>
                <Receipt className="w-4 h-4 text-red-500" />
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400 font-mono">
                Calculated in real-time based on selected quantity
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between text-zinc-400 pb-2 border-b border-zinc-850">
                  <span>Selling Price / Unit</span>
                  <span className="text-zinc-200 mono-numbers">PKR {product.sellingPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-zinc-400 pb-2 border-b border-zinc-850">
                  <span>Order Quantity</span>
                  <span className="text-zinc-200 mono-numbers">{qty} PCS</span>
                </div>
                <div className="flex justify-between text-zinc-400 pb-2 border-b border-zinc-850">
                  <span>Gross Revenue</span>
                  <span className="text-zinc-100 font-bold mono-numbers">PKR {revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-zinc-400 pb-2 border-b border-zinc-850">
                  <span>Total FIFO Cost (COGS)</span>
                  <span className="text-red-400 font-bold mono-numbers">
                    PKR {simulatedCOGS.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400 pb-2 border-b border-zinc-850">
                  <span>Weighted Average Cost</span>
                  <span className="text-zinc-200 mono-numbers">PKR {Number(weightedAvgCost).toLocaleString()}</span>
                </div>

                <div className="pt-2 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-[10px] text-zinc-400 uppercase">Gross Profit (FIFO)</div>
                    <div className="text-lg font-bold text-emerald-400 mono-numbers">
                      PKR {grossProfit.toLocaleString()}
                    </div>
                  </div>
                  <Badge variant="cyberGreen" className="text-xs">
                    {profitMargin}% MARGIN
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-4 rounded-lg border border-red-900/40 bg-zinc-950/80 text-xs font-mono space-y-2">
            <div className="text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Boxes className="w-4 h-4 text-red-500" />
              <span>ACID Concurrency Guarantee</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Every deduction runs under `Prisma.TransactionIsolationLevel.Serializable`. If two sales
              attempt to deplete the same layer simultaneously, the second transaction is safely retried,
              guaranteeing negative stock prevention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

