/*
  Warnings:

  - Added the required column `clubCode` to the `Workshop` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Workshop" ADD COLUMN     "clubCode" TEXT NOT NULL,
ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "submissionDate" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Workshop" ADD CONSTRAINT "Workshop_clubCode_fkey" FOREIGN KEY ("clubCode") REFERENCES "Club"("clubCode") ON DELETE RESTRICT ON UPDATE CASCADE;
