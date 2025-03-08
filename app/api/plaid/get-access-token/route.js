export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin"; // ✅ Ensure this path is correct

export async function GET(req) {
  try {
    console.log("🔄 Fetching access token request...");

    // ✅ Extract userId from query parameters
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      console.error("❌ Missing userId in request");
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    console.log(`🔍 Retrieving access token for user: ${userId}`);

    // ✅ Retrieve the access token from Firestore (Admin SDK uses .doc() on collection)
    const userDocRef = db.collection("users").doc(userId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      console.error("❌ User document not found in Firestore.");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    const accessToken = userData?.accessToken;

    if (!accessToken) {
      console.error("❌ Access token not found in Firestore document.");
      return NextResponse.json({ error: "No access token found" }, { status: 401 });
    }

    console.log("✅ Access token successfully retrieved!");

    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error("❌ Error fetching access token:", error);
    return NextResponse.json({ error: "Failed to fetch access token" }, { status: 500 });
  }
}
