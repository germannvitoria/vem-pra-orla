import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly campos = { email: true, notificacoesAtivas: true };

  async obter(userId: string) {
    const perfil = await this.prisma.profile.findUnique({
      where: { id: userId },
      select: this.campos,
    });
    if (!perfil) throw new NotFoundException('Perfil não encontrado.');
    return perfil;
  }

  async atualizar(userId: string, dto: UpdateProfileDto) {
    await this.obter(userId);
    return this.prisma.profile.update({
      where: { id: userId },
      data: { notificacoesAtivas: dto.notificacoesAtivas },
      select: this.campos,
    });
  }
}