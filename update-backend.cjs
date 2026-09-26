const fs = require('fs');

// Update routes/salary.ts
let rt = fs.readFileSync('src/routes/salary.ts', 'utf8');
rt = rt.replace(
`    const basicSalary = Number(components.basicSalary) || 0;
    const allowances = Number(components.allowances) || 0;
    const overtime = Number(components.overtime) || 0;
    const incentive = Number(components.incentive) || 0;
    const otherEarnings = Number(components.otherEarnings) || 0;
    const deductions = Number(components.deductions) || 0;
    const advanceRecovery = Number(components.advanceRecovery) || 0;

    const grossSalary = basicSalary + allowances + overtime + incentive + otherEarnings;
    const netSalary = grossSalary - deductions - advanceRecovery;`,
`    const basicSalary = Number(components.basicSalary) || 0;
    const allowances = Number(components.allowances) || 0;
    const overtime = Number(components.overtime) || 0;
    const incentive = Number(components.incentive) || 0;
    const otherEarnings = Number(components.otherEarnings) || 0;
    const deductions = Number(components.deductions) || 0;
    const advanceRecovery = Number(components.advanceRecovery) || 0;
    const leaveDeduction = Number(components.leaveDeduction) || 0;

    const grossSalary = basicSalary + allowances + overtime + incentive + otherEarnings;
    const netSalary = grossSalary - deductions - advanceRecovery - leaveDeduction;`
);

rt = rt.replace(
`        record.components = {
          basicSalary, allowances, overtime, incentive, otherEarnings,
          deductions, advanceRecovery, grossSalary, netSalary
        };`,
`        record.components = {
          basicSalary, allowances, overtime, incentive, otherEarnings,
          deductions, advanceRecovery, leaveDeduction, grossSalary, netSalary
        };`
);

rt = rt.replace(
`          components: {
            basicSalary, allowances, overtime, incentive, otherEarnings,
            deductions, advanceRecovery, grossSalary, netSalary
          },`,
`          components: {
            basicSalary, allowances, overtime, incentive, otherEarnings,
            deductions, advanceRecovery, leaveDeduction, grossSalary, netSalary
          },`
);

fs.writeFileSync('src/routes/salary.ts', rt);

// Update models/SalaryRecord.ts
let mod = fs.readFileSync('src/models/SalaryRecord.ts', 'utf8');
mod = mod.replace(
`    advanceRecovery: { type: Number, default: 0 },
    grossSalary: { type: Number, default: 0 },`,
`    advanceRecovery: { type: Number, default: 0 },
    leaveDeduction: { type: Number, default: 0 },
    grossSalary: { type: Number, default: 0 },`
);
fs.writeFileSync('src/models/SalaryRecord.ts', mod);

console.log('Backend updated');
