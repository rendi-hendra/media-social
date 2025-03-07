/*
  Warnings:

  - The primary key for the `transactions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("membershipId", "userId");
