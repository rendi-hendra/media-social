/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `posts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "posts_userId_key" ON "posts"("userId");
