"use client";

import * as React from "react";
import { Clock, History, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DebugSessionRecord } from "@/lib/debug-types";
import { useToast } from "@/hooks/use-toast";

interface HistoryPanelProps {
  sessions: DebugSessionRecord[];
  activeId: string | null;
  onSelect: (session: DebugSessionRecord) => void;
  onRefresh: () => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function HistoryPanel({
  sessions,
  activeId,
  onSelect,
  onRefresh,
}: HistoryPanelProps) {
  const { toast } = useToast();
  const [clearing, setClearing] = React.useState(false);

  const clearAll = async () => {
    setClearing(true);
    try {
      const res = await fetch("/api/history", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "History cleared" });
      onRefresh();
    } catch {
      toast({
        title: "Could not clear history",
        variant: "destructive",
      });
    } finally {
      setClearing(false);
    }
  };

  return (
    <section id="history" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-xl font-semibold text-foreground">
            Recent debug sessions
          </h2>
          {sessions.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {sessions.length}
            </Badge>
          )}
        </div>
        {sessions.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            disabled={clearing}
            className="gap-1.5 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Clear all
          </Button>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 py-14 text-center">
          <Clock className="h-8 w-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm text-muted-foreground">
            No sessions yet. Debug some code and your history will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((s) => {
            const critical = s.issues.filter((i) => i.severity === "critical").length;
            const warnings = s.issues.filter((i) => i.severity === "warning").length;
            return (
              <button
                key={s.id}
                onClick={() => onSelect(s)}
                className={cn(
                  "group flex flex-col rounded-xl border bg-card/60 p-4 text-left transition-all hover:border-emerald-500/40 hover:bg-card hover:shadow-md",
                  activeId === s.id
                    ? "border-emerald-500/60 ring-1 ring-emerald-500/30"
                    : "border-border"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] uppercase"
                  >
                    {s.language}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {timeAgo(s.createdAt)}
                  </span>
                </div>

                <p className="mt-2 line-clamp-2 text-sm font-medium text-foreground">
                  {s.summary || "Debug session"}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                  {s.hasBugs ? (
                    <>
                      {critical > 0 && (
                        <span className="rounded-full bg-red-500/10 px-2 py-0.5 font-medium text-red-500">
                          {critical} critical
                        </span>
                      )}
                      {warnings > 0 && (
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 font-medium text-amber-600 dark:text-amber-400">
                          {warnings} warning{warnings > 1 ? "s" : ""}
                        </span>
                      )}
                      {s.issues.length === 0 && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                          analysed
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-600 dark:text-emerald-400">
                      no bugs found
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
