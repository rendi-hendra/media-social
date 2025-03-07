/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `memberships` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "memberships_userId_key" ON "memberships"("userId");
