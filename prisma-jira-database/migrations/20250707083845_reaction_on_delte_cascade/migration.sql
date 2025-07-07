-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Reaction" (
    "messageId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,

    PRIMARY KEY ("messageId", "memberId", "symbol"),
    CONSTRAINT "Reaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Reaction_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Reaction" ("memberId", "messageId", "symbol") SELECT "memberId", "messageId", "symbol" FROM "Reaction";
DROP TABLE "Reaction";
ALTER TABLE "new_Reaction" RENAME TO "Reaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
