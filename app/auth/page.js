"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { Zilla_Slab } from "next/font/google";

const zillaSlab = Zilla_Slab({ subsets: ["latin"], weight: ["400", "700"] });

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
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-stone-200">
      {/* ✅ Welcome Message */}
      <div className={`text-center p-6 ${zillaSlab.className}`}>
        <h1 className="text-3xl font-bold mb-4">
          Too often, the media and politicians talk about the impact of government policy decisions on the “average American family”.
        </h1>
        <p className="text-lg">
          But who is the “average American family”? PRIA’s insights and recommendations are based on what matters to <span className="font-bold">you</span>.
        </p>
      </div>

      {/* ✅ Auth Form */}
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Sign Up / Login</h2>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 mb-2 w-full rounded-lg"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 mb-2 w-full rounded-lg"
        />

        <button
          onClick={handleSignUp}
          className={`bg-blue-600 text-white font-bold py-3 px-6 w-full rounded-lg hover:bg-blue-700 transition-all ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>

        <p className="mt-2 text-gray-600">Already have an account?</p>

        <button
          onClick={handleLogin}
          className={`bg-green-600 text-white font-bold py-3 px-6 w-full rounded-lg hover:bg-green-700 transition-all mt-2 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Logging In..." : "Login"}
        </button>
      </div>
    </div>
  );
}
