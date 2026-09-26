"use client";

import * as React from "react";
import {
  AlertCircle,
  Bug,
  CheckCircle2,
  ChevronDown,
  Eraser,
  Lightbulb,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  Terminal,
  Wand2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

import {
  SUPPORTED_LANGUAGES,
  type DebugResult,
  type DebugSessionRecord,
} from "@/lib/debug-types";
import { SAMPLE_CODES } from "@/lib/debug-samples";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./code-block";
import { IssueCard } from "./issue-card";
import { HistoryPanel } from "./history-panel";

type ResultView = DebugResult & { originalCode: string };

function countBySeverity(result: DebugResult) {
  return {
    critical: result.issues.filter((i) => i.severity === "critical").length,
    warning: result.issues.filter((i) => i.severity === "warning").length,
    info: result.issues.filter((i) => i.severity === "info").length,
  };
}

export function DebuggerWorkspace() {
  const { toast } = useToast();
  const [language, setLanguage] = React.useState("python");
  const [code, setCode] = React.useState(SAMPLE_CODES[0].code);
  const [hint, setHint] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ResultView | null>(null);
  const [activeTab, setActiveTab] = React.useState("fixed");
  const [showOriginal, setShowOriginal] = React.useState(false);

  const [history, setHistory] = React.useState<DebugSessionRecord[]>([]);
  const [activeHistoryId, setActiveHistoryId] = React.useState<string | null>(
    null
  );

  const loadHistory = React.useCallback(async () => {
    try {
      const res = await fetch("/api/history?limit=24");
      const data = await res.json();
      if (data?.success) setHistory(data.sessions ?? []);
    } catch {
      /* ignore */
    }
  }, []);

  React.useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleDebug = async () => {
    if (!code.trim()) {
      toast({
        title: "Nothing to debug",
        description: "Paste some code first, or load a sample.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    setError(null);
    setActiveHistoryId(null);
    try {
      const res = await fetch("/api/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, hint: hint.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "The agent could not respond.");
      }
      const r = data.result as DebugResult;
      setResult({ ...r, originalCode: code });
      setActiveTab(r.fixedCode ? "fixed" : "issues");
      toast({
        title: r.hasBugs ? "Analysis complete" : "Code looks clean",
        description: r.hasBugs
          ? `${r.issues.length} issue${r.issues.length === 1 ? "" : "s"} found.`
          : "No bugs detected by the agent.",
      });
      loadHistory();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unexpected error.";
      setError(msg);
      toast({ title: "Debugging failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = (sampleId: string) => {
    const sample = SAMPLE_CODES.find((s) => s.id === sampleId);
    if (!sample) return;
    setLanguage(sample.language);
    setCode(sample.code);
    setHint(sample.hint);
    setResult(null);
    setError(null);
    setActiveHistoryId(null);
    toast({ title: "Sample loaded", description: sample.title });
  };

  const handleClear = () => {
    setCode("");
    setHint("");
    setResult(null);
    setError(null);
    setActiveHistoryId(null);
  };

  const handleSelectHistory = (s: DebugSessionRecord) => {
    setLanguage(s.language);
    setCode(s.originalCode);
    setHint("");
    setResult({
      language: s.language,
      summary: s.summary,
      hasBugs: s.hasBugs,
      issues: s.issues,
      fixedCode: s.fixedCode,
      explanation: s.explanation,
      originalCode: s.originalCode,
    });
    setActiveHistoryId(s.id);
    setError(null);
    setActiveTab(s.fixedCode ? "fixed" : "issues");
    if (typeof window !== "undefined") {
      document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const charCount = code.length;
  const lineCount = code ? code.split("\n").length : 0;

  return (
    <>
      <section id="workspace" className="mx-auto max-w-7xl scroll-mt-20 px-4 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
          {/* ---------- INPUT PANEL ---------- */}
          <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card/60 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[180px]" aria-label="Language">
                  <Terminal className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Samples
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuLabel>Load a buggy sample</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {SAMPLE_CODES.map((s) => (
                    <DropdownMenuItem
                      key={s.id}
                      onSelect={() => handleLoadSample(s.id)}
                      className="flex flex-col items-start gap-0.5"
                    >
                      <span className="text-sm font-medium">{s.title}</span>
                      <span className="line-clamp-1 text-xs text-muted-foreground">
                        {s.hint}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClear}
                      aria-label="Clear"
                      className="ml-auto"
                    >
                      <Eraser className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Clear editor</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Editor */}
            <div className="relative mt-3 flex-1">
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                placeholder="// Paste your buggy code here…"
                className="min-h-[340px] resize-none rounded-xl border-border bg-[#1e1e2e] font-mono text-[13px] leading-relaxed text-foreground shadow-inner placeholder:text-muted-foreground/50 focus-visible:ring-emerald-500/40 dark:text-slate-100"
              />
              <div className="pointer-events-none absolute bottom-2 right-3 flex items-center gap-2 text-[10px] text-muted-foreground/70">
                <span>{lineCount} lines</span>
                <span>·</span>
                <span>{charCount} chars</span>
              </div>
            </div>

            {/* Hint */}
            <div className="mt-3">
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Lightbulb className="h-3.5 w-3.5" />
                Observed bug / hint{" "}
                <span className="font-normal text-muted-foreground/60">
                  (optional)
                </span>
              </div>
              <Input
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                placeholder="e.g. crashes when the list is empty"
                className="bg-background"
              />
            </div>

            <Button
              onClick={handleDebug}
              disabled={loading}
              size="lg"
              className="mt-4 w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Debugging with AI…
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Debug my code
                </>
              )}
            </Button>
          </div>

          {/* ---------- OUTPUT PANEL ---------- */}
          <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card/60 p-4 sm:p-5">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Agent error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!result && !loading && !error && <EmptyState />}

            {loading && <LoadingState />}

            {result && !loading && (
              <ResultView
                result={result}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                showOriginal={showOriginal}
                setShowOriginal={setShowOriginal}
              />
            )}
          </div>
        </div>
      </section>

      <HistoryPanel
        sessions={history}
        activeId={activeHistoryId}
        onSelect={handleSelectHistory}
        onRefresh={loadHistory}
      />
    </>
  );
}

/* ----------------------------- sub-views ----------------------------- */

function EmptyState() {
  return (
    <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-center">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/10" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
          <Bug className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-foreground">
        Ready to squash some bugs
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Paste your code on the left, pick a language, and hit{" "}
        <span className="font-medium text-foreground">Debug my code</span>. The
        AI agent will analyse it and return a corrected version with full
        reasoning.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-center">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-foreground">
        The agent is reading your code…
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Tracing control flow, checking types, and reasoning about edge cases.
        This usually takes a few seconds.
      </p>
      <div className="mt-6 w-full max-w-sm space-y-2">
        {[100, 92, 96, 80].map((w, i) => (
          <div
            key={i}
            className="h-3 animate-pulse rounded-full bg-muted"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function ResultView({
  result,
  activeTab,
  setActiveTab,
  showOriginal,
  setShowOriginal,
}: {
  result: ResultView;
  activeTab: string;
  setActiveTab: (t: string) => void;
  showOriginal: boolean;
  setShowOriginal: (v: boolean) => void;
}) {
  const counts = countBySeverity(result);

  return (
    <div className="flex h-full flex-col">
      {/* Summary banner */}
      <div
        className={cn(
          "flex items-start gap-3 rounded-xl border p-4",
          result.hasBugs
            ? "border-amber-500/30 bg-amber-500/5"
            : "border-emerald-500/30 bg-emerald-500/5"
        )}
      >
        {result.hasBugs ? (
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        ) : (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {result.hasBugs
                ? `${result.issues.length} issue${
                    result.issues.length === 1 ? "" : "s"
                  } found`
                : "No bugs detected"}
            </span>
            <Badge
              variant="outline"
              className="font-mono text-[10px] uppercase"
            >
              {result.language}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.summary || "Analysis complete."}
          </p>
        </div>
      </div>

      {/* Severity chips */}
      {result.hasBugs && result.issues.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          <SevChip label="Critical" count={counts.critical} className="bg-red-500/10 text-red-500" />
          <SevChip label="Warning" count={counts.warning} className="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
          <SevChip label="Info" count={counts.info} className="bg-sky-500/10 text-sky-600 dark:text-sky-400" />
        </div>
      )}

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="mt-4 flex min-h-0 flex-1 flex-col"
      >
        <TabsList className="self-start">
          <TabsTrigger value="fixed" className="gap-1.5">
            <Play className="h-3.5 w-3.5" />
            Fixed code
          </TabsTrigger>
          <TabsTrigger value="issues" className="gap-1.5">
            <Bug className="h-3.5 w-3.5" />
            Issues
            {result.issues.length > 0 && (
              <span className="ml-1 rounded-full bg-muted px-1.5 text-[10px] font-semibold">
                {result.issues.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="explanation" className="gap-1.5">
            <Lightbulb className="h-3.5 w-3.5" />
            Logic
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="fixed"
          className="mt-3 min-h-0 flex-1 data-[state=inactive]:hidden"
        >
          {result.fixedCode ? (
            <div className="space-y-3">
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 text-xs text-muted-foreground"
                  onClick={() => setShowOriginal(!showOriginal)}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {showOriginal ? "Show fixed" : "Show original"}
                </Button>
              </div>
              <CodeBlock
                code={showOriginal ? result.originalCode : result.fixedCode}
                language={result.language}
                maxHeight="max-h-[30rem]"
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              The agent did not return corrected code.
            </p>
          )}
        </TabsContent>

        <TabsContent
          value="issues"
          className="mt-3 min-h-0 flex-1 data-[state=inactive]:hidden"
        >
          {result.issues.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              <p className="mt-3 text-sm font-medium text-foreground">
                No issues reported
              </p>
              <p className="text-xs text-muted-foreground">
                The agent could not find any bugs in this snippet.
              </p>
            </div>
          ) : (
            <div className="max-h-[34rem] space-y-3 overflow-y-auto pr-1 custom-scrollbar">
              {result.issues.map((issue, i) => (
                <IssueCard key={i} issue={issue} index={i} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="explanation"
          className="mt-3 min-h-0 flex-1 data-[state=inactive]:hidden"
        >
          <div className="prose prose-sm max-w-none rounded-xl border border-border bg-background/60 p-5 dark:prose-invert">
            {result.explanation ? (
              <ReactMarkdown
                components={{
                  code: ({ children, className, ...props }) => {
                    const isBlock = className?.includes("language-");
                    if (isBlock) {
                      return (
                        <pre className="my-3 overflow-x-auto rounded-lg bg-[#1e1e2e] p-3 text-xs">
                          <code className="font-mono text-slate-100" {...props}>
                            {children}
                          </code>
                        </pre>
                      );
                    }
                    return (
                      <code
                        className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {result.explanation}
              </ReactMarkdown>
            ) : (
              <p className="text-sm text-muted-foreground">
                No explanation was returned for this session.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SevChip({
  label,
  count,
  className,
}: {
  label: string;
  count: number;
  className: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        count === 0 && "opacity-40",
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {count} {label}
    </span>
  );
}
