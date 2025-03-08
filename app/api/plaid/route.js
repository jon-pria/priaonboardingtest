export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
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

// ✅ Handle GET request for testing
export async function GET() {
  return NextResponse.json({ message: "Plaid API is working! Use POST to get a link token." });
}

// ✅ Handle POST request to generate a link token
export async function POST(req) {
  try {
    console.log("Attempting to create Plaid Link token...");

    // ✅ Read and log the raw request body
    const bodyText = await req.text();
    console.log("Raw request body:", bodyText);

    // ✅ Ensure JSON parsing doesn't break if body is empty
    if (!bodyText) {
      return NextResponse.json({ error: "Request body is empty" }, { status: 400 });
    }

    // ✅ Parse the JSON body
    const { userId } = JSON.parse(bodyText);
    console.log("Parsed userId:", userId);

    // ✅ Validate userId before proceeding
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // ✅ Call Plaid API
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: userId,
      },
      client_name: "PRIA",
      products: ["auth", "transactions"],
      country_codes: ["US"],
      language: "en",
    });

    console.log("Plaid API Response:", response.data);
    return NextResponse.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error("Plaid API Error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Failed to create link token", details: error.response?.data },
      { status: 500 }
    );
  }
}
