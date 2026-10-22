import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service.js';
import { CreateOccurrenceDto } from './dto/create-occurrence.dto.js';
import { UpdateOccurrenceDto } from './dto/update-occurrence.dto.js';

@Injectable()
export class OccurrencesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.occurrence.findMany({
      orderBy: { criadoEm: 'desc' },
    });
  }
  async create(userId: string, dto: CreateOccurrenceDto) {
  return this.prisma.occurrence.create({
    data: {
      userId,
      tipo: dto.tipo,
      local: dto.local,
      descricao: dto.descricao,
      impacto: dto.impacto,
    },
  });
}

  private async verificarDono(id: string, userId: string) {
    const o = await this.prisma.occurrence.findUnique({ where: { id } });
    if (!o) throw new NotFoundException('Ocorrência não encontrada.');
    if (o.userId !== userId) {
      throw new ForbiddenException('Você só pode alterar suas próprias ocorrências.');
    }
  }

  async update(id: string, userId: string, dto: UpdateOccurrenceDto) {
    await this.verificarDono(id, userId);
    return this.prisma.occurrence.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.verificarDono(id, userId);
    await this.prisma.occurrence.delete({ where: { id } });
    return { ok: true };
  }
}