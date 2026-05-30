import { NextResponse } from "next/server";
import { requireAuth } from "../../../lib/auth";
import { payrollQueue } from "../../../lib/queue";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const adminId = session.userId;
    const { payrollData } = await request.json();

    if (!payrollData || payrollData.length === 0) {
      return NextResponse.json({ error: "No payroll data provided" }, { status: 400 });
    }

    // Enqueue the job for background processing
    const job = await payrollQueue.add('process-payroll', {
      payrollData,
      adminId
    });

    return NextResponse.json({ 
      message: "Job added to queue",
      jobId: job.id 
    }, { status: 202 });

  } catch (error) {
    console.error("Queue error:", error);
    return NextResponse.json({ error: "Failed to queue payroll" }, { status: 500 });
  }
}