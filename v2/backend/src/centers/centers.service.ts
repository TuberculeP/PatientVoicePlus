import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CentersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.center.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const center = await this.prisma.center.findFirst({
      where: { id, deletedAt: null },
      include: {
        specialties: {
          include: { specialty: true },
        },
      },
    });
    if (!center) return null;
    return {
      ...center,
      specialties: center.specialties.map((cs) => cs.specialty),
    };
  }
}
