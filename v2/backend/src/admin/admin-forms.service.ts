import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

function averageRating(answers: { value: string }[]) {
  const ratings = answers
    .map((a) => parseInt(a.value, 10))
    .filter((n) => n >= 1 && n <= 5);
  if (ratings.length === 0) return null;
  return (
    Math.round((ratings.reduce((s, n) => s + n, 0) / ratings.length) * 10) / 10
  );
}

function mapFormListItem(form: {
  id: string;
  centerId: string;
  createdAt: Date;
  deletedAt: Date | null;
  center: { name: string };
  answers: { value: string }[];
}) {
  return {
    id: form.id,
    centerId: form.centerId,
    centerName: form.center.name,
    createdAt: form.createdAt,
    isActive: form.deletedAt === null,
    answersCount: form.answers.length,
    averageRating: averageRating(form.answers),
  };
}

@Injectable()
export class AdminFormsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(centerId?: string) {
    return this.prisma.form
      .findMany({
        where: centerId ? { centerId } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          center: true,
          answers: true,
        },
      })
      .then((forms) => forms.map(mapFormListItem));
  }

  async findOne(id: string) {
    const form = await this.prisma.form.findUnique({
      where: { id },
      include: {
        center: true,
        answers: {
          include: {
            question: { include: { theme: true } },
          },
          orderBy: { questionId: 'asc' },
        },
      },
    });
    if (!form) throw new NotFoundException('Retour introuvable');

    return {
      id: form.id,
      centerId: form.centerId,
      centerName: form.center.name,
      createdAt: form.createdAt,
      isActive: form.deletedAt === null,
      answers: form.answers.map((a) => ({
        questionId: a.questionId,
        themeName: a.question.theme?.name ?? 'Thème',
        value: a.value,
        content: a.content,
      })),
    };
  }

  async deactivate(id: string) {
    const existing = await this.prisma.form.findUnique({
      where: { id },
      include: { center: true, answers: true },
    });
    if (!existing) throw new NotFoundException('Retour introuvable');

    const form = await this.prisma.form.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: { center: true, answers: true },
    });
    return mapFormListItem(form);
  }

  async activate(id: string) {
    const existing = await this.prisma.form.findUnique({
      where: { id },
      include: { center: true, answers: true },
    });
    if (!existing) throw new NotFoundException('Retour introuvable');

    const form = await this.prisma.form.update({
      where: { id },
      data: { deletedAt: null },
      include: { center: true, answers: true },
    });
    return mapFormListItem(form);
  }
}
