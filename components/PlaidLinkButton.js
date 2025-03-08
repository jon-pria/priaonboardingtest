"use client"; // Needed for Next.js app router

import { useState, useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";

export default function PlaidLinkButton() {
  const [linkToken, setLinkToken] = useState(null);

  // Fetch the link token from the backend when the component mounts
  useEffect(() => {
    const getLinkToken = async () => {
      const response = await fetch("/api/plaid");
      const data = await response.json();
      setLinkToken(data.link_token);
    };
    getLinkToken();
  }, []);

  // Function that runs when the user successfully links their bank
  const onSuccess = async (public_token, metadata) => {
    console.log("Plaid Link Success!", public_token, metadata);

    // Send the public token to the backend to exchange for an access token
    const response = await fetch("/api/plaid/exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_token }),
    });

    const data = await response.json();
    console.log("Access Token Response:", data);

    if (data.access_token) {
      alert("Access Token received! Check console for details.");
    } else {
      alert("Failed to get access token.");
    }
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onSuccess,
    onExit: (error, metadata) => console.log("User exited Plaid Link", error, metadata),
  });

  return (
    <button onClick={() => open()} disabled={!ready}>
      Connect Bank Account
    </button>
  );
}

