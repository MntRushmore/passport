"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Download, Eye, Filter, RefreshCw, Camera } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const submissions = [
  {
    id: "sub-001",
    club: "Coding Chefs",
    leader: "Rushil Chopra",
    workshop: "Glaze",
    workshopEmoji: "🍩",
    eventCode: "GLAZE-123",
    submissionType: "image",
    submissionContent: "donut-app-screenshot.jpg",
    date: "April 15, 2023",
  },
  {
    id: "sub-002",
    club: "Coding Chefs",
    leader: "Alex Chen",
    workshop: "Swirl",
    workshopEmoji: "🍦",
    eventCode: "SWIRL-456",
    submissionType: "image",
    submissionContent: "ice-cream-workshop.jpg",
    date: "May 2, 2023",
  },
  {
    id: "sub-003",
    club: "Byte Bistro",
    leader: "Jamie Wong",
    workshop: "Glaze",
    workshopEmoji: "🍩",
    eventCode: "GLAZE-789",
    submissionType: "image",
    submissionContent: "glazed-donuts-project.png",
    date: "March 28, 2023",
  },
  {
    id: "sub-004",
    club: "Byte Bistro",
    leader: "Jamie Wong",
    workshop: "Boba Drops",
    workshopEmoji: "🧋",
    eventCode: "BOBA-234",
    submissionType: "image",
    submissionContent: "boba-workshop-photo.jpg",
    date: "April 10, 2023",
  },
  {
    id: "sub-005",
    club: "Code Cuisine",
    leader: "Taylor Smith",
    workshop: "Grub",
    workshopEmoji: "🍟",
    eventCode: "GRUB-567",
    submissionType: "image",
    submissionContent: "fast-food-workshop.jpg",
    date: "May 5, 2023",
  },
]

const clubs = [
  {
    name: "Coding Chefs",
    leader: "Alex Chen",
    completedWorkshops: 2,
    members: 12,
    location: "San Francisco, CA",
    joinDate: "January 15, 2023",
  },
  {
    name: "Byte Bistro",
    leader: "Jamie Wong",
    completedWorkshops: 2,
    members: 8,
    location: "New York, NY",
    joinDate: "February 3, 2023",
  },
  {
    name: "Code Cuisine",
    leader: "Taylor Smith",
    completedWorkshops: 1,
    members: 15,
    location: "Chicago, IL",
    joinDate: "March 10, 2023",
  },
  {
    name: "Dev Diner",
    leader: "Jordan Lee",
    completedWorkshops: 0,
    members: 6,
    location: "Austin, TX",
    joinDate: "April 22, 2023",
  },
]

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"submissions" | "clubs">("submissions")
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  if (!user) {
    return null // Don't render anything while redirecting
  }

  const filteredSubmissions = submissions.filter(
    (sub) =>
      sub.club.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.leader.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.workshop.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredClubs = clubs.filter(
    (club) =>
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.leader.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const refreshData = () => {
    setIsLoading(true)
    // Simulate API call to Airtable
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

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
                  onClick={refreshData}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>

            {activeTab === "submissions" ? (
              <>
                <div className="rounded-md border border-gold-500 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-navy-700 text-cream">
                      <TableRow>
                        <TableHead className="font-serif">Workshop</TableHead>
                        <TableHead className="font-serif">Club</TableHead>
                        <TableHead className="font-serif">Leader</TableHead>
                        <TableHead className="font-serif">Event Code</TableHead>
                        <TableHead className="font-serif">Submission</TableHead>
                        <TableHead className="font-serif">Date</TableHead>
                        <TableHead className="font-serif text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubmissions.length > 0 ? (
                        filteredSubmissions.map((submission) => (
                          <TableRow key={submission.id} className="bg-white font-mono text-sm">
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <span className="mr-2">{submission.workshopEmoji}</span>
                                {submission.workshop}
                              </div>
                            </TableCell>
                            <TableCell>{submission.club}</TableCell>
                            <TableCell>{submission.leader}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-gold-500 bg-cream font-mono">
                                {submission.eventCode}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {submission.submissionType === "image" ? (
                                <span className="flex items-center">
                                  <Camera className="h-3 w-3 mr-1" />
                                  {submission.submissionContent.substring(0, 15)}...
                                </span>
                              ) : (
                                <span>{submission.submissionContent}</span>
                              )}
                            </TableCell>
                            <TableCell>{submission.date}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-gold-500">
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View</span>
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-gold-500">
                                  <Download className="h-4 w-4" />
                                  <span className="sr-only">Download</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4 text-stone-500 font-mono">
                            No submissions found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

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
                <div className="rounded-md border border-gold-500 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-navy-700 text-cream">
                      <TableRow>
                        <TableHead className="font-serif">Club Name</TableHead>
                        <TableHead className="font-serif">Leader</TableHead>
                        <TableHead className="font-serif">Members</TableHead>
                        <TableHead className="font-serif">Workshops</TableHead>
                        <TableHead className="font-serif">Location</TableHead>
                        <TableHead className="font-serif">Status</TableHead>
                        <TableHead className="font-serif text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClubs.length > 0 ? (
                        filteredClubs.map((club) => (
                          <TableRow key={club.name} className="bg-white font-mono text-sm">
                            <TableCell className="font-medium">{club.name}</TableCell>
                            <TableCell>{club.leader}</TableCell>
                            <TableCell>{club.members}</TableCell>
                            <TableCell>{club.completedWorkshops}/4</TableCell>
                            <TableCell>{club.location}</TableCell>
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
                              <Button size="sm" variant="outline" className="h-8 border-gold-500 text-navy-700">
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4 text-stone-500 font-mono">
                            No clubs found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

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
            Connected to Airtable • Last synced: {new Date().toLocaleTimeString()}
            {isLoading && <RefreshCw className="ml-2 h-3 w-3 animate-spin" />}
          </p>
        </div>
      </div>
    </div>
  )
}
