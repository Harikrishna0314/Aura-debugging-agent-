// Shared types for the AuraDebug.inn AI debugging agent.

export type IssueType =
  | "syntax"
  | "logic"
  | "runtime"
  | "performance"
  | "security"
  | "style"
  | "best-practice";

export type IssueSeverity = "critical" | "warning" | "info";

export interface DebugIssue {
  type: IssueType;
  severity: IssueSeverity;
  /** 1-based line number, or null if not applicable. */
  line: number | null;
  title: string;
  description: string;
  suggestion: string;
}

export interface DebugResult {
  language: string;
  summary: string;
  hasBugs: boolean;
  issues: DebugIssue[];
  fixedCode: string;
  /** Markdown explanation of the reasoning behind each fix. */
  explanation: string;
}

export interface DebugSessionRecord extends DebugResult {
  id: string;
  originalCode: string;
  createdAt: string;
}

export interface DebugApiRequest {
  code: string;
  language: string;
  /** Optional user hint about the observed bug/behavior. */
  hint?: string;
}

export interface DebugApiResponse {
  success: boolean;
  result?: DebugResult;
  error?: string;
}

export const SUPPORTED_LANGUAGES: { value: string; label: string; prism: string }[] = [
  { value: "javascript", label: "JavaScript", prism: "javascript" },
  { value: "typescript", label: "TypeScript", prism: "typescript" },
  { value: "python", label: "Python", prism: "python" },
  { value: "java", label: "Java", prism: "java" },
  { value: "c", label: "C", prism: "c" },
  { value: "cpp", label: "C++", prism: "cpp" },
  { value: "csharp", label: "C#", prism: "csharp" },
  { value: "go", label: "Go", prism: "go" },
  { value: "rust", label: "Rust", prism: "rust" },
  { value: "php", label: "PHP", prism: "php" },
  { value: "ruby", label: "Ruby", prism: "ruby" },
  { value: "swift", label: "Swift", prism: "swift" },
  { value: "kotlin", label: "Kotlin", prism: "kotlin" },
  { value: "sql", label: "SQL", prism: "sql" },
  { value: "html", label: "HTML", prism: "markup" },
  { value: "css", label: "CSS", prism: "css" },
  { value: "bash", label: "Bash / Shell", prism: "bash" },
  { value: "r", label: "R", prism: "r" },
  { value: "scala", label: "Scala", prism: "scala" },
  { value: "dart", label: "Dart", prism: "dart" },
];

export function prismLangFor(language: string): string {
  const found = SUPPORTED_LANGUAGES.find(
    (l) => l.value.toLowerCase() === language.toLowerCase()
  );
  return found?.prism ?? "javascript";
}
