"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateClubPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/create-club", {
      method: "POST",
      body: JSON.stringify({ name, code }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
    }
  };

  return (
    <main className="max-w-md mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Create Your Club</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Club Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block font-medium">Club Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        {error && <p className="text-red-600">{error}</p>}
        <button
          type="submit"
          className="bg-navy-700 hover:bg-navy-800 text-white px-4 py-2 rounded"
        >
          Create Club
        </button>
      </form>
    </main>
  );
}