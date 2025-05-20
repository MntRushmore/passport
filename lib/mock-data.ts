import type { Workshop } from "./api"

export const mockWorkshops: Workshop[] = [
  {
    id: "glaze",
    title: "Glaze",
    emoji: "🍩",
    description: "Create a delicious donut-themed web app with interactive glazing features.",
    difficulty: "beginner",
    duration: "1-2 hours",
    skills: ["HTML", "CSS", "JavaScript"],
  },
  {
    id: "grub",
    title: "Grub",
    emoji: "🍟",
    description: "Build a food ordering system with a focus on user experience and order tracking.",
    difficulty: "intermediate",
    duration: "2-3 hours",
    skills: ["React", "State Management", "UI Design"],
  },
  {
    id: "boba",
    title: "Boba Drops",
    emoji: "🧋",
    description: "Develop a bubble tea customization app with drag and drop ingredients.",
    difficulty: "intermediate",
    duration: "2-3 hours",
    skills: ["Drag & Drop", "JavaScript", "CSS Animations"],
  },
  {
    id: "swirl",
    title: "Swirl",
    emoji: "🍦",
    description: "Create an ice cream shop simulator with flavor mixing and customer satisfaction mechanics.",
    difficulty: "advanced",
    duration: "3-4 hours",
    skills: ["Game Design", "JavaScript", "Canvas API"],
  },
]

export function getMockWorkshop(id: string): Workshop | null {
  // First try to find by exact ID
  const workshop = mockWorkshops.find((w) => w.id === id)
  if (workshop) return workshop

  // If not found and ID looks like a UUID, return the first mock workshop
  // This helps with testing when real data isn't available
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidRegex.test(id)) {
    return mockWorkshops[0]
  }

  return null
}
