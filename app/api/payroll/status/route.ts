import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth";
import { payrollQueue } from "../../../../lib/queue";

export async function GET(request: Request) {
  try {
    await requireAuth();
    
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ error: "Job ID required" }, { status: 400 });
    }

    const job = await payrollQueue.getJob(jobId);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const state = await job.getState();
    const progress = job.progress;

    return NextResponse.json({
      id: job.id,
      state, // e.g. 'active', 'completed', 'failed', 'waiting'
      progress: progress || { percent: 0, state: 'Pending...' },
      failedReason: job.failedReason
    });

  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 });
  }
}
