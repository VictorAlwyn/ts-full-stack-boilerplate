-- Create user role enum
CREATE TYPE "user_role" AS ENUM('public', 'user', 'admin');

-- Add role column to users table
ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'user' NOT NULL;

-- Create index on role column
CREATE INDEX "users_role_idx" ON "users" ("role"); 