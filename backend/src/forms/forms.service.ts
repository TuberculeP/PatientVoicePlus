import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Question, Theme } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { NO_RATING_VALUE, FREE_COMMENT_THEME_NAME } from './forms.constants.js';
import { SubmitFormDto, AnswerDto } from './dto/submit-form.dto.js';

type QuestionWithTheme = Question & { theme: Theme | null };

@Injectable()
export class FormsService {
  private readonly logger = new Logger(FormsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async getThemesWithQuestions() {
    const themes = await this.prisma.theme.findMany({
      orderBy: { id: 'asc' },
      include: {
        questions: {
          where: { isActive: true },
          orderBy: { id: 'asc' },
          take: 1,
        },
      },
    });
    return themes
      .filter((theme) => theme.questions.length > 0)
      .map((theme) => ({
        name: theme.name,
        questionId: theme.questions[0].id.toString(),
        commentOnly: theme.name === FREE_COMMENT_THEME_NAME,
      }));
  }

  async submitForm(dto: SubmitFormDto) {
    const center = await this.prisma.center.findFirst({
      where: { id: dto.center_id, deletedAt: null },
    });
    if (!center) throw new BadRequestException('Invalid center_id');

    const questionIds = dto.answers.map((a) => a.question_id);
    const activeQuestions = await this.prisma.question.findMany({
      where: { id: { in: questionIds }, isActive: true },
      include: { theme: true },
    });
    if (activeQuestions.length !== questionIds.length) {
      throw new BadRequestException(
        'One or more question_ids are invalid or inactive',
      );
    }

    let formId: string;
    await this.prisma.$transaction(async (tx) => {
      const form = await tx.form.create({ data: { centerId: dto.center_id } });
      formId = form.id;
      await tx.answer.createMany({
        data: dto.answers.map((a) => ({
          formId: form.id,
          questionId: a.question_id,
          value: a.value,
          content: a.content ?? null,
        })),
      });
    });

    await this.prisma.formAnalysis.create({
      data: { formId: formId! },
    });

    this.triggerAnalysis(formId!, dto.answers, activeQuestions);

    return {};
  }

  private triggerAnalysis(
    formId: string,
    answers: AnswerDto[],
    questions: QuestionWithTheme[],
  ) {
    const webhookUrl = this.config.get<string>('N8N_WEBHOOK_URL');
    if (!webhookUrl) return;

    const questionMap = new Map(questions.map((q) => [q.id, q]));

    const sections = answers
      .map((a) => {
        const q = questionMap.get(a.question_id);
        const label = q?.theme?.name ?? 'Commentaire';
        const hasRating = a.value !== NO_RATING_VALUE;

        let section = `[${label}]`;
        if (hasRating) section += ` Note : ${a.value}/5`;
        if (a.content) section += `\n${a.content}`;

        return { section, hasContent: !!a.content, hasRating };
      })
      .filter((s) => s.hasContent || s.hasRating)
      .map((s) => s.section);

    const message = sections.join('\n\n');
    if (!message.trim()) return;

    const secretKey = this.config.get<string>('N8N_WEBHOOK_SECRET_KEY');
    const secretValue = this.config.get<string>('N8N_WEBHOOK_SECRET');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (secretKey && secretValue) headers[secretKey] = secretValue;

    fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ form_id: formId, message }),
    })
      .then((res) => {
        if (!res.ok) {
          this.logger.error(
            `n8n webhook responded with status ${res.status} for form ${formId}`,
          );
        }
      })
      .catch((err: unknown) => {
        this.logger.error(
          `n8n webhook failed for form ${formId}: ${String(err)}`,
        );
      });
  }
}
