-- AlterTable
ALTER TABLE "users" ALTER COLUMN "image" DROP NOT NULL,
ALTER COLUMN "token" DROP NOT NULL,
ALTER COLUMN "createdAt" DROP NOT NULL;