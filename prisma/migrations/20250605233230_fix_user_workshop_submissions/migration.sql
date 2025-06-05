-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slackId" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "avatar" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Club" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "clubCode" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Club_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Workshop" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "clubCode" TEXT NOT NULL,
    "emoji" TEXT
);

-- CreateTable
CREATE TABLE "UserWorkshop" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "workshopId" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "submissionDate" DATETIME,
    "eventCode" TEXT,
    CONSTRAINT "UserWorkshop_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserWorkshop_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "Workshop" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_slackId_key" ON "User"("slackId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Club_clubCode_key" ON "Club"("clubCode");

-- CreateIndex
CREATE UNIQUE INDEX "Club_userId_key" ON "Club"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserWorkshop_userId_workshopId_key" ON "UserWorkshop"("userId", "workshopId");
