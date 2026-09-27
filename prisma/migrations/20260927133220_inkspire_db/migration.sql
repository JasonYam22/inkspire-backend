/*
  Warnings:

  - You are about to drop the column `city` on the `TattooIdea` table. All the data in the column will be lost.
  - Added the required column `userId` to the `TattooIdea` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TattooIdea" DROP COLUMN "city",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "TattooIdea" ADD CONSTRAINT "TattooIdea_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
