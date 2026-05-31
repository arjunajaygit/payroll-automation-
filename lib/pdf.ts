import PDFDocument from "pdfkit";
import QRCode from "qrcode";

function inr(value: number): string {
  return `\u20b9${value.toLocaleString("en-IN")}`;
}

function slugId(employee: any): string {
  const shortMonth = employee.month.slice(0, 3).toUpperCase();
  const hash = Math.abs(
    (employee.employeeId + employee.month + employee.year)
      .split("")
      .reduce((acc: number, c: string) => acc * 31 + c.charCodeAt(0), 0)
  )
    .toString(16)
    .toUpperCase()
    .slice(0, 6);
  return `SLIP-${employee.employeeId}-${shortMonth}${employee.year}-${hash}`;
}

export async function generateSecurePDF(
  employee: any,
  fontBuffer: Buffer,
  boldFontBuffer: Buffer,
  isSecure: boolean = true,
  baseUrl: string = "http://localhost:3000"
): Promise<Buffer> {
  const slipId = slugId(employee);

  const verificationUrl = `${baseUrl}/verify?id=${encodeURIComponent(slipId)}&name=${encodeURIComponent(employee.name)}&empId=${encodeURIComponent(employee.employeeId)}&period=${encodeURIComponent(`${employee.month} ${employee.year}`)}`;
  
  const qrDataUrl: string = await QRCode.toDataURL(verificationUrl, {
    width: 120,
    margin: 1,
    color: { dark: "#0f172a", light: "#ffffff" },
  });
  const qrBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");

  return new Promise((resolve, reject) => {
    const pdfOptions: any = {
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      size: "A4",
      info: {
        Title: `Payslip - ${employee.name} - ${employee.month} ${employee.year}`,
        Author: "PayrollPro",
        Subject: "Salary Payslip",
      },
    };

    if (isSecure) {
      const namePart = employee.name.substring(0, 4).toUpperCase();
      const password = `${namePart}${employee.birthYear}`;
      pdfOptions.userPassword = password;
      pdfOptions.ownerPassword = password;
      pdfOptions.permissions = { printing: "highResolution" };
    }

    const doc = new PDFDocument(pdfOptions);
    const buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    doc.registerFont("Regular", fontBuffer);
    doc.registerFont("Bold", boldFontBuffer);

    const W = 595.28; 
    const H = 841.89; 

    const logoX = 48;
    const logoY = 40;
    doc.save()
       .translate(logoX, logoY)
       .scale(1.8)
       .path("M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z")
       .lineWidth(2)
       .strokeColor("#3b82f6")
       .stroke()
       .restore();

    doc.fontSize(22).font("Bold").fillColor("#0f172a").text("PayrollPro", logoX + 54, logoY + 12);
    doc.fontSize(9).font("Regular").fillColor("#64748b").text("Automated Payroll System", logoX + 54, logoY + 36);

    doc.fontSize(24).font("Bold").fillColor("#0f172a").text("PAYSLIP", 0, logoY + 12, { align: "right", width: W - 48 });
    doc.fontSize(10).font("Regular").fillColor("#64748b").text(`${employee.month.toUpperCase()} ${employee.year}`, 0, logoY + 38, { align: "right", width: W - 48 });

    doc.moveTo(48, 110).lineTo(W - 48, 110).lineWidth(1).strokeColor("#e2e8f0").stroke();

    const yInfo = 130;
    
    doc.fontSize(9).font("Regular").fillColor("#64748b").text("EMPLOYEE DETAILS", 48, yInfo);

    doc.fontSize(12).font("Bold").fillColor("#0f172a").text(employee.name, 48, yInfo + 18);
    doc.fontSize(10).font("Regular").fillColor("#475569").text(`ID: ${employee.employeeId}`, 48, yInfo + 34);
    doc.fontSize(10).font("Regular").fillColor("#475569").text(employee.designation, 48, yInfo + 48);

    doc.fontSize(9).font("Regular").fillColor("#64748b").text("PAYMENT INFO", 320, yInfo);
    doc.fontSize(10).font("Regular").fillColor("#475569").text(`Period: ${employee.month} ${employee.year}`, 320, yInfo + 18);
    
    const genDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
    doc.fontSize(10).font("Regular").fillColor("#475569").text(`Generated: ${genDate}`, 320, yInfo + 34);
    doc.fontSize(10).font("Regular").fillColor("#475569").text(`Status: Paid`, 320, yInfo + 48);

    const yTable = 230;

    doc.rect(48, yTable, W - 96, 30).fill("#f8fafc");
    doc.fontSize(9).font("Bold").fillColor("#475569");
    doc.text("EARNINGS", 60, yTable + 10);
    doc.text("AMOUNT", 200, yTable + 10, { width: 80, align: "right" });
    
    doc.text("DEDUCTIONS", 320, yTable + 10);
    doc.text("AMOUNT", 460, yTable + 10, { width: 70, align: "right" });

    const yRow1 = yTable + 40;
    const yRow2 = yRow1 + 25;
    const yRow3 = yRow2 + 25;

    doc.fontSize(10).font("Regular").fillColor("#0f172a");

    doc.text("Basic Salary", 60, yRow1);
    doc.text(inr(employee.baseSalary), 200, yRow1, { width: 80, align: "right" });

    doc.text("House Rent Allowance", 60, yRow2);
    doc.text(inr(employee.hra), 200, yRow2, { width: 80, align: "right" });

    doc.text("Special Allowances", 60, yRow3);
    doc.text(inr(employee.allowances), 200, yRow3, { width: 80, align: "right" });

    doc.text("Statutory Deductions", 320, yRow1);
    doc.text(inr(employee.deductions), 460, yRow1, { width: 70, align: "right" });

    const yTotalLine = yRow3 + 30;
    doc.moveTo(48, yTotalLine).lineTo(W - 48, yTotalLine).lineWidth(1).strokeColor("#e2e8f0").stroke();

    const yTotals = yTotalLine + 15;
    const grossEarnings = employee.baseSalary + employee.hra + employee.allowances;

    doc.fontSize(10).font("Bold").fillColor("#0f172a");
    doc.text("Gross Earnings", 60, yTotals);
    doc.text(inr(grossEarnings), 200, yTotals, { width: 80, align: "right" });

    doc.text("Total Deductions", 320, yTotals);
    doc.text(inr(employee.deductions), 460, yTotals, { width: 70, align: "right" });

    const yNetBox = yTotals + 50;
    doc.rect(48, yNetBox, W - 96, 60).fill("#eff6ff");
    
    doc.fontSize(12).font("Bold").fillColor("#1e40af").text("NET PAYABLE AMOUNT", 70, yNetBox + 22);
    doc.fontSize(20).font("Bold").fillColor("#1e40af").text(inr(employee.netSalary), 0, yNetBox + 18, { align: "right", width: W - 70 });

    doc.fontSize(9).font("Regular").fillColor("#3b82f6").text(`Slip ID: ${slipId}`, 70, yNetBox + 38);

    const yFooterInfo = yNetBox + 100;

    doc.rect(48, yFooterInfo, 80, 80).strokeColor("#e2e8f0").lineWidth(1).stroke();
    doc.image(qrBuffer, 49, yFooterInfo + 1, { width: 78, height: 78 });
    
    doc.fontSize(10).font("Bold").fillColor("#0f172a").text("Scan to Verify", 140, yFooterInfo + 10);
    doc.fontSize(9).font("Regular").fillColor("#64748b").text("Scan this QR code with your mobile device to verify the authenticity of this document online.", 140, yFooterInfo + 26, { width: 160 });

    const sigX = 350;
    doc.moveTo(sigX, yFooterInfo + 60).lineTo(W - 48, yFooterInfo + 60).lineWidth(1).strokeColor("#94a3b8").stroke();
    doc.fontSize(10).font("Bold").fillColor("#0f172a").text("Authorized Signature", sigX, yFooterInfo + 70, { align: "center", width: W - 48 - sigX });

    if (!isSecure) {
      doc
        .save()
        .translate(W / 2, H / 2)
        .rotate(-45)
        .fontSize(80)
        .font("Bold")
        .fillColor("#cbd5e1")
        .fillOpacity(0.3)
        .text("PREVIEW", -180, -40)
        .restore()
        .fillOpacity(1);
    }

    doc.moveTo(48, H - 60).lineTo(W - 48, H - 60).lineWidth(1).strokeColor("#e2e8f0").stroke();
    doc.fontSize(8).font("Regular").fillColor("#94a3b8").text(
      "This is a system-generated document. It does not require a physical signature.",
      48, H - 45, { align: "center", width: W - 96 }
    );

    doc.end();
  });
}
