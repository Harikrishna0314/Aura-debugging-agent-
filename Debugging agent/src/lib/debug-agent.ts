import ZAI from "z-ai-web-dev-sdk";
import type { DebugIssue, DebugResult, IssueSeverity, IssueType } from "./debug-types";

/**
 * AuraDebug.inn core agent.
 *
 * Uses the z-ai-web-dev-sdk LLM to analyse code in ANY programming language,
 * detect bugs, and produce a corrected version with step-by-step reasoning.
 *
 * IMPORTANT: z-ai-web-dev-sdk is backend-only. Never import this module from
 * client code.
 */

const SYSTEM_PROMPT = `You are AuraDebug.inn, an elite AI code-debugging agent built for a final-year AI & Data Science project.
You can debug code written in ANY programming language (Python, JavaScript, TypeScript, Java, C, C++, C#, Go, Rust, PHP, Ruby, Swift, Kotlin, SQL, HTML, CSS, Bash, R, Scala, Dart, and many more).

Your job:
1. Carefully analyse the provided code for bugs across these categories:
   - syntax      : language grammar / parsing errors
   - logic       : incorrect algorithm, wrong condition, off-by-one, wrong operator
   - runtime     : null/undefined access, index out of bounds, division by zero, type errors
   - performance : avoidable O(n^2), redundant work, memory leaks
   - security    : injection, leaks of secrets, unsafe deserialisation
   - style       : readability, naming
   - best-practice : idiomatic improvements
2. Produce a corrected version of the ENTIRE code that fixes every real bug.
3. Explain your reasoning step by step in Markdown so a student can learn from it.

STRICT OUTPUT RULES:
- Respond with ONE single JSON object and NOTHING else.
- Do NOT wrap the JSON in markdown fences.
- Do NOT add any prose before or after the JSON.
- All strings must be properly escaped JSON strings.
- Use exactly this schema:
{
  "language": "<the language you analysed>",
  "summary": "<one or two sentence overview of what was wrong>",
  "hasBugs": <true | false>,
  "issues": [
    {
      "type": "syntax" | "logic" | "runtime" | "performance" | "security" | "style" | "best-practice",
      "severity": "critical" | "warning" | "info",
      "line": <1-based line number or null>,
      "title": "<short title>",
      "description": "<what is wrong and why it is a bug>",
      "suggestion": "<concrete fix recommendation>"
    }
  ],
  "fixedCode": "<the full corrected code, plain text, no markdown fences>",
  "explanation": "<Markdown, step-by-step reasoning of each fix and the underlying logic>"
}

If the code is already correct, set hasBugs to false, provide the same code as fixedCode, an empty issues array, and explain why it is correct.`;

function extractJson(raw: string): string {
  let text = raw.trim();
  // Strip markdown code fences if the model added them despite instructions.
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  }
  // If there is still surrounding prose, grab the outermost JSON object.
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }
  return text;
}

const VALID_TYPES: IssueType[] = [
  "syntax",
  "logic",
  "runtime",
  "performance",
  "security",
  "style",
  "best-practice",
];
const VALID_SEVERITIES: IssueSeverity[] = ["critical", "warning", "info"];

function normaliseIssues(raw: unknown): DebugIssue[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item): DebugIssue | null => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const type = (VALID_TYPES as string[]).includes(obj.type as string)
        ? (obj.type as IssueType)
        : "logic";
      const severity = (VALID_SEVERITIES as string[]).includes(obj.severity as string)
        ? (obj.severity as IssueSeverity)
        : "warning";
      const line =
        typeof obj.line === "number" && Number.isFinite(obj.line) && obj.line > 0
          ? Math.floor(obj.line)
          : null;
      return {
        type,
        severity,
        line,
        title: String(obj.title ?? "Untitled issue"),
        description: String(obj.description ?? ""),
        suggestion: String(obj.suggestion ?? ""),
      };
    })
    .filter((x): x is DebugIssue => x !== null);
}

function safeParse(raw: string, fallbackLanguage: string): DebugResult {
  const jsonText = extractJson(raw);
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    // Last-resort: return the raw text as the explanation so the user still sees something.
    return {
      language: fallbackLanguage,
      summary: "The agent could not return structured output.",
      hasBugs: true,
      issues: [],
      fixedCode: "",
      explanation:
        "The model did not return valid JSON. Raw response:\n\n```\n" + raw + "\n```",
    };
  }

  return {
    language: String(parsed.language ?? fallbackLanguage),
    summary: String(parsed.summary ?? ""),
    hasBugs: Boolean(parsed.hasBugs ?? true),
    issues: normaliseIssues(parsed.issues),
    fixedCode: String(parsed.fixedCode ?? ""),
    explanation: String(parsed.explanation ?? ""),
  };
}

export interface DebugAgentInput {
  code: string;
  language: string;
  hint?: string;
}

export async function runDebugAgent({
  code,
  language,
  hint,
}: DebugAgentInput): Promise<DebugResult> {
  const zai = await ZAI.create();

  const userMessage = [
    `Language: ${language}`,
    hint ? `Observed behaviour / hint from the developer: ${hint}` : "",
    "Code to debug:",
    "```",
    code,
    "```",
    "",
    "Analyse this code, find every bug, return the full corrected code and a step-by-step explanation. Respond with the JSON object only.",
  ]
    .filter(Boolean)
    .join("\n");

  const completion = await zai.chat.completions.create({
    messages: [
      { role: "assistant", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    thinking: { type: "disabled" },
  });

  const raw = completion.choices[0]?.message?.content ?? "";
  return safeParse(raw, language);
}
