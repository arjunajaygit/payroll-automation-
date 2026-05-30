import PDFDocument from "pdfkit";

export async function generateSecurePDF(employee: any, fontBuffer: Buffer, boldFontBuffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const namePart = employee.name.substring(0, 4).toUpperCase();
    const password = `${namePart}${employee.birthYear}`;

    const doc = new PDFDocument({
      userPassword: password,
      ownerPassword: password,
      permissions: { printing: "highResolution" },
      margin: 50,
      size: 'A4'
    });

    const buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    doc.registerFont("CustomRoboto", fontBuffer);
    doc.registerFont("CustomRobotoBold", boldFontBuffer);

    // --- 1. HEADER SECTION ---
    doc.fontSize(24).font("CustomRobotoBold").fillColor('#1e3a8a').text("Company Name Inc.", { align: "center" });
    doc.fontSize(10).font("CustomRoboto").fillColor('#6b7280').text("123 Tech Boulevard, Silicon Valley, CA 94025", { align: "center" });
    doc.moveDown(2);
    
    doc.fontSize(16).font("CustomRobotoBold").fillColor('#111827').text("PAYSLIP", { align: "center", underline: true });
    doc.moveDown(1.5);

    // --- 2. EMPLOYEE DETAILS BOX ---
    doc.rect(50, doc.y, 495, 65).strokeColor('#d1d5db').lineWidth(1).stroke(); // Draw a border box
    const detailsY = doc.y + 10;
    
    doc.fontSize(10).font("CustomRobotoBold").fillColor('#374151');
    // Left column
    doc.text("Employee ID:", 65, detailsY);
    doc.text("Name:", 65, detailsY + 15);
    doc.text("Designation:", 65, detailsY + 30);
    // Left column values
    doc.font("CustomRoboto").fillColor('#111827');
    doc.text(employee.employeeId, 140, detailsY);
    doc.text(employee.name, 140, detailsY + 15);
    doc.text(employee.designation, 140, detailsY + 30);

    // Right column
    doc.font("CustomRobotoBold").fillColor('#374151');
    doc.text("Pay Period:", 350, detailsY);
    doc.text("Generated On:", 350, detailsY + 15);
    // Right column values
    doc.font("CustomRoboto").fillColor('#111827');
    doc.text(`${employee.month} ${employee.year}`, 425, detailsY);
    doc.text(new Date().toLocaleDateString(), 425, detailsY + 15);

    doc.y = detailsY + 70; // Move cursor below the box

    // --- 3. SALARY TABLE HEADER ---
    doc.fillColor('#f3f4f6').rect(50, doc.y, 495, 25).fill(); // Grey background
    const tableHeaderY = doc.y + 7;
    
    doc.fontSize(11).font("CustomRobotoBold").fillColor('#111827');
    doc.text("Earnings & Deductions", 65, tableHeaderY);
    doc.text("Amount (Rs.)", 400, tableHeaderY, { width: 130, align: "right" });
    
    doc.y = tableHeaderY + 25;

    // --- 4. SALARY ROWS (Perfectly Aligned) ---
    const drawRow = (label: string, amount: number, isDeduction = false) => {
      doc.fontSize(10).font("CustomRoboto").fillColor('#374151');
      doc.text(label, 65, doc.y);
      
      const amountStr = isDeduction ? `- ${amount.toLocaleString()}` : amount.toLocaleString();
      const color = isDeduction ? '#ef4444' : '#111827'; // Red for deductions
      
      doc.font("CustomRoboto").fillColor(color);
      // We use a fixed width of 130 and align right so the decimals line up perfectly
      doc.text(amountStr, 400, doc.y - 12, { width: 130, align: "right" }); 
      doc.moveDown(0.8);
    };

    drawRow("Base Salary", employee.baseSalary);
    drawRow("House Rent Allowance (HRA)", employee.hra);
    drawRow("Special Allowances", employee.allowances);
    drawRow("Tax & Deductions", employee.deductions, true);

    doc.moveDown(1);

    // --- 5. NET SALARY BOX ---
    doc.fillColor('#dcfce7').rect(50, doc.y, 495, 35).fill(); // Light green background
    const netY = doc.y + 10;
    
    doc.fontSize(12).font("CustomRobotoBold").fillColor('#166534'); // Dark green text
    doc.text("NET PAYABLE SALARY:", 65, netY);
    doc.text(`Rs. ${employee.netSalary.toLocaleString()}`, 400, netY, { width: 130, align: "right" });

    // --- 6. FOOTER ---
    doc.y = 700;

    // Top line
    doc.moveTo(50, doc.y)
       .lineTo(545, doc.y)
       .strokeColor('#d1d5db')
       .stroke();

    doc.moveDown(1);

    // Footer text
    doc.fontSize(9)
       .font("CustomRoboto")
       .fillColor('#9ca3af')
       .text(
          "This is a computer-generated document. No signature is required. For any discrepancies, please contact HR immediately.",
          50, // x position
          doc.y, // y position
          {
            width: 495,
            align: "center"
          }
       );
    doc.end();
  });
}
