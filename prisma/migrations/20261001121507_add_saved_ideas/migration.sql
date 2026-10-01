-- CreateTable
CREATE TABLE "_SavedIdeas" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SavedIdeas_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_SavedIdeas_B_index" ON "_SavedIdeas"("B");

-- AddForeignKey
ALTER TABLE "_SavedIdeas" ADD CONSTRAINT "_SavedIdeas_A_fkey" FOREIGN KEY ("A") REFERENCES "TattooIdea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SavedIdeas" ADD CONSTRAINT "_SavedIdeas_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
