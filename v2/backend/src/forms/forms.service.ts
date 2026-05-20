import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { SubmitFormDto } from './dto/submit-form.dto.js';

@Injectable()
export class FormsService {
  constructor(private readonly prisma: PrismaService) {}

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
    });
    if (activeQuestions.length !== questionIds.length) {
      throw new BadRequestException(
        'One or more question_ids are invalid or inactive',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      const form = await tx.form.create({ data: { centerId: dto.center_id } });
      await tx.answer.createMany({
        data: dto.answers.map((a) => ({
          formId: form.id,
          questionId: a.question_id,
          value: a.value,
          content: a.content ?? null,
        })),
      });
    });

    return {};
  }
}
