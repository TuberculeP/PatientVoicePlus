-- CreateIndex
CREATE INDEX "questions_theme_id_idx" ON "questions"("theme_id");

-- CreateIndex
CREATE INDEX "forms_center_id_idx" ON "forms"("center_id");

-- CreateIndex
CREATE INDEX "answers_form_id_idx" ON "answers"("form_id");

-- CreateIndex
CREATE INDEX "answers_question_id_idx" ON "answers"("question_id");

-- CreateIndex
CREATE INDEX "audits_center_id_idx" ON "audits"("center_id");
