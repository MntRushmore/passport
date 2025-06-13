// import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Award, Clock, ChevronRight } from "lucide-react"
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  const userId = Number(session?.value);

  if (!userId || isNaN(userId)) {
    console.error("Invalid userId in session:", session?.value);
    return <p>Unauthorized</p>;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { club: true },
  });

  if (!user) {
    console.error("User not found in DB:", user);
    return <p>User not found</p>;
  }

  // const clubCode = user.club?.clubCode; // clubCode no longer needed
  const workshops = await prisma.workshop.findMany();

  // Get user's workshop submissions
  const userWorkshops = await prisma.userWorkshop.findMany({
    where: { userId: userId },
    include: { workshop: true }
  });

  // Create a map of workshop submissions by workshop ID
  const submissionMap = new Map(
    userWorkshops.map((uw: any) => [uw.workshopId, uw])
  );

  // Merge workshop data with user submission data
  const workshopsWithUserData = workshops.map((workshop: any) => {
    const submission = submissionMap.get(workshop.id);
    return {
      ...workshop,
      completed: submission ? submission.completed : false,
      submissionDate: submission?.submissionDate?.toISOString() || null,
      eventCode: submission?.eventCode || null,
    };
  });

  const showCreateClubPopup = !user.club?.name || !user.club?.clubCode;

  let clubs: any[] = [];
  try {
    const res = await fetch("/api/get-clubs", {
      cache: "no-store",
    });
    clubs = await res.json();
  } catch (e) {
    console.error("Failed to fetch clubs from API", e);
  }

  if (showCreateClubPopup) {
    // still render the page, just with the popup
  }

  const completedCount = (workshopsWithUserData || []).filter((w: any) => w.completed).length
  const progressPercentage = (completedCount / (workshopsWithUserData.length || 1)) * 100
  // Compute display message for progress
  let statusMessage: string;
  const totalWorkshops = workshopsWithUserData.length;
  if (totalWorkshops === 0) {
    statusMessage = "No workshops available";
  } else if (completedCount === totalWorkshops) {
    statusMessage = "All workshops completed!";
  } else {
    const remaining = totalWorkshops - completedCount;
    statusMessage = `${remaining} workshop${remaining > 1 ? "s" : ""} remaining`;
  }
  const lastSubmission = (workshopsWithUserData || [])
    .filter((w: any) => w.completed)
    .sort((a: any, b: any) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime())[0]

  return (
    <>
      {showCreateClubPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-cream border border-gold-500 rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-serif text-navy-700 mb-4">Welcome, {user.name}!</h2>
            <p className="text-sm text-stone-700 mb-6 font-mono">
              You haven’t joined a club yet. Choose your club to get started!
            </p>
            <form action="/api/join-club" method="POST" className="flex flex-col gap-4">
              <select
                name="clubCode"
                required
                className="p-2 rounded border border-stone-300 font-mono text-sm text-navy-700"
              >
                <option value="">Select your club...</option>
                {clubs.map((club) => (
                  <option key={club.code} value={club.code}>
                    {club.name} ({club.city})
                  </option>
                ))}
              </select>
              <div className="flex justify-end">
                <Button type="submit" className="bg-navy-700 hover:bg-navy-800 text-cream font-serif">
                  Join Club
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-stone-100 flex flex-col items-center p-4 md:p-8">
      <div className="max-w-4xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-serif font-bold text-navy-700">Dashboard</h1>

          <Button asChild className="bg-navy-700 hover:bg-navy-800 text-cream font-serif">
            <Link href="/passport">View Passport</Link>
          </Button>
        </div>

        <div className="mb-6">
          <Card className="border-gold-500 bg-cream overflow-hidden">
            <CardHeader className="navy-header pb-2">
              <CardTitle className="text-cream font-serif text-lg">Club Profile</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-gold-500">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name || "User"} />
                  <AvatarFallback className="bg-navy-700 text-cream text-xl">{user.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>

                <div>
                  <h2 className="font-serif text-navy-700 text-xl">{user.club?.name}</h2>
                  <p className="font-mono text-sm text-stone-600">Leader: {user.name}</p>
                  <div className="mt-2">
                    {completedCount >= 3 ? (
                      <Badge className="bg-gold-500 text-navy-800 font-mono text-xs">GOLD STATUS</Badge>
                    ) : completedCount >= 1 ? (
                      <Badge className="bg-navy-700 text-cream font-mono text-xs">ACTIVE</Badge>
                    ) : (
                      <Badge variant="outline" className="border-navy-700 text-navy-700 font-mono text-xs">
                        NEW
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="ml-auto text-right">
                  <div className="font-mono text-sm text-navy-700">
                    <span className="text-3xl font-bold">{completedCount}</span>
                    <span className="text-stone-600">/{workshopsWithUserData.length}</span>
                  </div>
                  <p className="font-mono text-xs text-stone-600">workshops completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="border-gold-500 bg-cream">
            <CardHeader className="navy-header pb-2">
              <CardTitle className="text-cream font-serif text-lg flex items-center">
                <Award className="mr-2 h-4 w-4" /> Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Progress value={progressPercentage} className="h-3 bg-stone-200" indicatorClassName="bg-navy-700" />
              <p className="font-mono text-sm text-stone-600">
                {statusMessage}
              </p>

              <div className="mt-4 pt-4 border-t border-gold-500">
                <div className="grid grid-cols-4 gap-2">
                  {(workshopsWithUserData || []).map((workshop: any) => (
                    <div
                      key={workshop.id}
                      className={`flex items-center justify-center aspect-square rounded-full text-2xl
                        ${
                          workshop.completed
                            ? "bg-navy-700 text-cream border-2 border-gold-500"
                            : "bg-stone-200 text-stone-400 border border-stone-300"
                        }`}
                    >
                      {workshop.emoji}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gold-500 bg-cream">
            <CardHeader className="navy-header pb-2">
              <CardTitle className="text-cream font-serif text-lg flex items-center">
                <Clock className="mr-2 h-4 w-4" /> Last Submission
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {lastSubmission ? (
                <div className="font-mono">
                  <div className="flex items-center mb-3">
                    <span className="text-3xl mr-3">{lastSubmission.emoji}</span>
                    <span className="text-navy-700 font-serif text-lg">{lastSubmission.title}</span>
                  </div>
                  <div className="bg-white p-3 rounded border border-gold-500">
                    <p className="text-xs text-stone-600 flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      Submitted on {lastSubmission.submissionDate}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-mono text-stone-600">No submissions yet</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-gold-500 bg-cream">
            <CardHeader className="navy-header pb-2">
              <CardTitle className="text-cream font-serif text-lg">Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="font-mono">
                {completedCount < workshopsWithUserData.length ? (
                  <div>
                    <p className="text-sm text-navy-700 mb-3">Continue your journey:</p>
                    {(workshopsWithUserData || [])
                      .filter((w: any) => !w.completed)
                      .slice(0, 2)
                      .map((workshop: any) => (
                        <Link
                          key={workshop.id}
                          href={`/submit/${workshop.id}`}
                          className="flex items-center justify-between p-3 bg-white rounded border border-gold-500 mb-2 hover:bg-stone-50 transition-colors"
                        >
                          <div className="flex items-center">
                            <span className="text-xl mr-2">{workshop.emoji}</span>
                            <span className="text-navy-700">{workshop.title}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-navy-700" />
                        </Link>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-lg text-navy-700 font-serif mb-2">Congratulations!</p>
                    <p className="text-sm text-stone-600">You've completed all workshops</p>
                    <div className="text-3xl mt-2">🎉</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-gold-500 bg-cream mb-6">
          <CardHeader className="navy-header pb-2">
            <CardTitle className="text-cream font-serif text-lg">Workshop Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {(workshopsWithUserData || []).map((workshop: any) => (
                <div
                  key={workshop.id}
                  className="border border-gold-500 rounded-md p-4 bg-white relative overflow-hidden"
                >
                  {workshop.completed && (
                    <div className="absolute top-0 right-0 w-16 h-16">
                      <div className="absolute transform rotate-45 bg-navy-700 text-xs text-cream font-mono py-1 text-center w-24 top-3 right-[-30px]">
                        COMPLETED
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <span className="text-3xl mr-2">{workshop.emoji}</span>
                      <span className="font-serif text-navy-700 text-lg">{workshop.title}</span>
                    </div>
                  </div>
                  {workshop.completed ? (
                    <p className="text-xs font-mono text-stone-600 mb-3">Completed on {workshop.submissionDate}</p>
                  ) : (
                    <p className="text-xs font-mono text-stone-600 mb-3">Workshop not yet completed</p>
                  )}
                  <Button
                    asChild
                    size="sm"
                    className={`w-full ${
                      workshop.completed
                        ? "bg-stone-100 hover:bg-stone-200 text-navy-700"
                        : "bg-navy-700 hover:bg-navy-800 text-cream"
                    } font-serif text-xs`}
                  >
                    <Link href={`/submit/${workshop.id}`}>
                      {workshop.completed ? "View Submission" : "Submit Workshop"}
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button asChild className="bg-navy-700 hover:bg-navy-800 text-cream font-serif">
            <Link href="/admin">Admin Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
    </>
  )
}
