export function categorizeTransactions(transactions) {
    const essentials = [];
    const nonEssentials = [];
  
    transactions.forEach((txn) => {
      const category = txn.category ? txn.category[0] : "Uncategorized";
  
      if (
        ["Food and Drink", "Groceries", "Healthcare", "Rent", "Utilities"].includes(category)
      ) {
        essentials.push(txn);
      } else {
        nonEssentials.push(txn);
      }
    });
  
    return { essentials, nonEssentials };
  }
  