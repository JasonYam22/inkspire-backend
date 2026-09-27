-- CreateTable
CREATE TABLE "TattooIdea" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "genre" TEXT,
    "spot" TEXT,
    "city" TEXT,
    "imageUrl" TEXT,
    "notes" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TattooIdea_pkey" PRIMARY KEY ("id")
);
