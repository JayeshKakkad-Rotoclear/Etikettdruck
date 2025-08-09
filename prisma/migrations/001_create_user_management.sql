-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "user_management";

-- CreateEnum
CREATE TYPE "user_management"."UserRole" AS ENUM ('ADMIN', 'PRUEFER_A', 'PRUEFER_B', 'VIEWER');

-- CreateEnum
CREATE TYPE "user_management"."UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateTable
CREATE TABLE "user_management"."User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "user_management"."UserRole" NOT NULL DEFAULT 'VIEWER',
    "status" "user_management"."UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_management"."Session" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "user_management"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "user_management"."User"("email");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "user_management"."Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "user_management"."Session"("expiresAt");

-- AddForeignKey
ALTER TABLE "user_management"."User" ADD CONSTRAINT "User_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user_management"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_management"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_management"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert default admin user
-- Password is 'admin123' - CHANGE THIS IN PRODUCTION!
INSERT INTO "user_management"."User" (
    "username", 
    "email", 
    "passwordHash", 
    "firstName", 
    "lastName", 
    "role", 
    "status",
    "updatedAt"
) VALUES (
    'admin',
    'admin@rotoclear.com',
    '$2b$10$rJ8FnDVyqPtBaUz.kF2VB.ZNiG5Kl6UJvDJKbN2HqS7vP3MzXc1z2',
    'System',
    'Administrator',
    'ADMIN',
    'ACTIVE',
    CURRENT_TIMESTAMP
);
