import { Calendar, Clock, Award, Users, MapPin, Check } from "lucide-react"

interface Workshop {
  id: string
  title: string
  emoji: string
  description: string
  completed: boolean
  submissionDate: string | null
  eventCode?: string | null
  difficulty?: string
  duration?: string
  skills?: string[]
}

interface PassportPageProps {
  workshop: Workshop
  index?: number
}

export function PassportPage({ workshop, index = 0 }: PassportPageProps) {
  // Add some default values if not provided
  const difficulty = workshop.difficulty || "beginner"
  const duration = workshop.duration || "1-2 hours"
  const skills = workshop.skills || ["Coding", "Design", "Problem Solving"]

  const difficultyColor = {
    beginner: "text-green-600",
    intermediate: "text-amber-600",
    advanced: "text-red-600",
  }[difficulty as "beginner" | "intermediate" | "advanced"] || "text-stone-600"

  // Generate unique stamp positioning based on workshop ID to prevent overlaps
  const getStampStyle = () => {
    // Create a simple hash from the workshop ID
    const hash = workshop.id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    
    // Predefined positions that don't overlap
    const positions = [
      { top: '1.5rem', right: '1.5rem', transform: 'rotate(12deg)' },
      { top: '2rem', right: '5rem', transform: 'rotate(-8deg)' },
      { top: '1rem', right: '8rem', transform: 'rotate(15deg)' },
      { top: '3rem', right: '2rem', transform: 'rotate(-12deg)' },
      { top: '1.5rem', right: '6.5rem', transform: 'rotate(8deg)' },
      { top: '2.5rem', right: '4rem', transform: 'rotate(-15deg)' },
    ]
    
    const positionIndex = Math.abs(hash) % positions.length
    return positions[positionIndex]
  }

  const stampStyle = getStampStyle()

  return (
    <div className="passport-container">
      {/* Header */}
      <div className="passport-header">
        <div className="passport-header-content">
          <div className="flex items-center">
            <span className="passport-emoji">{workshop.emoji}</span>
            <h2 className="passport-title">{workshop.title}</h2>
          </div>
          <div className="passport-id">ID: {workshop.id.toUpperCase()}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="passport-body">
        {/* Status Section */}
        <div className="passport-status-section">
          <div className="passport-status-badge">
            {workshop.completed ? (
              <div className="passport-completed">
                <Check className="h-4 w-4 mr-1" />
                COMPLETED
              </div>
            ) : (
              <div className="passport-pending">PENDING</div>
            )}
          </div>

          <div className="passport-metadata">
            <div className="passport-metadata-item">
              <Clock className="h-3 w-3 mr-1" />
              <span>{duration}</span>
            </div>
            <div className="passport-metadata-item">
              <Award className="h-3 w-3 mr-1" />
              <span className={difficultyColor}>{difficulty}</span>
            </div>
            <div className="passport-metadata-item">
              <Users className="h-3 w-3 mr-1" />
              <span>Team Activity</span>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="passport-section">
          <h3 className="passport-section-title">Workshop Description</h3>
          <p className="passport-description">{workshop.description}</p>

          <div className="passport-skills">
            {skills.map((skill, index) => (
              <span key={index} className="passport-skill">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Event Code Section (if completed) */}
        {workshop.completed && workshop.eventCode && (
          <div className="passport-section">
            <h3 className="passport-section-title">Event Details</h3>
            <div className="passport-event-code">
              <span className="font-bold">Event Code:</span> {workshop.eventCode}
            </div>
          </div>
        )}

        {/* Submission Section (if completed) */}
        {workshop.completed && (
          <div className="passport-section">
            <h3 className="passport-section-title">Submission</h3>
            <div className="passport-submission">
              <div className="passport-submission-date">
                <Calendar className="h-3 w-3 mr-1" />
                Submitted on: {workshop.submissionDate}
              </div>

              <div className="passport-submission-content">
                {workshop.id === "glaze" && (
                  <div className="passport-submission-image">
                    <div className="passport-image-placeholder">🍩</div>
                    <div className="passport-submission-details">
                      <p className="passport-submission-filename">donut-workshop-photo.jpg</p>
                      <p className="passport-submission-date-small">Uploaded April 15, 2023</p>
                    </div>
                  </div>
                )}
                {workshop.id === "swirl" && (
                  <div className="passport-submission-image">
                    <div className="passport-image-placeholder">🍦</div>
                    <div className="passport-submission-details">
                      <p className="passport-submission-filename">ice-cream-workshop.jpg</p>
                      <p className="passport-submission-date-small">Uploaded May 2, 2023</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="passport-footer">
          <div className="passport-footer-item">
            <MapPin className="h-3 w-3 mr-1" />
            Workshop Leader: {workshop.id === "glaze" || workshop.id === "swirl" ? "Alex Chen" : "TBD"}
          </div>
          <div className="passport-footer-item">
            Club: {workshop.id === "glaze" || workshop.id === "swirl" ? "Coding Chefs" : "TBD"}
          </div>
        </div>

        {/* Stamp */}
        <div 
          className={`passport-stamp ${workshop.completed ? "passport-stamp-completed" : ""}`}
          style={stampStyle}
        >
          <div className="passport-stamp-content">
            <span className="passport-stamp-emoji">{workshop.emoji}</span>
            <span className="passport-stamp-text">{workshop.title}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
