import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCenterDto } from './dto/create-center.dto.js';
import { UpdateCenterDto } from './dto/update-center.dto.js';

function mapCenter(center: {
  id: string;
  name: string;
  description: string;
  city: string;
  postalCode: string;
  address: string;
  deletedAt: Date | null;
  specialties?: { specialty: { id: number; name: string } }[];
}) {
  return {
    id: center.id,
    name: center.name,
    description: center.description,
    city: center.city,
    postalCode: center.postalCode,
    address: center.address,
    isActive: center.deletedAt === null,
    deletedAt: center.deletedAt,
    specialties: center.specialties?.map((cs) => cs.specialty) ?? [],
    specialtyIds: center.specialties?.map((cs) => cs.specialty.id) ?? [],
  };
}

@Injectable()
export class AdminCentersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.center
      .findMany({
        orderBy: { name: 'asc' },
        include: {
          specialties: { include: { specialty: true } },
        },
      })
      .then((centers) => centers.map(mapCenter));
  }

  async findOne(id: string) {
    const center = await this.prisma.center.findUnique({
      where: { id },
      include: {
        specialties: { include: { specialty: true } },
      },
    });
    if (!center) throw new NotFoundException('Établissement introuvable');
    return mapCenter(center);
  }

  async create(dto: CreateCenterDto) {
    const specialtyIds = dto.specialtyIds ?? [];
    const center = await this.prisma.$transaction(async (tx) => {
      const created = await tx.center.create({
        data: {
          name: dto.name,
          description: dto.description,
          city: dto.city,
          postalCode: dto.postalCode,
          address: dto.address,
        },
      });
      if (specialtyIds.length > 0) {
        await tx.centerSpecialty.createMany({
          data: specialtyIds.map((specialtyId) => ({
            centerId: created.id,
            specialtyId,
          })),
        });
      }
      return tx.center.findUnique({
        where: { id: created.id },
        include: { specialties: { include: { specialty: true } } },
      });
    });
    return mapCenter(center!);
  }

  async update(id: string, dto: UpdateCenterDto) {
    const existing = await this.prisma.center.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Établissement introuvable');

    const center = await this.prisma.$transaction(async (tx) => {
      await tx.center.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.description !== undefined && {
            description: dto.description,
          }),
          ...(dto.city !== undefined && { city: dto.city }),
          ...(dto.postalCode !== undefined && { postalCode: dto.postalCode }),
          ...(dto.address !== undefined && { address: dto.address }),
        },
      });
      if (dto.specialtyIds !== undefined) {
        await tx.centerSpecialty.deleteMany({ where: { centerId: id } });
        if (dto.specialtyIds.length > 0) {
          await tx.centerSpecialty.createMany({
            data: dto.specialtyIds.map((specialtyId) => ({
              centerId: id,
              specialtyId,
            })),
          });
        }
      }
      return tx.center.findUnique({
        where: { id },
        include: { specialties: { include: { specialty: true } } },
      });
    });
    return mapCenter(center!);
  }

  async deactivate(id: string) {
    const existing = await this.prisma.center.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Établissement introuvable');

    const center = await this.prisma.center.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: { specialties: { include: { specialty: true } } },
    });
    return mapCenter(center);
  }

  async activate(id: string) {
    const existing = await this.prisma.center.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Établissement introuvable');

    const center = await this.prisma.center.update({
      where: { id },
      data: { deletedAt: null },
      include: { specialties: { include: { specialty: true } } },
    });
    return mapCenter(center);
  }

  findAllSpecialties() {
    return this.prisma.specialty.findMany({ orderBy: { name: 'asc' } });
  }

  async remove(id: string) {
    const existing = await this.prisma.center.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Établissement introuvable');

    await this.prisma.center.delete({ where: { id } });
    return { ok: true };
  }
}
