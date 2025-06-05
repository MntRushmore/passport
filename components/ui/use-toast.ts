"use client"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const mockToast = (props: ToastProps) => {
    console.log("Toast:", props)
    // In a real implementation, this would show a toast notification
    // For this demo, we're just logging to console
  }

  return {
    toast: mockToast,
    toasts: [] as any[], // Mock empty toasts array
  }
}
