"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/auth"); // Redirect to login page
  }, []);

  return <p>Redirecting...</p>;
}