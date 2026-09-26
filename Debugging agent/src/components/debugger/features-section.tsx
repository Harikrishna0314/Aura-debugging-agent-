import {
  BrainCircuit,
  GitCompareArrows,
  Languages,
  ListChecks,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const FEATURES = [
  {
    icon: Languages,
    title: "Every programming language",
    desc: "Python, JavaScript, Java, C, C++, Go, Rust, SQL, PHP, Ruby, Swift, Kotlin and more — the agent understands syntax and idioms across the board.",
  },
  {
    icon: BrainCircuit,
    title: "LLM reasoning, not pattern matching",
    desc: "Powered by a large language model that reads your code, reasons about control flow and types, and explains the logic behind each fix.",
  },
  {
    icon: ListChecks,
    title: "Issue-by-issue breakdown",
    desc: "Each bug is classified by type (syntax, logic, runtime, performance, security) and severity, with the exact line and a concrete suggestion.",
  },
  {
    icon: GitCompareArrows,
    title: "Original vs. corrected code",
    desc: "Get the full corrected source back, ready to copy, alongside a side-by-side diff of what changed and why.",
  },
  {
    icon: ShieldCheck,
    title: "Catches security bugs too",
    desc: "From SQL injection to unsafe deserialisation — the agent flags security issues most linters silently ignore.",
  },
  {
    icon: Sparkles,
    title: "Built for learning",
    desc: "Step-by-step Markdown explanations turn every bug into a mini lesson — perfect for a final-year AI & DS project.",
  },
];

export function FeaturesSection() {
  return (
    <section id="how" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
          Why AuraDebug.inn
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          An AI agent that debugs like a senior engineer
        </h2>
        <p className="mt-3 text-muted-foreground">
          Paste any snippet. The agent reads it, reasons about what is wrong,
          and hands you back correct code with the logic explained.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="group rounded-2xl border border-border bg-card/60 p-6 transition-all hover:border-emerald-500/40 hover:bg-card hover:shadow-lg hover:shadow-emerald-500/5"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 transition-colors group-hover:bg-emerald-500/15 dark:text-emerald-400">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              {f.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
