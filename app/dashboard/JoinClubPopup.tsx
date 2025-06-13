"use client";
import { useState, useTransition, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function JoinClubPopup({ user, clubs }: { user: any, clubs: any[] }) {
  const searchParams = useSearchParams();
  const justJoined = searchParams.get("joined") === "1";

  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [showFlash, setShowFlash] = useState(justJoined);

  useEffect(() => {
    if (justJoined) {
      const timer = setTimeout(() => setShowFlash(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [justJoined]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
  };

  return (
    <>
      {showFlash && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-cream border border-gold-500 text-navy-700 font-serif rounded px-5 py-3 shadow-xl z-50 text-center text-base">
          ✅ You’ve successfully joined a club!
        </div>
      )}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-cream border border-gold-500 rounded-lg shadow-lg max-w-md w-full p-6 text-center">
            <p className="text-navy-700 font-serif text-xl">Joining your club...</p>
          </div>
        </div>
      )}
      <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
        <div className="bg-cream border border-gold-500 rounded-lg shadow-lg max-w-md w-full p-6">
          <h2 className="text-2xl font-serif text-navy-700 mb-4">Welcome, {user.name}!</h2>
          <p className="text-sm text-stone-700 mb-6 font-mono">
            You haven’t joined a club yet. Choose your club to get started!
          </p>
          <form
            action="/api/join-club"
            method="POST"
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <select
              name="hcId"
              required
              className="p-2 rounded border border-stone-300 font-mono text-sm text-navy-700"
            >
              <option value="">Select your club...</option>
              {Array.isArray(clubs) &&
                clubs.map((club) => (
                  <option key={club.id} value={club.id.toString()}>
                    {club.name} ({club.location})
                  </option>
                ))}
            </select>
            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-navy-700 hover:bg-navy-800 text-cream font-serif"
                disabled={loading}
              >
                {loading ? "Joining..." : "Join Club"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}