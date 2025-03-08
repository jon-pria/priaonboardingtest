"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { usePlaidLink } from "react-plaid-link";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [linkToken, setLinkToken] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [personalInflationRate, setPersonalInflationRate] = useState(null);
  const [projectedSpending, setProjectedSpending] = useState(null);
  const [totalSpent, setTotalSpent] = useState(null);
  const router = useRouter();

  // ✅ Handle user authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/auth");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // ✅ Fetch Plaid link token when component mounts
  useEffect(() => {
    async function getLinkToken() {
      if (!user) return;

      console.log("📡 Fetching Plaid link token for user:", user.uid);
      try {
        const response = await fetch("/api/plaid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.uid }),
        });

        const data = await response.json();
        console.log("✅ Plaid API Response:", data);

        if (data.link_token) {
          setLinkToken(data.link_token);
        } else {
          console.error("❌ Failed to get link token:", data);
        }
      } catch (error) {
        console.error("❌ Error fetching Plaid link token:", error);
      }
    }

    getLinkToken();
  }, [user]);

  // ✅ Handle Plaid success (exchange public token for access token)
  const onSuccess = async (publicToken, metadata) => {
    console.log("🔑 Plaid Link Success:", publicToken, metadata);

    if (!user) {
      alert("User not logged in.");
      return;
    }

    try {
      const response = await fetch("/api/plaid/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_token: publicToken, userId: user.uid }),
      });

      const data = await response.json();
      console.log("✅ Access Token Response:", data);

      if (data.accessToken) {
        setAccessToken(data.accessToken);
        alert("✅ Bank account connected successfully!");
        fetchTransactions(); // ✅ Auto-fetch transactions after linking
      } else {
        alert("❌ Failed to get access token.");
      }
    } catch (error) {
      console.error("❌ Error exchanging public token:", error);
    }
  };

  // ✅ Fetch transactions from API
  const fetchTransactions = async () => {
    if (!user) {
      alert("❌ No user logged in. Please log in first.");
      return;
    }

    console.log("📡 Fetching transactions for user:", user.uid);
    try {
      const response = await fetch(`/api/plaid/transactions?userId=${user.uid}`, {
        method: "GET",
      });

      const data = await response.json();
      console.log("✅ Transactions Response:", data);

      if (data.transactions) {
        setTransactions(data.transactions);
        calculateInflationAndSpending(data.transactions);
      } else {
        alert("❌ No transactions found.");
      }
    } catch (error) {
      console.error("❌ Error fetching transactions:", error);
    }
  };

// ✅ Calculate Personal Inflation Rate & Projected Spending
const calculateInflationAndSpending = (transactions) => {
  console.log("📊 Calculating personal inflation rate...");

  let totalLastYear = 0;
  let totalTwoYearsAgo = 0;

  const now = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(now.getFullYear() - 1);
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(now.getFullYear() - 2);

  transactions.forEach((txn) => {
    const txnDate = new Date(txn.date);
    
    if (txn.amount > 0) {  // ✅ Only count expenses (ignore refunds)
      if (txnDate >= oneYearAgo) {
        totalLastYear += txn.amount;
      } else if (txnDate >= twoYearsAgo) {
        totalTwoYearsAgo += txn.amount;
      }
    }
  });

  console.log("💰 Total spent last 12 months:", totalLastYear);
  console.log("💰 Total spent previous 12 months:", totalTwoYearsAgo);

  let inflationRate = "N/A";
  
  if (totalTwoYearsAgo > 0) { 
    inflationRate = ((totalLastYear - totalTwoYearsAgo) / totalTwoYearsAgo) * 100;
    inflationRate = inflationRate.toFixed(2); // ✅ Format to 2 decimals
  }

  setPersonalInflationRate(inflationRate);
  setTotalSpent(totalLastYear.toFixed(2)); // ✅ Ensure it's formatted properly
  setProjectedSpending((totalLastYear * 1.03).toFixed(2)); // ✅ National average inflation 3%
};


  // ✅ Handle Logout
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/auth");
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onSuccess,
    onExit: (error, metadata) => console.log("User exited Plaid Link", error, metadata),
  });

  if (!user) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-stone-200">
      <h1 className="text-2xl font-bold mb-4">Welcome to Your Dashboard</h1>
      <p className="mb-4">Logged in as: {user.email}</p>

      {linkToken ? (
        <button
          onClick={() => open()}
         className="bg-purple-600 text-white p-2 w-64 mb-2"
          disabled={!ready}
        >
          Connect Bank Account
        </button>
      ) : (
        <p>Loading Plaid...</p>
      )}

      {/* Fetch Transactions Button */}
      {accessToken && (
        <button
          onClick={fetchTransactions}
          className="bg-orange-500 text-white p-2 w-64 mb-2"
        >
          Fetch Transactions
        </button>
      )}

      {/* Display Personal Inflation Rate */}
      {personalInflationRate !== null && (
        <div className="mt-4 p-4 bg-gray-100 rounded w-full max-w-2xl">
          <h2 className="text-lg font-bold">Your Personal Inflation Rate</h2>
          <p className="text-xl font-semibold">
            {personalInflationRate}% (vs. National Average: 3.0%)
          </p>
        </div>
      )}

      {/* Display Projected Spending */}
      {totalSpent !== null && projectedSpending !== null && (
        <div className="mt-4 p-4 bg-gray-100 rounded w-full max-w-2xl">
          <h2 className="text-lg font-bold">Projected Spending</h2>
          <p>Total spent last year: ${totalSpent.toLocaleString()}</p>
          <p>
            Estimated spending next year (at your personal inflation rate):{" "}
            <span className="font-semibold">${projectedSpending.toLocaleString()}</span>
          </p>
        </div>
      )}

      {/* Display Transactions */}
      {transactions.length > 0 && (
        <div className="mt-4 p-4 bg-gray-100 rounded w-full max-w-2xl">
          <h2 className="text-lg font-bold">Recent Transactions</h2>
          <ul>
            {transactions.slice(0, 5).map((txn) => (
              <li key={txn.transaction_id} className="border-b py-2">
                {txn.date} - {txn.merchant_name || txn.name}: ${txn.amount}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white p-2 w-64 mt-4"
      >
        Logout
      </button>
    </div>
  );
}
