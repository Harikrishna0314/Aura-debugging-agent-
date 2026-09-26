import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runDebugAgent } from "@/lib/debug-agent";
import type { DebugApiResponse, DebugApiRequest, DebugResult } from "@/lib/debug-types";

export const runtime = "nodejs";
// Debugging can take a while for large snippets; give the LLM room to answer.
export const maxDuration = 60;

function badRequest(message: string) {
  return NextResponse.json<DebugApiResponse>(
    { success: false, error: message },
    { status: 400 }
  );
}

export async function POST(request: Request) {
  let body: DebugApiRequest;
  try {
    body = (await request.json()) as DebugApiRequest;
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const code = (body?.code ?? "").trim();
  const language = (body?.language ?? "").trim();

  if (!code) return badRequest("No code provided.");
  if (!language) return badRequest("No programming language selected.");
  if (code.length > 12000) return badRequest("Code is too long (max 12,000 characters).");

  let result: DebugResult;
  try {
    result = await runDebugAgent({ code, language, hint: body.hint });
  } catch (err) {
    console.error("[/api/debug] agent error:", err);
    return NextResponse.json<DebugApiResponse>(
      {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "The debugging agent failed to respond. Please try again.",
      },
      { status: 502 }
    );
  }

  // Persist the session so it shows up in the user's history.
  try {
    await db.debugSession.create({
      data: {
        language: result.language,
        originalCode: code,
        fixedCode: result.fixedCode,
        summary: result.summary,
        hasBugs: result.hasBugs,
        issues: JSON.stringify(result.issues),
        explanation: result.explanation,
      },
    });
  } catch (err) {
    // History is best-effort; never fail the request because of it.
    console.error("[/api/debug] failed to persist session:", err);
  }

  return NextResponse.json<DebugApiResponse>({ success: true, result });
}
