"use client";

import * as React from "react";
import { Check, Copy, GitCompareArrows, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type DiffKind = "same" | "change" | "remove" | "add";

interface DiffRow {
  left: string | null;
  right: string | null;
  leftLine: number | null;
  rightLine: number | null;
  kind: DiffKind;
}

type Operation =
  | { type: "same"; line: string; oldLine: number; newLine: number }
  | { type: "remove"; line: string; oldLine: number }
  | { type: "add"; line: string; newLine: number };

function buildDiffRows(originalCode: string, fixedCode: string): DiffRow[] {
  const oldLines = originalCode.split("\n");
  const newLines = fixedCode.split("\n");
  const n = oldLines.length;
  const m = newLines.length;
  const operations: Operation[] = [];

  // LCS gives a readable line diff for normal snippets. For unusually large
  // files, use a safe middle replacement rather than allocating a huge matrix.
  if ((n + 1) * (m + 1) <= 300_000) {
    const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        dp[i][j] = oldLines[i] === newLines[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }

    let i = 0;
    let j = 0;
    while (i < n && j < m) {
      if (oldLines[i] === newLines[j]) {
        operations.push({ type: "same", line: oldLines[i], oldLine: i + 1, newLine: j + 1 });
        i++;
        j++;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        operations.push({ type: "remove", line: oldLines[i], oldLine: i + 1 });
        i++;
      } else {
        operations.push({ type: "add", line: newLines[j], newLine: j + 1 });
        j++;
      }
    }
    while (i < n) {
      operations.push({ type: "remove", line: oldLines[i], oldLine: ++i });
    }
    while (j < m) {
      operations.push({ type: "add", line: newLines[j], newLine: ++j });
    }
  } else {
    let prefix = 0;
    while (prefix < n && prefix < m && oldLines[prefix] === newLines[prefix]) prefix++;
    let suffix = 0;
    while (
      suffix < n - prefix &&
      suffix < m - prefix &&
      oldLines[n - 1 - suffix] === newLines[m - 1 - suffix]
    ) suffix++;

    for (let i = 0; i < prefix; i++) {
      operations.push({ type: "same", line: oldLines[i], oldLine: i + 1, newLine: i + 1 });
    }
    for (let i = prefix; i < n - suffix; i++) {
      operations.push({ type: "remove", line: oldLines[i], oldLine: i + 1 });
    }
    for (let j = prefix; j < m - suffix; j++) {
      operations.push({ type: "add", line: newLines[j], newLine: j + 1 });
    }
    for (let offset = suffix; offset > 0; offset--) {
      const oldLine = n - offset + 1;
      const newLine = m - offset + 1;
      operations.push({
        type: "same",
        line: oldLines[oldLine - 1],
        oldLine,
        newLine,
      });
    }
  }

  const rows: DiffRow[] = [];
  let index = 0;
  while (index < operations.length) {
    const operation = operations[index];
    if (operation.type === "same") {
      rows.push({
        left: operation.line,
        right: operation.line,
        leftLine: operation.oldLine,
        rightLine: operation.newLine,
        kind: "same",
      });
      index++;
      continue;
    }

    const removed: Extract<Operation, { type: "remove" }>[] = [];
    const added: Extract<Operation, { type: "add" }>[] = [];
    while (index < operations.length && operations[index].type !== "same") {
      const current = operations[index++];
      if (current.type === "remove") removed.push(current);
      if (current.type === "add") added.push(current);
    }
    const count = Math.max(removed.length, added.length);
    for (let offset = 0; offset < count; offset++) {
      const left = removed[offset];
      const right = added[offset];
      rows.push({
        left: left?.line ?? null,
        right: right?.line ?? null,
        leftLine: left?.oldLine ?? null,
        rightLine: right?.newLine ?? null,
        kind: left && right ? "change" : left ? "remove" : "add",
      });
    }
  }
  return rows;
}

export function DiffViewer({
  originalCode,
  fixedCode,
  onAccept,
  onReject,
  decision,
}: {
  originalCode: string;
  fixedCode: string;
  onAccept: () => void;
  onReject: () => void;
  decision: "accepted" | "rejected" | null;
}) {
  const { toast } = useToast();
  const rows = React.useMemo(
    () => buildDiffRows(originalCode, fixedCode),
    [originalCode, fixedCode]
  );
  const changedCount = rows.filter((row) => row.kind !== "same").length;

  const copyFixed = async () => {
    try {
      await navigator.clipboard.writeText(fixedCode);
      toast({ title: "Fixed code copied", description: "The proposed fix is on your clipboard." });
    } catch {
      toast({ title: "Could not copy code", description: "Clipboard access was blocked by your browser.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background/60 p-3">
        <div className="flex items-center gap-2">
          <GitCompareArrows className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="text-sm font-semibold text-foreground">Review proposed fix</p>
            <p className="text-xs text-muted-foreground">
              {changedCount} changed line{changedCount === 1 ? "" : "s"} · Review before applying
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyFixed} className="gap-1.5">
            <Copy className="h-3.5 w-3.5" /> Copy fix
          </Button>
          <Button variant="outline" size="sm" onClick={onReject} className="gap-1.5" disabled={decision === "rejected"}>
            <X className="h-3.5 w-3.5" /> Reject
          </Button>
          <Button size="sm" onClick={onAccept} className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700" disabled={decision === "accepted"}>
            <Check className="h-3.5 w-3.5" /> Accept fix
          </Button>
        </div>
      </div>

      {decision && (
        <div className={cn(
          "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
          decision === "accepted"
            ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
            : "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400"
        )}>
          {decision === "accepted" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          {decision === "accepted"
            ? "Fix accepted and loaded into the editor. Your original version remains available in this diff."
            : "Fix rejected. Your editor still contains the original code."}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="grid grid-cols-2 border-b border-border bg-muted/60">
          <div className="flex items-center gap-2 border-r border-border px-3 py-2.5">
            <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400">Original</Badge>
            <span className="text-xs text-muted-foreground">Before</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2.5">
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">Proposed</Badge>
            <span className="text-xs text-muted-foreground">After</span>
          </div>
        </div>
        <div className="max-h-[34rem] overflow-auto font-mono text-xs leading-6">
          {rows.map((row, index) => (
            <div key={index} className="grid min-w-[560px] grid-cols-2">
              <div className={cn(
                "flex min-h-6 border-r border-border",
                row.kind === "change" || row.kind === "remove" ? "bg-red-500/10" : ""
              )}>
                <span className="w-10 shrink-0 select-none border-r border-border/60 px-2 text-right text-muted-foreground/60">
                  {row.leftLine ?? ""}
                </span>
                <pre className={cn(
                  "min-w-0 flex-1 whitespace-pre px-3",
                  row.kind === "change" || row.kind === "remove" ? "text-red-700 dark:text-red-300" : "text-foreground"
                )}>{row.left ?? ""}</pre>
              </div>
              <div className={cn(
                "flex min-h-6",
                row.kind === "change" || row.kind === "add" ? "bg-emerald-500/10" : ""
              )}>
                <span className="w-10 shrink-0 select-none border-r border-border/60 px-2 text-right text-muted-foreground/60">
                  {row.rightLine ?? ""}
                </span>
                <pre className={cn(
                  "min-w-0 flex-1 whitespace-pre px-3",
                  row.kind === "change" || row.kind === "add" ? "text-emerald-700 dark:text-emerald-300" : "text-foreground"
                )}>{row.right ?? ""}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Green lines are additions or replacements; red lines are removed or replaced. Aura does not execute the proposed code.
      </p>
    </div>
  );
}
