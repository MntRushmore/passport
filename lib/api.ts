import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { UserRole, WorkshopDifficulty, SubmissionStatus } from "@/types/supabase"

// Types for our data models
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

// API service for data operations
class ApiService {
  // Get current user
  async getCurrentUser(): Promise<User | null> {
    const supabase = getSupabaseBrowserClient()

    // Get the current session
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return null

    // Get the user from the database
    const { data, error } = await supabase
      .from("users")
      .select(`
        id,
        name,
        email,
        avatar_url,
        club_id,
        role,
        clubs:club_id (
          name
        )
      `)
      .eq("auth_id", session.user.id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // User not found in our database, but authenticated with Supabase
        // This is a new user who needs to create a profile
        return {
          id: session.user.id,
          name:
            session.user.user_metadata.name ||
            session.user.user_metadata.preferred_username ||
            session.user.email?.split("@")[0] ||
            "",
          email: session.user.email || "",
          avatar: session.user.user_metadata.avatar_url || null,
          clubId: null,
          clubName: null,
          role: "leader", // Default role for new users
          isNewUser: true,
        }
      }
      console.error("Error fetching user:", error)
      return null
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      avatar: data.avatar_url,
      clubId: data.club_id,
      clubName: data.clubs?.name || null,
      role: data.role,
      isNewUser: false,
    }
  }

  // Sign in with email and password
  async signInWithEmail(email: string, password: string): Promise<void> {
    const supabase = getSupabaseBrowserClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  // Sign up with email and password
  async signUpWithEmail(email: string, password: string, name: string): Promise<void> {
    const supabase = getSupabaseBrowserClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
  }

  // Create a new club and set the current user as the leader
  async createClub(data: {
    name: string
    location?: string
    description?: string
    userId: string
    userName: string
    userEmail: string
    userAvatar?: string
  }): Promise<{ clubId: string; userId: string }> {
    const supabase = getSupabaseBrowserClient()

    // Get the current session to verify the user
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      throw new Error("Authentication required")
    }

    // Start a transaction to create both the club and user
    // First, create the club
    const { data: club, error: clubError } = await supabase
      .from("clubs")
      .insert({
        name: data.name,
        location: data.location || null,
        description: data.description || null,
      })
      .select("id")
      .single()

    if (clubError) {
      throw new Error(`Failed to create club: ${clubError.message}`)
    }

    // Then, create or update the user record
    const { data: user, error: userError } = await supabase
      .from("users")
      .upsert({
        auth_id: session.user.id,
        name: data.userName,
        email: data.userEmail,
        avatar_url: data.userAvatar || null,
        club_id: club.id,
        role: "leader", // Set as club leader
      })
      .select("id")
      .single()

    if (userError) {
      // If user creation fails, we should clean up the club
      await supabase.from("clubs").delete().eq("id", club.id)
      throw new Error(`Failed to create user: ${userError.message}`)
    }

    return { clubId: club.id, userId: user.id }
  }

  // Get all workshops
  async getWorkshops(): Promise<Workshop[]> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase.from("workshops").select("*").order("title")

    if (error) {
      throw new Error(error.message)
    }

    return data.map((workshop) => ({
      id: workshop.id,
      title: workshop.title,
      emoji: workshop.emoji,
      description: workshop.description,
      difficulty: workshop.difficulty,
      duration: workshop.duration,
      skills: workshop.skills,
    }))
  }

  // Get a specific workshop
  async getWorkshop(id: string): Promise<Workshop | null> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase.from("workshops").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      throw new Error(error.message)
    }

    return {
      id: data.id,
      title: data.title,
      emoji: data.emoji,
      description: data.description,
      difficulty: data.difficulty,
      duration: data.duration,
      skills: data.skills,
    }
  }

  // Get all clubs
  async getClubs(): Promise<Club[]> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase.from("club_stats").select("*").order("name")

    if (error) {
      throw new Error(error.message)
    }

    // Get additional club details
    const { data: clubDetails, error: detailsError } = await supabase.from("clubs").select("id, location, description")

    if (detailsError) {
      throw new Error(detailsError.message)
    }

    // Merge the data
    return data.map((club) => {
      const details = clubDetails.find((c) => c.id === club.id)
      return {
        id: club.id,
        name: club.name,
        location: details?.location || null,
        description: details?.description || null,
        memberCount: club.member_count || 0,
        completedWorkshops: club.completed_workshops || 0,
      }
    })
  }

  // Get all submissions
  async getSubmissions(): Promise<Submission[]> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase
      .from("submission_details")
      .select("*")
      .order("submission_date", { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data.map((submission) => ({
      id: submission.id,
      workshopId: submission.workshop_id,
      workshopTitle: submission.workshop_title,
      workshopEmoji: submission.workshop_emoji,
      clubId: submission.club_id,
      clubName: submission.club_name,
      userId: submission.user_id,
      userName: submission.user_name,
      eventCode: submission.event_code,
      photoUrl: submission.photo_url,
      notes: submission.notes,
      status: submission.status,
      submissionDate: submission.submission_date,
    }))
  }

  // Create a submission
  async createSubmission(data: {
    workshopId: string
    clubId: string
    userId: string
    eventCode: string
    photoUrl?: string
    notes?: string
  }): Promise<string> {
    const supabase = getSupabaseBrowserClient()

    const { data: submission, error } = await supabase
      .from("submissions")
      .insert({
        workshop_id: data.workshopId,
        club_id: data.clubId,
        user_id: data.userId,
        event_code: data.eventCode,
        photo_url: data.photoUrl || null,
        notes: data.notes || null,
        status: "pending",
      })
      .select("id")
      .single()

    if (error) {
      throw new Error(`Failed to create submission: ${error.message}`)
    }

    return submission.id
  }

  // Delete a submission
  async deleteSubmission(id: string): Promise<void> {
    const supabase = getSupabaseBrowserClient()

    const { error } = await supabase.from("submissions").delete().eq("id", id)

    if (error) {
      throw new Error(`Failed to delete submission: ${error.message}`)
    }
  }

  // Delete a club
  async deleteClub(id: string): Promise<void> {
    const supabase = getSupabaseBrowserClient()

    const { error } = await supabase.from("clubs").delete().eq("id", id)

    if (error) {
      throw new Error(`Failed to delete club: ${error.message}`)
    }
  }

  // Upload a file to Supabase Storage
  async uploadFile(file: File, bucket: string, path: string): Promise<string> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      throw new Error(error.message)
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path)

    return publicUrl
  }
}

// Create and export a singleton instance
export const api = new ApiService()

// Helper function to handle API errors with toast notifications
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
