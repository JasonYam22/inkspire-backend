-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ARTIST');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';
