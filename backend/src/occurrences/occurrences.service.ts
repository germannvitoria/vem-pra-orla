import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service.js';

@Injectable()
export class OccurrencesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.occurrence.findMany({
      orderBy: { criadoEm: 'desc' },
    });
  }
}