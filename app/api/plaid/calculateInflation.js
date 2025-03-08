export function calculatePersonalInflationRate(transactions) {
    const now = new Date();
    const lastMonthStart = new Date(now);
    lastMonthStart.setMonth(now.getMonth() - 1);
  
    const lastYearStart = new Date(lastMonthStart);
    lastYearStart.setFullYear(lastYearStart.getFullYear() - 1);
  
    let thisYearSpending = 0;
    let lastYearSpending = 0;
  
    transactions.forEach((txn) => {
      const txnDate = new Date(txn.date);
      
      // ✅ Compare spending from the past 30 days to the same period last year
      if (txnDate >= lastMonthStart) {
        thisYearSpending += txn.amount;
      } else if (txnDate >= lastYearStart && txnDate < lastMonthStart) {
        lastYearSpending += txn.amount;
      }
    });
  
    if (lastYearSpending === 0) {
      return 0; // Avoid division by zero
    }
  
    return ((thisYearSpending - lastYearSpending) / lastYearSpending) * 100;
  }
  