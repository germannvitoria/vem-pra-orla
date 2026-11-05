import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma.service.js';
import { LeisureIndexService } from '../leisure-index/leisure-index.service.js';
import { MailService } from './mail.service.js';
import { montarEmail } from './email-template.js';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

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

  private urlApp() {
    return process.env.FRONTEND_URL ?? 'http://localhost:5173';
  }

  // Envio manual para um único endereço (botão "Enviar o resumo agora").
  async enviarResumo(para: string) {
    const resumo = await this.montarResumo();
    const { assunto, html } = montarEmail(resumo, this.urlApp());
    await this.mail.enviar(para, assunto, html);
  }

  // Envio automático: todo dia às 8h (horário de Porto Alegre), para quem ativou a notificação.
  // Só roda enquanto o backend estiver ligado.
  @Cron('0 6 * * *', { timeZone: 'America/Sao_Paulo' })
  async enviarResumosDiarios() {
    const perfis: { email: string | null }[] = await this.prisma.profile.findMany({
      where: { notificacoesAtivas: true, email: { not: null } },
      select: { email: true },
    });
    if (perfis.length === 0) {
      this.logger.log('Resumo diário: ninguém com a notificação ativa.');
      return { enviados: 0, falhas: 0 };
    }

    // O resumo é o mesmo para todos, então é montado uma única vez.
    const resumo = await this.montarResumo();
    const { assunto, html } = montarEmail(resumo, this.urlApp());

    let enviados = 0;
    let falhas = 0;
    for (const perfil of perfis) {
      if (!perfil.email) continue;
      try {
        await this.mail.enviar(perfil.email, assunto, html);
        enviados++;
      } catch (erro) {
        falhas++;
        // Um e-mail com problema não impede os demais. O endereço não vai para o log.
        this.logger.error('Falha ao enviar um resumo diário', erro as Error);
      }
    }
    this.logger.log(`Resumo diário: ${enviados} enviado(s), ${falhas} falha(s).`);
    return { enviados, falhas };
  }
}