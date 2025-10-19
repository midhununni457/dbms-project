-- AlterTable
ALTER TABLE "dbmsproj"."Response" ADD COLUMN     "testId" INTEGER;

-- AddForeignKey
ALTER TABLE "dbmsproj"."Response" ADD CONSTRAINT "Response_testId_fkey" FOREIGN KEY ("testId") REFERENCES "dbmsproj"."Test"("id") ON DELETE SET NULL ON UPDATE CASCADE;
