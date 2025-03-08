"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const getFriendlyErrorMessage = (error) => {
    if (error.code === "auth/email-already-in-use") return "Email is already in use.";
    if (error.code === "auth/invalid-email") return "Invalid email address.";
    if (error.code === "auth/wrong-password") return "Incorrect password.";
    if (error.code === "auth/user-not-found") return "No account found with this email.";
    return "An error occurred. Please try again.";
  };

  const handleSignUp = useCallback(async () => {
    if (!email || !password) {
      return setError("Email and password are required.");
    }
    setLoading(true);
    setError("");

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    }
    setLoading(false);
  }, [email, password, router]);

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      return setError("Email and password are required.");
    }
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    }
    setLoading(false);
  }, [email, password, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Sign Up / Login</h1>
      
      {error && <p className="text-red-500">{error}</p>}
      
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 mb-2 w-64"
      />
      
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 mb-2 w-64"
      />
      
      <button
        onClick={handleSignUp}
        className={`bg-blue-500 text-white p-2 w-64 mb-2 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={loading}
      >
        {loading ? "Signing Up..." : "Sign Up"}
      </button>
      
      <button
        onClick={handleLogin}
        className={`bg-green-500 text-white p-2 w-64 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={loading}
      >
        {loading ? "Logging In..." : "Login"}
      </button>
    </div>
  );
}
