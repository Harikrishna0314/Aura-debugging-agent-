"use client";

import {
  AlertTriangle,
  Bug,
  Info,
  ShieldAlert,
  Snail,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DebugIssue, IssueSeverity, IssueType } from "@/lib/debug-types";
import { Badge } from "@/components/ui/badge";

const SEVERITY_STYLE: Record<
  IssueSeverity,
  { label: string; className: string; icon: typeof Bug; ring: string }
> = {
  critical: {
    label: "Critical",
    className: "bg-red-500/10 text-red-500 border-red-500/30",
    icon: ShieldAlert,
    ring: "before:bg-red-500",
  },
  warning: {
    label: "Warning",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    icon: AlertTriangle,
    ring: "before:bg-amber-500",
  },
  info: {
    label: "Info",
    className: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
    icon: Info,
    ring: "before:bg-sky-500",
  },
};

const TYPE_META: Record<IssueType, { label: string; icon: typeof Bug }> = {
  syntax: { label: "Syntax", icon: Bug },
  logic: { label: "Logic", icon: AlertTriangle },
  runtime: { label: "Runtime", icon: Zap },
  performance: { label: "Performance", icon: Snail },
  security: { label: "Security", icon: ShieldAlert },
  style: { label: "Style", icon: Sparkles },
  "best-practice": { label: "Best Practice", icon: Sparkles },
};

export function IssueCard({ issue, index }: { issue: DebugIssue; index: number }) {
  const sev = SEVERITY_STYLE[issue.severity];
  const typeMeta = TYPE_META[issue.type];
  const SevIcon = sev.icon;
  const TypeIcon = typeMeta.icon;

  return (
    <div
      className={cn(
        "relative rounded-xl border border-border bg-card/60 p-4 pl-5 transition-colors hover:bg-card",
        "before:absolute before:left-0 before:top-3 before:bottom-3 before:w-1 before:rounded-full",
        sev.ring
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
          {index + 1}
        </span>
        <h4 className="text-sm font-semibold text-foreground">{issue.title}</h4>
        {issue.line !== null && (
          <Badge variant="outline" className="font-mono text-[10px]">
            line {issue.line}
          </Badge>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
            sev.className
          )}
        >
          <SevIcon className="h-3 w-3" />
          {sev.label}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          <TypeIcon className="h-3 w-3" />
          {typeMeta.label}
        </span>
      </div>

      {issue.description && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {issue.description}
        </p>
      )}
      {issue.suggestion && (
        <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            Suggested fix
          </p>
          <p className="mt-1 text-sm leading-relaxed text-foreground/90">
            {issue.suggestion}
          </p>
        </div>
      )}
    </div>
  );
}
