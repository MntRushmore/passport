export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = "member" | "leader" | "admin"
export type WorkshopDifficulty = "beginner" | "intermediate" | "advanced"
export type SubmissionStatus = "pending" | "approved" | "rejected"

export interface Database {
  public: {
    Tables: {
      clubs: {
        Row: {
          id: string
          name: string
          location: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          location?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          auth_id: string | null
          name: string
          email: string
          avatar_url: string | null
          club_id: string | null
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_id?: string | null
          name: string
          email: string
          avatar_url?: string | null
          club_id?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_id?: string | null
          name?: string
          email?: string
          avatar_url?: string | null
          club_id?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
      }
      workshops: {
        Row: {
          id: string
          title: string
          emoji: string
          description: string
          difficulty: WorkshopDifficulty
          duration: string | null
          skills: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          emoji: string
          description: string
          difficulty?: WorkshopDifficulty
          duration?: string | null
          skills?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          emoji?: string
          description?: string
          difficulty?: WorkshopDifficulty
          duration?: string | null
          skills?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      submissions: {
        Row: {
          id: string
          workshop_id: string
          club_id: string
          user_id: string
          event_code: string
          photo_url: string | null
          notes: string | null
          status: SubmissionStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workshop_id: string
          club_id: string
          user_id: string
          event_code: string
          photo_url?: string | null
          notes?: string | null
          status?: SubmissionStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workshop_id?: string
          club_id?: string
          user_id?: string
          event_code?: string
          photo_url?: string | null
          notes?: string | null
          status?: SubmissionStatus
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      club_stats: {
        Row: {
          id: string
          name: string
          completed_workshops: number
          member_count: number
        }
      }
      submission_details: {
        Row: {
          id: string
          event_code: string
          photo_url: string | null
          notes: string | null
          status: SubmissionStatus
          submission_date: string
          workshop_id: string
          workshop_title: string
          workshop_emoji: string
          club_id: string
          club_name: string
          user_id: string
          user_name: string
        }
      }
    }
    Functions: {}
    Enums: {
      user_role: UserRole
      workshop_difficulty: WorkshopDifficulty
      submission_status: SubmissionStatus
    }
  }
}
