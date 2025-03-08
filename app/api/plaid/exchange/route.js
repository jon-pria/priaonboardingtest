export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin"; // ✅ Ensure this path is correct
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

export async function POST(req) {
  try {
    console.log("🔄 Receiving public token exchange request...");

    const { public_token, userId } = await req.json();
    if (!public_token || !userId) {
      console.error("❌ Missing public_token or userId");
      return NextResponse.json({ error: "Missing public token or userId" }, { status: 400 });
    }

    console.log("🔑 Exchanging public token for access token...");
    const response = await plaidClient.itemPublicTokenExchange({ public_token });

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    console.log("✅ Access Token Exchange Success:", { accessToken, itemId });

    // ✅ Store access token securely in Firestore
    const userDocRef = db.collection("users").doc(userId);
    await userDocRef.set({ accessToken, itemId }, { merge: true });

    // ✅ Verify Firestore write
    const storedDoc = await userDocRef.get();
    if (!storedDoc.exists) {
      console.error("❌ Firestore failed to store access token.");
      return NextResponse.json({ error: "Failed to store access token" }, { status: 500 });
    }

    console.log("✅ Access token successfully stored in Firestore!");

    return NextResponse.json({ message: "Access token stored successfully!", accessToken });

  } catch (error) {
    console.error("❌ Error exchanging public token:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to exchange token" }, { status: 500 });
  }
}
