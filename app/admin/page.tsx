"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Download, Eye, Filter, RefreshCw, Camera, Trash2, AlertTriangle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { api, apiHandler, type Submission, type Club } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"submissions" | "clubs">("submissions")
  const [isLoading, setIsLoading] = useState(true)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: "submission" | "club"; name: string } | null>(
    null,
  )

  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Load data
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      router.push("/")
      return
    }

    // Check if user is admin
    if (user.role !== "admin") {
      router.push("/dashboard")
      return
    }

    loadData()
  }, [user, router])

  const loadData = async () => {
    setIsLoading(true)

    try {
      // Load submissions
      const submissionsData = await api.getSubmissions()
      setSubmissions(submissionsData)

      // Load clubs
      const clubsData = await api.getClubs()
      setClubs(clubsData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error loading data",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = (type: "submission" | "club", id: string, name: string) => {
    setItemToDelete({ id, type, name })
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    setDeleteDialogOpen(false)

    if (itemToDelete.type === "submission") {
      await apiHandler(() => api.deleteSubmission(itemToDelete.id), {
        loadingMessage: "Deleting submission...",
        successMessage: "Submission deleted successfully",
        errorMessage: "Failed to delete submission",
        toast,
      })

      // Update local state
      setSubmissions(submissions.filter((s) => s.id !== itemToDelete.id))
    } else {
      await apiHandler(() => api.deleteClub(itemToDelete.id), {
        loadingMessage: "Deleting club...",
        successMessage: "Club deleted successfully",
        errorMessage: "Failed to delete club",
        toast,
      })

      // Update local state
      setClubs(clubs.filter((c) => c.id !== itemToDelete.id))
    }

    setItemToDelete(null)
  }

  if (!user) {
    return null // Don't render anything while redirecting
  }

  const filteredSubmissions = submissions.filter(
    (sub) =>
      sub.clubName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.workshopTitle.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredClubs = clubs.filter(
    (club) =>
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (club.location && club.location.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center p-4 md:p-8">
      <div className="max-w-6xl w-full">
        <div className="flex justify-between items-center mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-navy-700 font-serif">
              Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-serif font-bold text-navy-700">Admin Dashboard</h1>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback className="bg-navy-700 text-cream">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>

        <Card className="border-gold-500 bg-cream mb-6 overflow-hidden">
          <CardHeader className="navy-header pb-2">
            <CardTitle className="text-cream font-serif text-lg">Food Passport Challenge Admin</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div className="flex gap-4">
                <Button
                  variant={activeTab === "submissions" ? "default" : "outline"}
                  className={activeTab === "submissions" ? "bg-navy-700 text-cream" : "border-navy-700 text-navy-700"}
                  onClick={() => setActiveTab("submissions")}
                >
                  Workshop Submissions
                </Button>
                <Button
                  variant={activeTab === "clubs" ? "default" : "outline"}
                  className={activeTab === "clubs" ? "bg-navy-700 text-cream" : "border-navy-700 text-navy-700"}
                  onClick={() => setActiveTab("clubs")}
                >
                  Clubs
                </Button>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-[250px]">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-500" />
                  <Input
                    placeholder="Search..."
                    className="pl-8 border-gold-500 bg-white font-mono text-sm w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="border-gold-500">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>All Workshops</DropdownMenuItem>
                    <DropdownMenuItem>Glaze 🍩</DropdownMenuItem>
                    <DropdownMenuItem>Grub 🍟</DropdownMenuItem>
                    <DropdownMenuItem>Boba Drops 🧋</DropdownMenuItem>
                    <DropdownMenuItem>Swirl 🍦</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-gold-500"
                  onClick={loadData}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-navy-700 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="ml-4 font-mono text-sm text-navy-700">Loading data...</p>
              </div>
            ) : activeTab === "submissions" ? (
              <>
                {filteredSubmissions.length > 0 ? (
                  <div className="rounded-md border border-gold-500 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-navy-700 text-cream">
                        <TableRow>
                          <TableHead className="font-serif">Workshop</TableHead>
                          <TableHead className="font-serif">Club</TableHead>
                          <TableHead className="font-serif">Leader</TableHead>
                          <TableHead className="font-serif">Event Code</TableHead>
                          <TableHead className="font-serif">Status</TableHead>
                          <TableHead className="font-serif">Date</TableHead>
                          <TableHead className="font-serif text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSubmissions.map((submission) => (
                          <TableRow key={submission.id} className="bg-white font-mono text-sm">
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <span className="mr-2">{submission.workshopEmoji}</span>
                                {submission.workshopTitle}
                              </div>
                            </TableCell>
                            <TableCell>{submission.clubName}</TableCell>
                            <TableCell>{submission.userName}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-gold-500 bg-cream font-mono">
                                {submission.eventCode}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {submission.status === "approved" ? (
                                <Badge className="bg-green-500 text-white">Approved</Badge>
                              ) : submission.status === "rejected" ? (
                                <Badge className="bg-red-500 text-white">Rejected</Badge>
                              ) : (
                                <Badge className="bg-yellow-500 text-white">Pending</Badge>
                              )}
                            </TableCell>
                            <TableCell>{new Date(submission.submissionDate).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-gold-500">
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 border-red-500 hover:bg-red-50"
                                  onClick={() =>
                                    handleDelete(
                                      "submission",
                                      submission.id,
                                      `${submission.workshopTitle} submission from ${submission.clubName}`,
                                    )
                                  }
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-md border border-gold-500">
                    <div className="mx-auto w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-4">
                      <Camera className="h-6 w-6 text-stone-400" />
                    </div>
                    <h3 className="text-lg font-serif text-navy-700 mb-2">No Submissions Found</h3>
                    <p className="text-sm font-mono text-stone-500 max-w-md mx-auto">
                      There are no workshop submissions matching your search criteria.
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center mt-4">
                  <p className="text-xs font-mono text-stone-600">
                    Showing {filteredSubmissions.length} of {submissions.length} submissions
                  </p>
                  <Button variant="outline" className="border-gold-500 text-navy-700 font-mono text-xs">
                    <Download className="h-4 w-4 mr-2" /> Export to CSV
                  </Button>
                </div>
              </>
            ) : (
              <>
                {filteredClubs.length > 0 ? (
                  <div className="rounded-md border border-gold-500 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-navy-700 text-cream">
                        <TableRow>
                          <TableHead className="font-serif">Club Name</TableHead>
                          <TableHead className="font-serif">Members</TableHead>
                          <TableHead className="font-serif">Workshops</TableHead>
                          <TableHead className="font-serif">Location</TableHead>
                          <TableHead className="font-serif">Status</TableHead>
                          <TableHead className="font-serif text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredClubs.map((club) => (
                          <TableRow key={club.id} className="bg-white font-mono text-sm">
                            <TableCell className="font-medium">{club.name}</TableCell>
                            <TableCell>{club.memberCount}</TableCell>
                            <TableCell>{club.completedWorkshops}/4</TableCell>
                            <TableCell>{club.location || "N/A"}</TableCell>
                            <TableCell>
                              {club.completedWorkshops >= 3 ? (
                                <Badge className="bg-gold-500 text-navy-700">GOLD</Badge>
                              ) : club.completedWorkshops >= 1 ? (
                                <Badge className="bg-navy-700 text-cream">ACTIVE</Badge>
                              ) : (
                                <Badge variant="outline" className="border-navy-700 text-navy-700">
                                  NEW
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="outline" className="border-gold-500 text-navy-700">
                                  View Details
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 border-red-500 hover:bg-red-50"
                                  onClick={() => handleDelete("club", club.id, club.name)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-md border border-gold-500">
                    <div className="mx-auto w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-4">
                      <Search className="h-6 w-6 text-stone-400" />
                    </div>
                    <h3 className="text-lg font-serif text-navy-700 mb-2">No Clubs Found</h3>
                    <p className="text-sm font-mono text-stone-500 max-w-md mx-auto">
                      There are no clubs matching your search criteria.
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center mt-4">
                  <p className="text-xs font-mono text-stone-600">
                    Showing {filteredClubs.length} of {clubs.length} clubs
                  </p>
                  <Button variant="outline" className="border-gold-500 text-navy-700 font-mono text-xs">
                    <Download className="h-4 w-4 mr-2" /> Export to CSV
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-xs font-mono text-stone-500">
          <p className="flex items-center justify-center">
            Last synced: {new Date().toLocaleTimeString()}
            {isLoading && <RefreshCw className="ml-2 h-3 w-3 animate-spin" />}
          </p>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border-gold-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-navy-700 flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-sm">
              Are you sure you want to delete this {itemToDelete?.type}?
              <div className="mt-2 p-3 bg-stone-50 rounded border border-stone-200 text-navy-700">
                {itemToDelete?.name}
              </div>
              <div className="mt-2 text-red-500">This action cannot be undone.</div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gold-500 text-navy-700 font-mono">Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-white font-mono" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
