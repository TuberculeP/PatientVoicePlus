import { Injectable, NotFoundException } from '@nestjs/common';
import { AnalysisStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { AnalysisCallbackDto } from './dto/analysis-callback.dto.js';
import { ReviewsQueryDto } from './dto/reviews-query.dto.js';
import { CreateAuditDraftDto } from './dto/create-audit-draft.dto.js';

function averageRating(answers: { value: string }[]) {
  const ratings = answers
    .map((a) => parseInt(a.value, 10))
    .filter((n) => n >= 1 && n <= 5);
  if (ratings.length === 0) return null;
  return (
    Math.round((ratings.reduce((s, n) => s + n, 0) / ratings.length) * 10) / 10
  );
}

@Injectable()
export class N8nService {
  constructor(private readonly prisma: PrismaService) {}

  async handleCallback(dto: AnalysisCallbackDto) {
    const existing = await this.prisma.formAnalysis.findUnique({
      where: { formId: dto.form_id },
    });
    if (!existing) throw new NotFoundException('FormAnalysis not found');

    if (dto.success) {
      await this.prisma.formAnalysis.update({
        where: { formId: dto.form_id },
        data: {
          status: AnalysisStatus.DONE,
          analyse: dto.analyse ?? null,
          tags: dto.tags ?? [],
          needsHumanReview: dto.needs_human_review ?? false,
          auditLevel: dto.audit_level ?? null,
          inQuota: dto.in_quota ?? null,
          hasPii: dto.has_pii ?? null,
        },
      });
    } else {
      await this.prisma.formAnalysis.update({
        where: { formId: dto.form_id },
        data: {
          status: AnalysisStatus.ERROR,
          errorMessage: dto.error ?? 'Unknown error',
        },
      });
    }

    return { ok: true };
  }

  async fetchReviews(dto: ReviewsQueryDto) {
    const center = await this.prisma.center.findFirst({
      where: { id: dto.centerId, deletedAt: null },
      select: { id: true, name: true },
    });
    if (!center) throw new NotFoundException('Établissement introuvable');

    const forms = await this.prisma.form.findMany({
      where: {
        centerId: dto.centerId,
        deletedAt: null,
        createdAt: {
          gte: new Date(dto.dateFrom),
          lte: new Date(dto.dateTo),
        },
        analysis: { status: AnalysisStatus.DONE },
      },
      orderBy: { createdAt: 'asc' },
      include: {
        answers: { select: { value: true } },
        analysis: {
          select: {
            analyse: true,
            tags: true,
            auditLevel: true,
            needsHumanReview: true,
          },
        },
      },
    });

    return {
      center,
      period: { from: dto.dateFrom, to: dto.dateTo },
      forms: forms.map((f) => ({
        id: f.id,
        createdAt: f.createdAt,
        averageRating: averageRating(f.answers),
        analysis: f.analysis,
      })),
      total: forms.length,
    };
  }

  async createAuditDraft(dto: CreateAuditDraftDto) {
    const center = await this.prisma.center.findFirst({
      where: { id: dto.centerId, deletedAt: null },
    });
    if (!center) throw new NotFoundException('Établissement introuvable');

    return this.prisma.audit.create({
      data: {
        centerId: dto.centerId,
        title: dto.title,
        content: dto.content,
      },
      include: { center: { select: { name: true } } },
    });
  }
}
