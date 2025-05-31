import Link from "next/link"
import { PassportCover } from "@/components/passport-cover"
import { LoginButton } from "@/components/login-button"

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-serif font-bold text-navy-800">Hack Club</h1>
          <h2 className="text-2xl font-serif font-bold text-navy-700 mt-1">Food Passport</h2>
          <p className="mt-2 text-stone-600 font-mono text-sm">Collect stamps from culinary coding adventures</p>
        </div>

        <PassportCover />

        <div className="flex flex-col space-y-4">
          <Link
            href="/api/auth/slack"
            className="bg-navy-700 text-white font-bold py-2 px-4 rounded text-center"
          >
            Sign in with Slack
          </Link>

          <div className="text-center text-sm font-mono text-stone-500 mt-4">
            <p>
              Already logged in?{" "}
              <Link href="/passport" className="text-navy-700 underline">
                View your passport
              </Link>
            </p>
          </div>
        </div>

        <div className="border-2 border-gold-500 rounded-lg p-6 bg-cream">
          <h2 className="font-serif text-navy-700 text-xl mb-3 text-center">About the Challenge</h2>
          <p className="text-stone-700 font-mono text-sm leading-relaxed">
            Join Hack Club's global food-themed coding adventure! Complete workshops to earn stamps in your digital
            passport. Create delicious projects with Glaze 🍩, Grub 🍟, Boba Drops 🧋, and Swirl 🍦.
          </p>
          <div className="flex justify-center mt-4 space-x-3">
            <span className="text-2xl">🍩</span>
            <span className="text-2xl">🍟</span>
            <span className="text-2xl">🧋</span>
            <span className="text-2xl">🍦</span>
          </div>
        </div>
      </div>
    </div>
  )
}
