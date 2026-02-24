"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";

const statusStyles: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  resolved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  in_progress: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  abandoned: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  error: "bg-red-500/10 text-red-600 border-red-500/20",
  escalated: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

const statusLabels: Record<string, string> = {
  completed: "Completed",
  resolved: "Resolved",
  in_progress: "In Progress",
  abandoned: "Abandoned",
  error: "Error",
  escalated: "Escalated",
};

export interface CallData {
  id: string;
  caller: string;
  agent: string;
  duration: string;
  status: string;
  time: string;
  order?: {
    id: string;
    total: number;
    items: {
      name: string;
      quantity: number;
      price: number;
    }[];
  } | null;
}

interface RecentCallsTableProps {
  calls?: CallData[];
}

export function RecentCallsTable({ calls = [] }: RecentCallsTableProps) {
  const [selectedCall, setSelectedCall] = useState<CallData | null>(null);

  return (
    <>
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Recent Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 text-xs font-medium text-muted-foreground">Caller</th>
                  <th className="pb-3 text-xs font-medium text-muted-foreground">Agent</th>
                  <th className="pb-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 text-xs font-medium text-muted-foreground">Order</th>
                  <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody>
                {calls.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                      No recent calls
                    </td>
                  </tr>
                ) : (
                  calls.map((call) => (
                    <tr
                      key={call.id}
                      onClick={() => setSelectedCall(call)}
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 text-sm font-medium group-hover:underline decoration-muted-foreground/50 underline-offset-4">
                        {call.caller}
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">{call.agent}</td>
                      <td className="py-3">
                        <Badge variant="outline" className={statusStyles[call.status] || "bg-gray-100 text-gray-600"}>
                          {statusLabels[call.status] || call.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-sm tabular-nums">
                        {call.order ? (
                          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600">
                            <ShoppingBag className="size-3.5" />
                            {formatCurrency(call.order.total)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 text-right text-sm text-muted-foreground">{call.time}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedCall} onOpenChange={(open) => !open && setSelectedCall(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedCall?.caller}
            </DialogTitle>
            <DialogDescription>
              {selectedCall?.time}
              {" · "}
              {statusLabels[selectedCall?.status ?? ""] || selectedCall?.status}
            </DialogDescription>
          </DialogHeader>

          {selectedCall && (
            <div className="space-y-4">
              {selectedCall.order ? (
                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <ShoppingBag className="size-4 text-emerald-600" />
                    Order Summary
                  </div>
                  <div className="space-y-2">
                    {selectedCall.order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="tabular-nums">
                          {formatCurrency((Number(item.price) || 0) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-3 flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="tabular-nums text-emerald-600">
                      {formatCurrency(selectedCall.order.total)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-6 bg-muted/30 rounded-lg">
                  No order placed during this call
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
