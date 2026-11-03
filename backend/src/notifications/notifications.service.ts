import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service.js';
import { LeisureIndexService } from '../leisure-index/leisure-index.service.js';
import { MailService } from './mail.service.js';
import { montarEmail } from './email-template.js';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly leisureIndex: LeisureIndexService,
    private readonly mail: MailService,
  ) {}

  // Busca índice, clima e ocorrências das últimas 24h e monta o resumo do dia.
  async montarResumo() {
    const resultado = await this.leisureIndex.calculate();
    const desde = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const ocorrencias = await this.prisma.occurrence.findMany({
      where: { criadoEm: { gte: desde } },
      orderBy: { criadoEm: 'desc' },
      take: 5,
    });
    return {
      indice: resultado.indice,
      classificacao: resultado.classificacao,
      clima: resultado.clima,
      ocorrencias,
    };
  }

  async enviarResumo(para: string) {
    const resumo = await this.montarResumo();
    const { assunto, html } = montarEmail(resumo, process.env.FRONTEND_URL ?? 'http://localhost:5173');
    await this.mail.enviar(para, assunto, html);
  }
}
