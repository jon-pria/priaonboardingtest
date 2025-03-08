export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin"; // ✅ Ensure Firestore Admin SDK is used
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

const config = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(config);

// ✅ GET request to fetch transactions
export async function GET(req) {
  try {
    console.log("🔄 Fetching Transactions API Called...");

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      console.error("❌ Error: User ID is missing.");
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    console.log("📡 Retrieving access token for user:", userId);

    // ✅ Correct way to retrieve Firestore document
    const userDocRef = db.collection("users").doc(userId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      console.error("❌ Error: User not found in Firestore.");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { accessToken } = userDoc.data();
    if (!accessToken) {
      console.error("❌ Error: No access token found.");
      return NextResponse.json({ error: "No access token found" }, { status: 401 });
    }

    console.log("✅ Access Token Retrieved:", accessToken);

    // ✅ Fetch transactions from Plaid API
    const now = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12); // Last 12 months

    console.log("📊 Fetching transactions from:", startDate.toISOString().split("T")[0], "to", now.toISOString().split("T")[0]);

    const response = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: startDate.toISOString().split("T")[0],
      end_date: now.toISOString().split("T")[0],
      options: { count: 500 },
    });

    console.log("✅ Transactions fetched successfully:", response.data.transactions.length, "transactions found.");

    return NextResponse.json({ transactions: response.data.transactions });
  } catch (error) {
    console.error("❌ Error fetching transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
