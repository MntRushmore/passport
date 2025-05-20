import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ExternalLink, Check, Copy } from "lucide-react"

export default function SlackSetupPage() {
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center p-4 md:p-8">
      <div className="max-w-3xl w-full">
        <div className="flex justify-between items-center mb-6">
          <Link href="/admin">
            <Button variant="ghost" className="text-navy-700 font-serif flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Button>
          </Link>
          <h1 className="text-2xl font-serif font-bold text-navy-700">Slack Authentication Setup</h1>
          <div className="w-[100px]"></div>
        </div>

        <Card className="border-gold-500 bg-cream mb-6 overflow-hidden">
          <CardHeader className="navy-header pb-2">
            <CardTitle className="text-cream font-serif text-lg">Setting Up Slack Authentication</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <p className="font-mono text-sm text-stone-700">
                Follow these steps to enable Slack authentication for your Hack Club Food Passport application.
              </p>

              <div className="space-y-4">
                <h2 className="font-serif text-navy-700 text-xl">Step 1: Create a Slack App</h2>
                <ol className="list-decimal list-inside space-y-2 font-mono text-sm text-stone-700">
                  <li>
                    Go to the{" "}
                    <a
                      href="https://api.slack.com/apps"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-navy-700 underline inline-flex items-center"
                    >
                      Slack API Dashboard <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </li>
                  <li>Click "Create New App" and choose "From scratch"</li>
                  <li>
                    Enter a name for your app (e.g., "Hack Club Food Passport") and select the Slack workspace where
                    you'll develop the app
                  </li>
                  <li>Click "Create App"</li>
                </ol>
              </div>

              <div className="space-y-4">
                <h2 className="font-serif text-navy-700 text-xl">Step 2: Configure OAuth Settings</h2>
                <ol className="list-decimal list-inside space-y-2 font-mono text-sm text-stone-700">
                  <li>In your Slack app dashboard, navigate to "OAuth & Permissions" in the sidebar</li>
                  <li>
                    Under "Redirect URLs", add the following URL:
                    <div className="bg-white p-3 rounded border border-gold-500 mt-2 flex justify-between items-center">
                      <code className="text-navy-700">https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback</code>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy</span>
                      </Button>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      Replace [YOUR_PROJECT_REF] with your Supabase project reference ID
                    </p>
                  </li>
                  <li>Click "Save URLs"</li>
                  <li>
                    Under "Scopes", add the following OAuth scopes:
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li>identity.basic</li>
                      <li>identity.email</li>
                      <li>identity.avatar</li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div className="space-y-4">
                <h2 className="font-serif text-navy-700 text-xl">Step 3: Get Your Client Credentials</h2>
                <ol className="list-decimal list-inside space-y-2 font-mono text-sm text-stone-700">
                  <li>In your Slack app dashboard, navigate to "Basic Information" in the sidebar</li>
                  <li>
                    Under "App Credentials", find your "Client ID" and "Client Secret"
                    <div className="bg-white p-3 rounded border border-gold-500 mt-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-stone-600">Client ID:</span>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Copy</span>
                        </Button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-600">Client Secret:</span>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Copy</span>
                        </Button>
                      </div>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="space-y-4">
                <h2 className="font-serif text-navy-700 text-xl">Step 4: Configure Supabase Auth</h2>
                <ol className="list-decimal list-inside space-y-2 font-mono text-sm text-stone-700">
                  <li>
                    Go to your{" "}
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-navy-700 underline inline-flex items-center"
                    >
                      Supabase Dashboard <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </li>
                  <li>Select your project</li>
                  <li>Navigate to "Authentication" → "Providers" in the sidebar</li>
                  <li>Find "Slack" in the list of providers and click on it</li>
                  <li>Toggle the "Enabled" switch to on</li>
                  <li>Enter your Slack Client ID and Client Secret from Step 3</li>
                  <li>Click "Save"</li>
                </ol>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h3 className="font-serif text-green-800 font-medium">You're all set!</h3>
                  <p className="font-mono text-sm text-green-700 mt-1">
                    Slack authentication should now be enabled for your application. Users will be able to sign in using
                    their Slack accounts.
                  </p>
                </div>
              </div>

              <div className="flex justify-center mt-4">
                <Button asChild className="bg-navy-700 hover:bg-navy-800 text-cream font-serif">
                  <Link href="/">Test Slack Authentication</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
