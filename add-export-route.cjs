const fs = require('fs');

let rt = fs.readFileSync('src/routes/salary.ts', 'utf8');

const exportRoute = `
// GET export all salary data as CSV
router.get('/export/csv', authenticateToken, requireRole(['owner']), async (req, res) => {
  try {
    const records = await SalaryRecord.find().populate('employeeId', 'name role email').sort({ month: -1 });
    
    let csv = 'Month,Employee Name,Role,Email,Status,Working Days,Present,Paid Leave,Unpaid Leave,Absent,Basic Salary,Other Earnings,Gross Salary,Deductions,Advance Recovery,Leave Deduction,Net Salary,Payment Date,Transaction Ref\\n';
    
    records.forEach(r => {
      const emp = r.employeeId as any;
      if (!emp) return;
      
      const comp = r.components || {} as any;
      const att = r.attendance || {} as any;
      const pay = r.paymentDetails || {} as any;
      
      const row = [
        r.month,
        \`"\${emp.name || ''}"\`,
        \`"\${emp.role || ''}"\`,
        emp.email || '',
        r.status,
        att.workingDays || 0,
        att.present || 0,
        att.paidLeave || 0,
        att.unpaidLeave || 0,
        att.absent || 0,
        comp.basicSalary || 0,
        comp.otherEarnings || 0,
        comp.grossSalary || 0,
        comp.deductions || 0,
        comp.advanceRecovery || 0,
        comp.leaveDeduction || 0,
        comp.netSalary || 0,
        pay.paymentDate ? new Date(pay.paymentDate).toISOString().split('T')[0] : '',
        pay.transactionReference || ''
      ];
      
      csv += row.join(',') + '\\n';
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=salary_history.csv');
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ message: 'Error exporting data', error: error.message });
  }
});
`;

rt = rt.replace("export default router;", exportRoute + "\nexport default router;");

fs.writeFileSync('src/routes/salary.ts', rt);
console.log('Export route added');
