import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import { GenerateAiAuditDto } from './dto/generate-ai-audit.dto.js';
import { GenerateAuditDto } from './dto/generate-audit.dto.js';
import { UpdateAuditDto } from './dto/update-audit.dto.js';

@Injectable()
export class AuditsService {
  private readonly logger = new Logger(AuditsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  list() {
    return this.prisma.audit.findMany({
      include: { center: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const audit = await this.prisma.audit.findUnique({
      where: { id },
      include: { center: { select: { name: true, city: true } } },
    });
    if (!audit) throw new NotFoundException('Audit introuvable');
    return audit;
  }

  async generate(dto: GenerateAuditDto) {
    const center = await this.prisma.center.findFirst({
      where: { id: dto.centerId, deletedAt: null },
    });
    if (!center) throw new NotFoundException('Établissement introuvable');

    const date = new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const content = `# Audit — ${center.name}

_Généré le ${date}_

## Résumé général

Ce rapport sera complété automatiquement par le workflow d'analyse.

## Points positifs

- À compléter

## Points d'amélioration

- À compléter

## Recommandations

- À compléter
`;

    return this.prisma.audit.create({
      data: {
        centerId: center.id,
        title: `Audit — ${center.name}`,
        content,
      },
      include: { center: { select: { name: true } } },
    });
  }

  triggerAiGeneration(dto: GenerateAiAuditDto) {
    const webhookUrl = this.config.get<string>('N8N_PRE_AUDIT_WEBHOOK_URL');
    if (!webhookUrl) return { ok: true };

    const secretKey = this.config.get<string>('N8N_WEBHOOK_SECRET_KEY');
    const secretValue = this.config.get<string>('N8N_WEBHOOK_SECRET');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (secretKey && secretValue) headers[secretKey] = secretValue;

    fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(dto),
    })
      .then((res) => {
        if (!res.ok) {
          this.logger.error(
            `n8n pre-audit webhook responded with status ${res.status}`,
          );
        }
      })
      .catch((err: unknown) => {
        this.logger.error(`n8n pre-audit webhook failed: ${String(err)}`);
      });

    return { ok: true };
  }

  async update(id: string, dto: UpdateAuditDto) {
    await this.findOne(id);
    return this.prisma.audit.update({
      where: { id },
      data: dto,
      include: { center: { select: { name: true } } },
    });
  }
}
