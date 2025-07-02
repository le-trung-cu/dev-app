/*
  Warnings:

  - Added the required column `height` to the `CanvasProject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `json` to the `CanvasProject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `CanvasProject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `CanvasProject` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CanvasProject" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "json" TEXT NOT NULL,
    "height" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "thumbnailUrl" TEXT,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CanvasProject_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CanvasProject" ("createdAt", "id", "updatedAt", "userId", "workspaceId") SELECT "createdAt", "id", "updatedAt", "userId", "workspaceId" FROM "CanvasProject";
DROP TABLE "CanvasProject";
ALTER TABLE "new_CanvasProject" RENAME TO "CanvasProject";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
