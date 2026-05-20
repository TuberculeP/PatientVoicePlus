import { Injectable, NotFoundException } from '@nestjs/common';
import { AnalysisStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { AnalysisCallbackDto } from './dto/analysis-callback.dto.js';

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
}
