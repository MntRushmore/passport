import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ExternalLink, AlertTriangle, Check, Info } from "lucide-react"

export default function SlackTroubleshootPage() {
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center p-4 md:p-8">
      <div className="max-w-3xl w-full">
        <div className="flex justify-between items-center mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-navy-700 font-serif flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </Link>
          <h1 className="text-2xl font-serif font-bold text-navy-700">Slack Authentication Troubleshooting</h1>
          <div className="w-[100px]"></div>
        </div>

        <Card className="border-gold-500 bg-cream mb-6 overflow-hidden">
          <CardHeader className="navy-header pb-2">
            <CardTitle className="text-cream font-serif text-lg flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" /> Fixing "Content Blocked" Error
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <p className="font-mono text-sm text-stone-700">
                If you're seeing the error "This content is blocked. Contact the site owner to fix the issue." when
                trying to sign in with Slack, follow these troubleshooting steps:
              </p>

              <div className="space-y-4">
                <h2 className="font-serif text-navy-700 text-xl flex items-center">
                  <Info className="h-5 w-5 mr-2 text-navy-700" />
                  Understanding the Issue
                </h2>
                <p className="font-mono text-sm text-stone-700">
                  This error typically occurs due to one of the following reasons:
                </p>
                <ul className="list-disc list-inside space-y-2 font-mono text-sm text-stone-700 ml-4">
                  <li>Content Security Policy (CSP) restrictions are blocking the redirect</li>
                  <li>The Slack OAuth redirect URL is not properly configured</li>
                  <li>Browser security settings or extensions are blocking the redirect</li>
                  <li>Cross-Origin Resource Sharing (CORS) issues</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="font-serif text-navy-700 text-xl flex items-center">
                  <Check className="h-5 w-5 mr-2 text-green-600" />
                  Solution Steps
                </h2>

                <div className="bg-white p-4 rounded-lg border border-gold-500 mb-4">
                  <h3 className="font-serif text-navy-700 text-lg mb-2">1. Check Slack App Configuration</h3>
                  <ol className="list-decimal list-inside space-y-2 font-mono text-sm text-stone-700 ml-2">
                    <li>
                      Go to your{" "}
                      <a
                        href="https://api.slack.com/apps"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-navy-700 underline inline-flex items-center"
                      >
                        Slack App Dashboard <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </li>
                    <li>Select your app and navigate to "OAuth & Permissions"</li>
                    <li>
                      Verify that the Redirect URL is correctly set to:
                      <div className="bg-stone-50 p-2 rounded border border-stone-200 mt-1 mb-2 font-mono text-xs overflow-auto">
                        https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback
                      </div>
                    </li>
                    <li>Make sure the required scopes are added: identity.basic, identity.email, identity.avatar</li>
                  </ol>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gold-500 mb-4">
                  <h3 className="font-serif text-navy-700 text-lg mb-2">2. Verify Supabase Configuration</h3>
                  <ol className="list-decimal list-inside space-y-2 font-mono text-sm text-stone-700 ml-2">
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
                    <li>Select your project and navigate to "Authentication" → "Providers"</li>
                    <li>Ensure Slack is enabled and the Client ID and Client Secret are correctly entered</li>
                    <li>Check that the Site URL in your project settings matches your application's URL</li>
                  </ol>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gold-500 mb-4">
                  <h3 className="font-serif text-navy-700 text-lg mb-2">3. Update Content Security Policy</h3>
                  <p className="font-mono text-sm text-stone-700 mb-2">
                    Add the following domains to your Content Security Policy:
                  </p>
                  <div className="bg-stone-50 p-2 rounded border border-stone-200 font-mono text-xs overflow-auto">
                    connect-src 'self' https://*.supabase.co https://api.slack.com;
                    <br />
                    frame-src 'self' https://*.supabase.co https://slack.com;
                  </div>
                  <p className="font-mono text-sm text-stone-700 mt-2">
                    This has been added to the application's middleware, but if you're using a custom server or hosting
                    service, you may need to configure it there as well.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gold-500">
                  <h3 className="font-serif text-navy-700 text-lg mb-2">4. Browser Troubleshooting</h3>
                  <ul className="list-disc list-inside space-y-2 font-mono text-sm text-stone-700 ml-2">
                    <li>Try using a different browser</li>
                    <li>Disable browser extensions, especially ad blockers or privacy tools</li>
                    <li>Clear browser cache and cookies</li>
                    <li>Check browser console for specific error messages (Press F12 to open developer tools)</li>
                  </ul>
                </div>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
                <h3 className="font-serif text-navy-700 font-medium flex items-center">
                  <Info className="h-5 w-5 mr-2 text-navy-700" />
                  Still Having Issues?
                </h3>
                <p className="font-mono text-sm text-stone-700 mt-1">
                  If you're still encountering problems after trying these steps, you can:
                </p>
                <ul className="list-disc list-inside space-y-1 font-mono text-sm text-stone-700 mt-2 ml-2">
                  <li>Use email authentication as an alternative</li>
                  <li>Check the browser console for specific error messages</li>
                  <li>Contact Supabase support for assistance with OAuth configuration</li>
                </ul>
              </div>

              <div className="flex justify-center mt-4 space-x-4">
                <Button asChild className="bg-navy-700 hover:bg-navy-800 text-cream font-serif">
                  <Link href="/">Try Again</Link>
                </Button>
                <Button asChild variant="outline" className="border-gold-500 text-navy-700 font-serif">
                  <Link href="/admin/slack-setup">Slack Setup Guide</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
