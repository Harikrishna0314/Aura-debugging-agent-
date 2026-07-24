import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { DebugIssue, DebugSessionRecord } from "@/lib/debug-types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(
    Number(searchParams.get("limit") ?? "20"),
    50
  );

  let sessions;
  try {
    sessions = await db.debugSession.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch (err) {
    console.error("[/api/history] query failed:", err);
    return NextResponse.json(
      { success: false, error: "Could not load history.", sessions: [] },
      { status: 500 }
    );
  }

  const records: DebugSessionRecord[] = sessions.map((s) => {
    let issues: DebugIssue[] = [];
    try {
      issues = JSON.parse(s.issues ?? "[]") as DebugIssue[];
    } catch {
      issues = [];
    }
    return {
      id: s.id,
      language: s.language,
      summary: s.summary,
      hasBugs: s.hasBugs,
      issues,
      fixedCode: s.fixedCode,
      explanation: s.explanation,
      originalCode: s.originalCode,
      createdAt: s.createdAt.toISOString(),
    };
  });

  return NextResponse.json({ success: true, sessions: records });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  try {
    if (id) {
      await db.debugSession.delete({ where: { id } });
    } else {
      await db.debugSession.deleteMany({});
    }
  } catch (err) {
    console.error("[/api/history] delete failed:", err);
    return NextResponse.json(
      { success: false, error: "Could not delete session(s)." },
      { status: 500 }
    );
  }
  return NextResponse.json({ success: true });
}
