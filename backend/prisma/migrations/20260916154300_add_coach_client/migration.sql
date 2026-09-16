-- CreateEnum
CREATE TYPE "Role" AS ENUM ('COACH', 'CLIENT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'CLIENT';

-- CreateTable
CREATE TABLE "CoachClient" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachClient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CoachClient_coachId_clientId_key" ON "CoachClient"("coachId", "clientId");

-- CreateIndex
CREATE INDEX "CoachClient_coachId_idx" ON "CoachClient"("coachId");

-- CreateIndex
CREATE INDEX "CoachClient_clientId_idx" ON "CoachClient"("clientId");

-- AddForeignKey
ALTER TABLE "CoachClient" ADD CONSTRAINT "CoachClient_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachClient" ADD CONSTRAINT "CoachClient_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
