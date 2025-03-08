/*
  Warnings:

  - Added the required column `token` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "token" TEXT NOT NULL;
