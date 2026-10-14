import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service.js';
import { CreateOccurrenceDto } from './dto/create-occurrence.dto.js';

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
}