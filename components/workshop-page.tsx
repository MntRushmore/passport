import { Badge } from "@/components/ui/badge"

interface Workshop {
  id: string
  title: string
  emoji: string
  description: string
  completed: boolean
  submissionDate: string | null
  eventCode?: string // Add this field
}

interface WorkshopPageProps {
  workshop: Workshop
}

export function WorkshopPage({ workshop }: WorkshopPageProps) {
  return (
    <div className="h-full flex flex-col relative z-[1]">
      <div className="navy-header p-4 flex items-center justify-between">
        <h2 className="font-serif text-xl">{workshop.title}</h2>
        <div className="font-mono text-xs">ID: {workshop.id.toUpperCase()}</div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div className={`stamp w-24 h-24 text-5xl ${workshop.completed ? "completed" : ""}`}>{workshop.emoji}</div>

          <div>
            {workshop.completed ? (
              <Badge className="bg-navy-700 text-cream font-mono text-xs">COMPLETED</Badge>
            ) : (
              <Badge variant="outline" className="border-navy-700 text-navy-700 font-mono text-xs">
                PENDING
              </Badge>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-serif text-navy-700 text-lg mb-2">Workshop Details</h3>
          <p className="font-mono text-sm text-stone-700 leading-relaxed">{workshop.description}</p>

          {workshop.completed && workshop.eventCode && (
            <div className="mt-3 p-2 bg-white rounded border border-gold-500 inline-block">
              <p className="font-mono text-xs text-navy-700">
                Event Code: <span className="font-bold">{workshop.eventCode}</span>
              </p>
            </div>
          )}
        </div>

        {workshop.completed && (
          <div className="mb-6">
            <h3 className="font-serif text-navy-700 text-lg mb-2">Submission</h3>
            <div className="bg-white rounded p-4 border border-gold-500">
              <div className="font-mono text-xs text-stone-600 mb-2">Submitted on: {workshop.submissionDate}</div>
              <div className="font-mono text-sm">
                {workshop.id === "glaze" && (
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-stone-200 rounded mr-3 flex items-center justify-center text-xs">
                      <span className="text-2xl">🍩</span>
                    </div>
                    <div>
                      <p className="text-navy-700 font-medium">donut-workshop-photo.jpg</p>
                      <p className="text-xs text-stone-500 mt-1">Uploaded April 15, 2023</p>
                    </div>
                  </div>
                )}
                {workshop.id === "swirl" && (
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-stone-200 rounded mr-3 flex items-center justify-center text-xs">
                      <span className="text-2xl">🍦</span>
                    </div>
                    <div>
                      <p className="text-navy-700 font-medium">ice-cream-workshop.jpg</p>
                      <p className="text-xs text-stone-500 mt-1">Uploaded May 2, 2023</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto">
          <div className="border-t border-gold-500 pt-4">
            <div className="font-mono text-xs text-stone-600">
              Workshop Leader: {workshop.id === "glaze" || workshop.id === "swirl" ? "Alex Chen" : "TBD"}
            </div>
            <div className="font-mono text-xs text-stone-600">
              Club: {workshop.id === "glaze" || workshop.id === "swirl" ? "Coding Chefs" : "TBD"}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
