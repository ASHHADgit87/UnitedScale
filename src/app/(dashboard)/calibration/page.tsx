"use client";

import React from "react";
import Link from "next/link";
import {
  Lock,
  Award,
  ShieldCheck,
  FileText,
  Cpu,
  Radio,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Terminal,
  Scale,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CalibrationPhase3Page() {
  return (
    <div className="space-y-6">

      <div className="p-6 rounded-xl border border-red-800/60 bg-gradient-to-r from-red-950/40 via-zinc-950 to-zinc-900 p-6 backdrop-blur-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="flex items-center gap-1 text-[10px] py-0.5">
                <Lock className="w-3 h-3" />
                <span>PHASE 3 LOCKED SUBSYSTEM</span>
              </Badge>
              <span className="text-xs font-mono text-zinc-400">
                Ready for Activation in Phase 3 Execution
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100 uppercase">
              Govt. of Sindh Calibration & RS-232 Telemetry Engine
            </h1>
            <p className="text-xs text-zinc-400 font-mono max-w-3xl">
              Foundation schema `CalibrationCertificate` and multi-point test models have been fully
              established in Phase 1 & 2. Automated issuance and live scale serial bus integration will be
              unlocked in Phase 3.
            </p>
          </div>

          <Badge variant="cyber" className="self-start md:self-auto text-xs py-1.5 px-3">
            SCHEMA HOOK: READY
          </Badge>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardHeader className="p-5 border-b border-zinc-850 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Sindh Directorate of Weights & Measures — Certificate Specimen
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 font-mono">
                  Seeded model preview for periodic client scale re-verifications
                </CardDescription>
              </div>
              <Badge variant="cyberGreen" className="text-[10px]">
                OFFICIAL TEMPLATE
              </Badge>
            </CardHeader>

            <CardContent className="p-6">

              <div className="p-6 rounded-lg border-2 border-red-900/40 bg-zinc-900/50 space-y-6 relative">

                <div className="absolute right-6 top-6 opacity-20 pointer-events-none">
                  <Scale className="w-32 h-32 text-red-500" />
                </div>

                <div className="border-b border-zinc-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <div className="text-xs font-mono uppercase text-red-500 font-bold tracking-widest">
                      Govt. of Sindh Weights & Measures Directorate
                    </div>
                    <div className="text-lg font-bold text-zinc-100 uppercase">
                      Certificate of Verification & Calibration
                    </div>
                    <div className="text-xs font-mono text-zinc-400">
                      Issued by United Scale (Mashriq Centre, Karachi) under Sindh Standards Act
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-zinc-500">Certificate No:</div>
                    <div className="text-sm font-bold font-mono text-red-400">US-CAL-SINDH-2026-089</div>
                    <div className="text-[10px] font-mono text-zinc-400">Govt Stamp: SINDH-WM-KHI-4421</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                  <div className="space-y-1 p-3 rounded bg-zinc-950/70 border border-zinc-850">
                    <span className="text-zinc-500 uppercase text-[10px] block">Client / Industry:</span>
                    <span className="text-zinc-200 font-semibold">Lucky Cement Limited (Karachi Plant)</span>
                    <span className="text-zinc-400 text-[11px] block">Main Super Highway, Gadap, Karachi</span>
                  </div>

                  <div className="space-y-1 p-3 rounded bg-zinc-950/70 border border-zinc-850">
                    <span className="text-zinc-500 uppercase text-[10px] block">Equipment Identified:</span>
                    <span className="text-zinc-200 font-semibold">500X600 Platform Scale + D-900s</span>
                    <span className="text-zinc-400 text-[11px] block">Serial No: SN-2026-US-8921</span>
                  </div>

                  <div className="space-y-1 p-3 rounded bg-zinc-950/70 border border-zinc-850">
                    <span className="text-zinc-500 uppercase text-[10px] block">Metrological Parameters:</span>
                    <span className="text-zinc-200">Max Capacity: 300.00 kg | Div: 0.01 kg (10g)</span>
                    <span className="text-zinc-400 text-[11px] block">Standards: Class M1 Stainless Steel</span>
                  </div>

                  <div className="space-y-1 p-3 rounded bg-zinc-950/70 border border-zinc-850">
                    <span className="text-zinc-500 uppercase text-[10px] block">Validity & Sindh Re-verification:</span>
                    <span className="text-emerald-400 font-semibold">Valid Until: 14 Oct 2027</span>
                    <span className="text-zinc-400 text-[11px] block">Inspector: Muhammad Ali (Tech #04)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-mono uppercase text-zinc-400">
                    Certified Linearity Test Data (Sindh W&M Standard)
                  </div>
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-zinc-950 text-zinc-500 uppercase text-[10px]">
                      <tr>
                        <th className="p-2">Applied Load</th>
                        <th className="p-2">Indication (D-900s)</th>
                        <th className="p-2">Observed Error</th>
                        <th className="p-2 text-right">Sindh MPE Limit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850 text-zinc-300">
                      <tr>
                        <td className="p-2">50.00 kg</td>
                        <td className="p-2">50.00 kg</td>
                        <td className="p-2 text-emerald-400">0.00 kg</td>
                        <td className="p-2 text-right text-zinc-400">±0.02 kg</td>
                      </tr>
                      <tr>
                        <td className="p-2">100.00 kg</td>
                        <td className="p-2">100.00 kg</td>
                        <td className="p-2 text-emerald-400">0.00 kg</td>
                        <td className="p-2 text-right text-zinc-400">±0.02 kg</td>
                      </tr>
                      <tr>
                        <td className="p-2">200.00 kg</td>
                        <td className="p-2">200.01 kg</td>
                        <td className="p-2 text-emerald-400">+0.01 kg</td>
                        <td className="p-2 text-right text-zinc-400">±0.04 kg</td>
                      </tr>
                      <tr>
                        <td className="p-2">300.00 kg</td>
                        <td className="p-2">300.00 kg</td>
                        <td className="p-2 text-emerald-400">0.00 kg</td>
                        <td className="p-2 text-right text-zinc-400">±0.04 kg</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


        <div className="space-y-6">

          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardHeader className="p-5 border-b border-zinc-850">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-red-500" />
                  RS-232 Hardware Bridge
                </CardTitle>
                <Badge variant="secondary" className="text-[9px]">
                  PHASE 3
                </Badge>
              </div>
              <CardDescription className="text-xs text-zinc-400 font-mono">
                Direct serial data dump listener for D-900s & D-60
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-3 font-mono text-xs">
              <div className="p-3 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 space-y-1">
                <div className="text-zinc-500">RAW SERIAL STREAM (COM3 / 9600-8-N-1):</div>
                <div className="text-emerald-400 font-mono">ST,GS,+00300.00kg\r\n</div>
                <div className="text-emerald-400 font-mono">ST,GS,+00300.00kg\r\n</div>
                <div className="text-red-400 font-mono">OL,GS,+00305.50kg\r\n [OVERLOAD WARNING]</div>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Will allow automated zero, span calibration capturing directly from the weighing indicator
                via WebSerial API or edge TCP socket server without manual keying.
              </p>
            </CardContent>
          </Card>
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardHeader className="p-5 border-b border-zinc-850">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-500" />
                  AI Predictive Restocking
                </CardTitle>
                <Badge variant="secondary" className="text-[9px]">
                  PHASE 4
                </Badge>
              </div>
              <CardDescription className="text-xs text-zinc-400 font-mono">
                LLM FIFO layer velocity analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-3 font-mono text-xs text-zinc-400 leading-relaxed">
              <p>
                In Phase 4, an automated agent will compute layer depletion velocity curves, predicting when
                S-Type Load Cells or D-900s indicators will breach safety stock at Mashriq Centre HQ.
              </p>
              <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800 text-zinc-300 text-[11px]">
                Forecast: Platform Scale 500x600 re-order recommended by 18 Nov 2026.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

