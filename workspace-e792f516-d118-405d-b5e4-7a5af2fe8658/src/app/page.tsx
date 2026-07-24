import {
  ArrowRight,
  Bug,
  Cpu,
  Languages,
  ListChecks,
  Play,
  Terminal,
} from "lucide-react";
import { SiteHeader } from "@/components/debugger/site-header";
import { DebuggerWorkspace } from "@/components/debugger/debugger-workspace";
import { FeaturesSection } from "@/components/debugger/features-section";
import { SUPPORTED_LANGUAGES } from "@/lib/debug-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* ---------- HERO ---------- */}
        <section className="relative overflow-hidden border-b border-border/60">
          {/* background glows + grid */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(16,185,129,0.12),transparent_70%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(120,120,120,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,120,120,0.05)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
          </div>

          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <Badge
                variant="outline"
                className="mx-auto mb-5 gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              >
                <Cpu className="h-3.5 w-3.5" />
                Final-year AI &amp; DS project · LLM-powered
              </Badge>

              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  AuraDebug
                </span>{" "}
                Agent
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
                AuraDebug.inn is an AI debugging agent powered by a large language
                model. Paste code in any language — it finds the bugs, returns
                the corrected source, and walks you through the reasoning step
                by step.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button
                  size="lg"
                  asChild
                  className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500"
                >
                  <a href="#workspace">
                    <Play className="h-4 w-4" />
                    Try it now
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild className="gap-2">
                  <a href="#how">
                    How it works
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>

              {/* language strip */}
              <div className="mt-10 flex flex-col items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <Languages className="h-3.5 w-3.5" />
                  Supports every major language
                </div>
                <div className="flex max-w-3xl flex-wrap items-center justify-center gap-1.5">
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <span
                      key={l.value}
                      className="rounded-md border border-border bg-card/60 px-2 py-1 font-mono text-[11px] text-muted-foreground"
                    >
                      {l.label}
                    </span>
                  ))}
                  <span className="rounded-md border border-dashed border-border px-2 py-1 font-mono text-[11px] text-muted-foreground">
                    + more
                  </span>
                </div>
              </div>
            </div>

            {/* stat row */}
            <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat icon={Languages} value="20+" label="Languages" />
              <Stat icon={ListChecks} value="7" label="Issue categories" />
              <Stat icon={Bug} value="∞" label="Snippets debugged" />
              <Stat icon={Cpu} value="LLM" label="Reasoning engine" />
            </div>
          </div>
        </section>

        {/* ---------- WORKSPACE ---------- */}
        <div className="py-12 sm:py-16">
          <DebuggerWorkspace />
        </div>

        {/* ---------- FEATURES ---------- */}
        <FeaturesSection />

        {/* ---------- HOW IT WORKS ---------- */}
        <section className="border-t border-border/60 bg-card/30">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                How it works
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Three steps from broken to bulletproof
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                {
                  step: "01",
                  icon: Terminal,
                  title: "Paste your code",
                  desc: "Choose a language and drop in any snippet — a function, a script, a query, anything. Add an optional hint about what goes wrong.",
                },
                {
                  step: "02",
                  icon: Cpu,
                  title: "The LLM agent reasons",
                  desc: "The model traces your code, checks types and control flow, and classifies each bug by category and severity with the exact line.",
                },
                {
                  step: "03",
                  icon: Bug,
                  title: "Get fixed code + logic",
                  desc: "Receive the corrected source ready to copy, an issue-by-issue breakdown, and a step-by-step Markdown explanation of the reasoning.",
                },
              ].map((s) => (
                <div
                  key={s.step}
                  className="relative rounded-2xl border border-border bg-background/60 p-6"
                >
                  <span className="absolute right-5 top-5 font-mono text-3xl font-bold text-emerald-500/20">
                    {s.step}
                  </span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ---------- FOOTER (sticky) ---------- */}
      <footer className="mt-auto border-t border-border/60 bg-card/30">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-center sm:flex-row sm:px-6 sm:text-left">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 text-white">
              <Bug className="h-4 w-4" />
            </span>
            <div className="text-sm">
              <p className="font-semibold text-foreground">AuraDebug.inn</p>
              <p className="text-xs text-muted-foreground">
                AI Code Debugging Agent · Final-year AI &amp; DS project
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Built with Next.js, TypeScript, Prisma &amp; the z-ai LLM SDK.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Bug;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-4 text-center">
      <Icon className="mx-auto h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
