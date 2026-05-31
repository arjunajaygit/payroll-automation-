import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireAuth } from "../../../../lib/auth";
import { generateSecurePDF } from "../../../../lib/pdf";
import { getFontBuffers } from "../../../../lib/fonts";
const archiver = require("archiver");
import { PassThrough } from "stream";

// Set maximum duration for this API route if hosted on Vercel
export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    const session = await requireAuth();
    const adminId = session.userId;
    const url = new URL(request.url);
    const month = url.searchParams.get("month");
    const year = url.searchParams.get("year");

    if (!month || !year) {
      return NextResponse.json({ error: "Missing month or year parameters" }, { status: 400 });
    }

    const salaries = await prisma.salary.findMany({
      where: {
        adminId,
        month,
        year: parseInt(year)
      },
      include: {
        employee: true
      }
    });

    if (salaries.length === 0) {
      return NextResponse.json({ error: "No salary records found for this period" }, { status: 404 });
    }

    const fonts = await getFontBuffers();
    const regularFont = fonts.regular;
    const boldFont = fonts.bold;

    const archive = archiver.create('zip', {
      zlib: { level: 5 } // Standard compression
    });

    const passThrough = new PassThrough();
    archive.pipe(passThrough);

    // Process PDFs asynchronously and add to archive
    const processPDFs = async () => {
      try {
        // Generate PDFs sequentially to avoid memory spikes
        for (const salary of salaries) {
          const employeeData = {
            ...salary.employee,
            baseSalary: salary.baseSalary,
            hra: salary.hra,
            allowances: salary.allowances,
            deductions: salary.deductions,
            netSalary: salary.netSalary,
            month: salary.month,
            year: salary.year
          };

          const pdfBuffer = await generateSecurePDF(employeeData, regularFont, boldFont, true);
          
          // Naming convention: EMP001_Arjun_May2026.pdf
          const fileName = `${salary.employee.employeeId}_${salary.employee.name.replace(/[^a-zA-Z0-9]/g, '_')}_${salary.month}${salary.year}.pdf`;
          
          archive.append(pdfBuffer, { name: fileName });
        }
        await archive.finalize();
      } catch (err) {
        console.error("Error generating PDFs for ZIP:", err);
        archive.abort();
      }
    };

    // Start processing in the background while returning the stream
    processPDFs();

    // Convert Node stream to Web stream
    // Using any because Node's ReadableStream is not fully compatible with Web ReadableStream in TypeScript types
    const stream = new ReadableStream({
      start(controller) {
        passThrough.on('data', (chunk) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        passThrough.on('end', () => {
          controller.close();
        });
        passThrough.on('error', (err) => {
          controller.error(err);
        });
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="payslips_${month}_${year}.zip"`,
        'Cache-Control': 'no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error("Export zip error:", error);
    return NextResponse.json({ error: "Failed to generate ZIP archive" }, { status: 500 });
  }
}
