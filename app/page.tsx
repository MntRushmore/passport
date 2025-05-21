import { PassportCover } from "@/components/passport-cover"
import { Button } from "@/components/ui/button"
import { Shield, Users, Zap } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-serif font-bold text-navy-800">Hack Club</h1>
          <h2 className="text-2xl font-serif font-bold text-navy-700 mt-1">Food Passport Challenge</h2>
          <p className="mt-2 text-stone-600 font-mono text-sm">Collect stamps from culinary coding adventures</p>
        </div>

        <PassportCover />

        <div className="flex justify-center">
          <Button asChild className="bg-navy-700 hover:bg-navy-800 text-cream font-serif px-8 py-6 text-lg">
            <Link href="/login">Sign in with Slack</Link>
          </Button>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gold-500 flex flex-col items-center text-center">
            <Shield className="h-8 w-8 text-navy-700 mb-2" />
            <h3 className="font-serif text-navy-700 text-sm mb-1">Secure Authentication</h3>
            <p className="text-xs font-mono text-stone-600">Sign in securely with your Slack account</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gold-500 flex flex-col items-center text-center">
            <Users className="h-8 w-8 text-navy-700 mb-2" />
            <h3 className="font-serif text-navy-700 text-sm mb-1">Create Your Club</h3>
            <p className="text-xs font-mono text-stone-600">Set up your club and invite members</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gold-500 flex flex-col items-center text-center">
            <Zap className="h-8 w-8 text-navy-700 mb-2" />
            <h3 className="font-serif text-navy-700 text-sm mb-1">Track Progress</h3>
            <p className="text-xs font-mono text-stone-600">Complete workshops and collect stamps</p>
          </div>
        </div>
      </div>
    </div>
  )
}
