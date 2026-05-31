

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

  if (!rows || rows.length === 0) {
    return { isValid: false, errors: ["CSV file is empty."], data: [] };
  }

  rows.forEach((row, index) => {
    const rowNum = index + 2; 

    if (!row.employeeId || !row.name || !row.email || !row.designation || !row.birthYear) {
      errors.push(`Row ${rowNum}: Missing one or more required fields (employeeId, name, email, designation, birthYear).`);
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

  if (!rows || rows.length === 0) {
    return { isValid: false, errors: ["CSV file is empty."], data: [] };
  }

  rows.forEach((row, index) => {
    const rowNum = index + 2;

    if (
      row.employeeId === undefined || 
      row.baseSalary === undefined || 
      row.hra === undefined || 
      row.allowances === undefined || 
      row.deductions === undefined || 
      !row.month || 
      !row.year
    ) {
      errors.push(`Row ${rowNum}: Missing required fields (employeeId, baseSalary, hra, allowances, deductions, month, year).`);
      return;
    }

    const { employeeId, baseSalary, hra, allowances, deductions, month, year } = row;

    if (Number(baseSalary) < 0 || Number(hra) < 0 || Number(allowances) < 0 || Number(deductions) < 0) {
      errors.push(`Row ${rowNum}: Salary components (baseSalary, hra, allowances, deductions) cannot be negative.`);
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
