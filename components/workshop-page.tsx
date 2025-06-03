import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin } from "lucide-react"

interface Workshop {
  id: string
  title: string
  emoji: string
  description: string
  completed: boolean
  submissionDate: string | null
  eventCode?: string
  difficulty?: "beginner" | "intermediate" | "advanced"
  duration?: string
  skills?: string[]
  clubCode: string // 👈 add this line
}

interface WorkshopPageProps {
  workshop: Workshop
}

export function WorkshopPage({ workshop }: WorkshopPageProps) {
  // Add some default values if not provided
  const difficulty = workshop.difficulty || "beginner"
  const duration = workshop.duration || "1-2 hours"
  const skills = workshop.skills || ["Coding", "Design", "Problem Solving"]

  return (
    <div className="h-full flex flex-col relative z-[1]">
      {/* Header */}
      <div className="navy-header p-4 flex items-center justify-between">
        <h2 className="font-serif text-xl flex items-center">
          <span className="mr-2 text-2xl">{workshop.emoji}</span>
          {workshop.title}
        </h2>
        <div className="font-mono text-xs">ID: {workshop.id.toUpperCase()}</div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {/* Stamp */}
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

        {/* Workshop details */}
        <div className="mb-6">
          <h3 className="font-serif text-navy-700 text-lg mb-2">Workshop Details</h3>
          <p className="font-mono text-sm text-stone-700 leading-relaxed">{workshop.description}</p>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1 text-navy-700" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-1 font-bold">Level:</span>
              <span className="capitalize">{difficulty}</span>
            </div>
          </div>

          {/* Skills */}
          <div className="mt-3 flex flex-wrap gap-1">
            {skills.map((skill, index) => (
              <span key={index} className="text-xs font-mono bg-cream px-2 py-0.5 rounded-full border border-gold-500">
                {skill}
              </span>
            ))}
          </div>

          {workshop.completed && workshop.eventCode && (
            <div className="mt-4 p-2 bg-cream rounded border border-gold-500">
              <p className="font-mono text-xs text-navy-700">
                <span className="font-bold">Event Code:</span> {workshop.eventCode}
              </p>
            </div>
          )}
        </div>

        {/* Submission section */}
        {workshop.completed && (workshop.clubCode === process.env.NEXT_PUBLIC_CLUB_CODE) && (
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

        {/* Footer */}
        <div className="mt-auto">
          <div className="border-t border-gold-500 pt-4">
            <div className="font-mono text-xs text-stone-600 flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              Workshop Leader: {workshop.id === "glaze" || workshop.id === "swirl" ? "Alex Chen" : "TBD"}
            </div>
            <div className="font-mono text-xs text-stone-600 mt-1">
              Club: {workshop.id === "glaze" || workshop.id === "swirl" ? "Coding Chefs" : "TBD"}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
