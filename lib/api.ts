import { getMockWorkshop } from "./mock-data"
import type { UserRole, WorkshopDifficulty, SubmissionStatus } from "@/types/supabase"

export interface User {
  id: string
  name: string
  email: string
  avatar: string | null
  clubId: string | null
  clubName: string | null
  role: UserRole
  isNewUser?: boolean
}

export interface Club {
  id: string
  name: string
  location: string | null
  description: string | null
  memberCount: number
  completedWorkshops: number
}

export interface Workshop {
  id: string
  title: string
  emoji: string
  description: string
  difficulty: WorkshopDifficulty
  duration: string | null
  skills: string[] | null
}

export interface Submission {
  id: string
  workshopId: string
  workshopTitle: string
  workshopEmoji: string
  clubId: string
  clubName: string
  userId: string
  userName: string
  eventCode: string
  photoUrl: string | null
  notes: string | null
  status: SubmissionStatus
  submissionDate: string
}

class ApiService {
  // Supabase-dependent methods have been removed as per instructions
}

export const api = new ApiService()

export type ToastFunction = (props: {
  title: string
  description?: string
  variant?: "default" | "destructive"
}) => void

export async function apiHandler<T>(
  apiCall: () => Promise<T>,
  options: {
    loadingMessage?: string
    successMessage?: string
    errorMessage?: string
    toast?: ToastFunction
  } = {},
): Promise<T | null> {
  const { loadingMessage, successMessage, errorMessage, toast } = options

  try {
    if (loadingMessage && toast) {
      toast({
        title: loadingMessage,
      })
    }

    const result = await apiCall()

    if (successMessage && toast) {
      toast({
        title: successMessage,
      })
    }

    return result
  } catch (error) {
    console.error("API error:", error)

    if (toast) {
      toast({
        title: errorMessage || "An error occurred",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      })
    }

    return null
  }
}
