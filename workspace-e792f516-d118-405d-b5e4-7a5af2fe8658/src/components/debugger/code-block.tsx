"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { prismLangFor } from "@/lib/debug-types";

interface CodeBlockProps {
  code: string;
  language: string;
  /** Show the grey header bar with the language label. Default true. */
  showHeader?: boolean;
  className?: string;
  maxHeight?: string;
}

export function CodeBlock({
  code,
  language,
  showHeader = true,
  className,
  maxHeight = "max-h-[28rem]",
}: CodeBlockProps) {
  const { resolvedTheme } = useTheme();
  const [copied, setCopied] = React.useState(false);
  const isDark = resolvedTheme === "dark";
  const prismLang = prismLangFor(language);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-[#1e1e2e] text-sm",
        className
      )}
    >
      {showHeader && (
        <div className="flex items-center justify-between border-b border-white/10 bg-black/30 px-4 py-2">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-400/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
            <span className="h-3 w-3 rounded-full bg-green-400/80" />
            <span className="ml-2 font-mono text-xs text-muted-foreground">
              {language}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={copy}
            className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy
              </>
            )}
          </Button>
        </div>
      )}
      <div className={cn("overflow-auto custom-scrollbar", maxHeight)}>
        <SyntaxHighlighter
          language={prismLang}
          style={isDark ? oneDark : oneLight}
          showLineNumbers
          customStyle={{
            margin: 0,
            background: "transparent",
            padding: "1rem 1.25rem",
            fontSize: "0.8125rem",
            lineHeight: "1.6",
          }}
          lineNumberStyle={{
            color: "rgba(148,163,184,0.45)",
            paddingRight: "1em",
            userSelect: "none",
            minWidth: "2.5em",
          }}
          codeTagProps={{
            style: {
              fontFamily:
                "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
            },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
