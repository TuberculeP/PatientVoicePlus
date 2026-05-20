-- CreateEnum
CREATE TYPE "analysis_status" AS ENUM ('PENDING', 'DONE', 'ERROR');

-- CreateTable
CREATE TABLE "form_analyses" (
    "id" UUID NOT NULL,
    "form_id" UUID NOT NULL,
    "status" "analysis_status" NOT NULL DEFAULT 'PENDING',
    "analyse" TEXT,
    "tags" TEXT[],
    "needs_human_review" BOOLEAN NOT NULL DEFAULT false,
    "audit_level" TEXT,
    "in_quota" BOOLEAN,
    "has_pii" BOOLEAN,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "form_analyses_form_id_key" ON "form_analyses"("form_id");

-- AddForeignKey
ALTER TABLE "form_analyses" ADD CONSTRAINT "form_analyses_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
