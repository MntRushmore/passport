/*
  Warnings:

  - You are about to drop the column `hcId` on the `Club` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[clubCode]` on the table `Club` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clubCode` to the `Club` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Club_hcId_key";

-- AlterTable
ALTER TABLE "Club" DROP COLUMN "hcId",
ADD COLUMN     "clubCode" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Club_clubCode_key" ON "Club"("clubCode");
