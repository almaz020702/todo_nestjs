-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "completed" SET DEFAULT false,
ALTER COLUMN "dueDate" DROP NOT NULL;
