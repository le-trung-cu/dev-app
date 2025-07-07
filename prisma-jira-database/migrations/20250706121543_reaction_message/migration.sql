-- CreateTable
CREATE TABLE "Reaction" (
    "messageId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,

    PRIMARY KEY ("messageId", "memberId", "symbol"),
    CONSTRAINT "Reaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reaction_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
