import { getSupabaseBrowserClient } from "@/lib/supabase"
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
  async getCurrentUser(): Promise<User | null> {
    const supabase = getSupabaseBrowserClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return null

    try {
      // Use a simpler query to avoid recursion
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, avatar_url, club_id, role")
        .eq("auth_id", session.user.id)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          console.log("New user detected, needs to create profile")
          return {
            id: session.user.id,
            name: session.user.user_metadata.name || session.user.email?.split("@")[0] || "",
            email: session.user.email || "",
            avatar: session.user.user_metadata.avatar_url || null,
            clubId: null,
            clubName: null,
            role: "leader",
            isNewUser: true,
          }
        }

        console.error("Error fetching user:", error)
        throw error
      }

      // Get club name in a separate query if needed
      let clubName = null
      if (data.club_id) {
        const { data: clubData, error: clubError } = await supabase
          .from("clubs")
          .select("name")
          .eq("id", data.club_id)
          .single()

        if (!clubError && clubData) {
          clubName = clubData.name
        }
      }

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        avatar: data.avatar_url,
        clubId: data.club_id,
        clubName: clubName,
        role: data.role,
        isNewUser: false,
      }
    } catch (error) {
      console.error("Error in getCurrentUser:", error)

      // Return a fallback user object
      return {
        id: session.user.id,
        name: session.user.user_metadata.name || session.user.email?.split("@")[0] || "New User",
        email: session.user.email || "",
        avatar: session.user.user_metadata.avatar_url || null,
        clubId: null,
        clubName: null,
        role: "leader",
        isNewUser: true,
      }
    }
  }

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

  async signUpWithEmail(email: string, password: string, name: string): Promise<void> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase.auth.signUp({
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

    if (data.user) {
      try {
        await supabase.from("users").insert({
          auth_id: data.user.id,
          name: name,
          email: email,
          role: "leader",
        })
      } catch (userError) {
        console.error("Error creating user record:", userError)
      }
    }
  }

  async signOut(): Promise<void> {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
  }

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

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      throw new Error("Authentication required")
    }

    try {
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

      console.log("Club created:", club)

      const { data: user, error: userError } = await supabase
        .from("users")
        .upsert({
          auth_id: session.user.id,
          name: data.userName,
          email: data.userEmail,
          avatar_url: data.userAvatar || null,
          club_id: club.id,
          role: "leader",
        })
        .select("id")
        .single()

      if (userError) {
        console.error("Failed to create user:", userError)
        await supabase.from("clubs").delete().eq("id", club.id)
        throw new Error(`Failed to create user: ${userError.message}`)
      }

      console.log("User created/updated:", user)

      return { clubId: club.id, userId: user.id }
    } catch (error) {
      console.error("Error in createClub:", error)
      throw error
    }
  }

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

  async getClubs(): Promise<Club[]> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase.from("club_stats").select("*").order("name")

    if (error) {
      throw new Error(error.message)
    }

    const { data: clubDetails, error: detailsError } = await supabase.from("clubs").select("id, location, description")

    if (detailsError) {
      throw new Error(detailsError.message)
    }

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

  async deleteSubmission(id: string): Promise<void> {
    const supabase = getSupabaseBrowserClient()

    const { error } = await supabase.from("submissions").delete().eq("id", id)

    if (error) {
      throw new Error(`Failed to delete submission: ${error.message}`)
    }
  }

  async deleteClub(id: string): Promise<void> {
    const supabase = getSupabaseBrowserClient()

    const { error } = await supabase.from("clubs").delete().eq("id", id)

    if (error) {
      throw new Error(`Failed to delete club: ${error.message}`)
    }
  }

  async uploadFile(file: File, bucket: string, path: string): Promise<string> {
    const supabase = getSupabaseBrowserClient()

    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      throw new Error(error.message)
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path)

    return publicUrl
  }
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
