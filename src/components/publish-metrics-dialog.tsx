"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

export function PublishMetricsDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [metricName, setMetricName] = useState("");
  const [metricValue, setMetricValue] = useState("");
  const [metricType, setMetricType] = useState("call_volume");
  const supabase = createClient();

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("voice_metrics").insert({
      metric_name: metricName,
      metric_value: parseFloat(metricValue),
      metric_type: metricType,
      recorded_at: new Date().toISOString(),
    });

    if (error) {
      toast.error("Failed to publish metric", {
        description: error.message,
      });
    } else {
      toast.success("Metric published", {
        description: `${metricName} has been recorded successfully.`,
      });
      setMetricName("");
      setMetricValue("");
      setOpen(false);
    }

    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-9 gap-1.5">
          <Plus className="h-4 w-4" />
          Publish Metric
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Publish a Metric</DialogTitle>
          <DialogDescription>
            Record a new voice agent metric to your Supabase database.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handlePublish} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="metric-type">Metric Type</Label>
            <Select value={metricType} onValueChange={setMetricType}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="call_volume">Call Volume</SelectItem>
                <SelectItem value="avg_duration">Avg Duration (sec)</SelectItem>
                <SelectItem value="success_rate">Success Rate (%)</SelectItem>
                <SelectItem value="active_agents">Active Agents</SelectItem>
                <SelectItem value="escalation_rate">Escalation Rate (%)</SelectItem>
                <SelectItem value="customer_satisfaction">CSAT Score</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="metric-name">Name / Label</Label>
            <Input
              id="metric-name"
              placeholder="e.g. Peak hour calls"
              value={metricName}
              onChange={(e) => setMetricName(e.target.value)}
              required
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metric-value">Value</Label>
            <Input
              id="metric-value"
              type="number"
              step="any"
              placeholder="e.g. 1250"
              value={metricValue}
              onChange={(e) => setMetricValue(e.target.value)}
              required
              className="h-10"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publish
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
