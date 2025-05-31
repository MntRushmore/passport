import { Card } from "@/components/ui/card"

export function PassportCover() {
  return (
    <Card className="w-full aspect-[3/4] bg-navy-800 border-gold-500 border-2 rounded-md overflow-hidden relative shadow-passport">
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-8">
          <div className="text-gold-500 text-5xl mb-2">✦</div>
          <h2 className="text-cream font-serif text-2xl uppercase tracking-wider">Passport</h2>
        </div>

        <div className="border-2 border-gold-500 p-6 rounded-md bg-navy-700 w-full max-w-[200px] mx-auto">
          <h3 className="text-cream font-mono text-xs mb-2">Hack Club</h3>
          <div className="text-cream font-serif text-xl">Food Challenge</div>
        </div>

        <div className="mt-auto">
          <div className="text-cream font-mono text-xs">Issued: {new Date().toLocaleDateString()}</div>
        </div>
      </div>

      {/* Gold corner accents */}
      <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-gold-500"></div>
      <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-gold-500"></div>
      <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-gold-500"></div>
      <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-gold-500"></div>

      {/* Embossed effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.1)_0%,_rgba(0,0,0,0)_70%)] pointer-events-none"></div>

      {/* Texture overlay */}
      <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('/noise-texture.png')] pointer-events-none"></div>
    </Card>
  )
}
