"use client";

import Link from "next/link";
import { Bug, Github, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Badge } from "@/components/ui/badge";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
            <Bug className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight text-foreground">
              AuraDebug.inn
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              AI Debugging Agent
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <a href="#workspace">Workspace</a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="#how">How it works</a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="#history">History</a>
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="hidden gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 sm:inline-flex"
          >
            <Terminal className="h-3 w-3" />
            LLM-powered
          </Badge>
          <ModeToggle />
          <Button
            variant="outline"
            size="icon"
            asChild
            className="hidden rounded-full sm:inline-flex"
            aria-label="View source"
          >
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
