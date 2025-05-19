import { api } from "@/lib/api"

export async function uploadWorkshopPhoto(file: File, workshopId: string, userId: string): Promise<string> {
  // Create a unique file path
  const timestamp = new Date().getTime()
  const fileExtension = file.name.split(".").pop()
  const filePath = `workshops/${workshopId}/${userId}_${timestamp}.${fileExtension}`

  // Upload to Supabase Storage
  const publicUrl = await api.uploadFile(file, "food-passport", filePath)

  return publicUrl
}
