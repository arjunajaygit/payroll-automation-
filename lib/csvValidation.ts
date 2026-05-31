

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ValidationResult<T> = {
  isValid: boolean;
  errors: string[];
  data: T[];
};

export const validateEmployeeCSV = (rows: any[]): ValidationResult<any> => {
  const errors: string[] = [];
  const validData: any[] = [];
  const seenIds = new Set<string>();
  const seenEmails = new Set<string>();

  const expectedHeaders = ['employeeId', 'name', 'email', 'designation', 'birthYear'];

  if (!rows || rows.length === 0) {
    return { isValid: false, errors: ["CSV file is empty."], data: [] };
  }

  // Check if the file has the correct columns
  const firstRowKeys = Object.keys(rows[0]);
  const missingHeaders = expectedHeaders.filter(header => !firstRowKeys.includes(header));
  
  if (missingHeaders.length > 0) {
    return { 
      isValid: false, 
      errors: [`Invalid CSV format. Missing required columns: ${missingHeaders.join(', ')}. Please download and use the correct template.`], 
      data: [] 
    };
  }

  rows.forEach((row, index) => {
    const rowNum = index + 2; 

    const missingFields = expectedHeaders.filter(field => {
      const val = row[field];
      return val === undefined || val === null || String(val).trim() === '';
    });

    if (missingFields.length > 0) {
      errors.push(`Row ${rowNum}: Missing value for ${missingFields.join(', ')}.`);
      return; 
    }

    const { employeeId, email, birthYear } = row;

    if (!EMAIL_REGEX.test(email)) {
      errors.push(`Row ${rowNum}: Invalid email format (${email}).`);
    }

    if (seenIds.has(employeeId)) {
      errors.push(`Row ${rowNum}: Duplicate Employee ID found in file (${employeeId}).`);
    } else {
      seenIds.add(employeeId);
    }

    if (seenEmails.has(email)) {
      errors.push(`Row ${rowNum}: Duplicate Email found in file (${email}).`);
    } else {
      seenEmails.add(email);
    }

    const year = Number(birthYear);
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
      errors.push(`Row ${rowNum}: Invalid birth year (${birthYear}). Must be a reasonable 4-digit number.`);
    }

    validData.push(row);
  });

  return {
    isValid: errors.length === 0,
    errors,
    data: validData,
  };
};

export const validateSalaryCSV = (rows: any[], masterDB: any[]): ValidationResult<any> => {
  const errors: string[] = [];
  const validData: any[] = [];
  const seenIds = new Set<string>();
  
  const validMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",
                      "Jan", "Feb", "Mar", "Apr", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const expectedHeaders = ['employeeId', 'baseSalary', 'hra', 'allowances', 'deductions', 'month', 'year'];

  if (!rows || rows.length === 0) {
    return { isValid: false, errors: ["CSV file is empty."], data: [] };
  }

  // Check if the file has the correct columns
  const firstRowKeys = Object.keys(rows[0]);
  const missingHeaders = expectedHeaders.filter(header => !firstRowKeys.includes(header));
  
  if (missingHeaders.length > 0) {
    return { 
      isValid: false, 
      errors: [`Invalid CSV format. Missing required columns: ${missingHeaders.join(', ')}. Please download and use the correct template.`], 
      data: [] 
    };
  }

  rows.forEach((row, index) => {
    const rowNum = index + 2;

    const missingFields = expectedHeaders.filter(field => {
      const val = row[field];
      return val === undefined || val === null || String(val).trim() === '';
    });

    if (missingFields.length > 0) {
      errors.push(`Row ${rowNum}: Missing value for ${missingFields.join(', ')}.`);
      return;
    }

    const { employeeId, baseSalary, hra, allowances, deductions, month, year } = row;

    const bs = Number(baseSalary);
    const h = Number(hra);
    const a = Number(allowances);
    const d = Number(deductions);

    if (isNaN(bs) || isNaN(h) || isNaN(a) || isNaN(d)) {
      errors.push(`Row ${rowNum}: Salary components must be valid numbers.`);
    } else if (bs < 0 || h < 0 || a < 0 || d < 0) {
      errors.push(`Row ${rowNum}: Salary components cannot be negative.`);
    }

    const dbRecord = masterDB.find((emp) => emp.employeeId === employeeId);
    if (!dbRecord) {
      errors.push(`Row ${rowNum}: Employee ID (${employeeId}) not found in Master Database.`);
    }

    if (!validMonths.includes(month.toString().trim())) {
      errors.push(`Row ${rowNum}: Invalid month (${month}).`);
    }

    const y = Number(year);
    if (isNaN(y) || y < 2000 || y > 2100) {
      errors.push(`Row ${rowNum}: Invalid year (${year}).`);
    }

    if (seenIds.has(employeeId)) {
      errors.push(`Row ${rowNum}: Duplicate Employee ID found in this payroll batch (${employeeId}).`);
    } else {
      seenIds.add(employeeId);
    }

    const netSalary = (Number(baseSalary) + Number(hra) + Number(allowances)) - Number(deductions);
    if (netSalary < 0) {
      errors.push(`Row ${rowNum}: Deductions exceed gross earnings, resulting in negative net salary.`);
    }

    if (dbRecord) {
      validData.push({
        ...dbRecord,
        baseSalary: Number(baseSalary),
        hra: Number(hra),
        allowances: Number(allowances),
        deductions: Number(deductions),
        month: month.toString().trim(),
        year: y,
        netSalary,
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    data: validData,
  };
};
