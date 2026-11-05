import { BadRequestException, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../auth/api-key.guard.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { ProfileService } from '../profile/profile.service.js';
import { NotificationsService } from './notifications.service.js';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly profileService: ProfileService,
  ) {}

  // Resumo do dia em JSON, consumido pelo bot de WhatsApp (pasta /chatbot).
  // Protegido por chave de API porque inclui ocorrências, que hoje só usuários logados veem.
  @Get('summary')
  @UseGuards(ApiKeyGuard)
  async resumo() {
    const { indice, classificacao, clima, ocorrencias } =
      await this.notificationsService.montarResumo();
    return {
      indice,
      classificacao,
      clima,
      // Só os campos públicos: nada de id ou userId de quem registrou.
      ocorrencias: ocorrencias.map(({ tipo, local, impacto, criadoEm }) => ({
        tipo,
        local,
        impacto,
        criadoEm,
      })),
      urlApp: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    };
  }

  // Envia o resumo agora, para o e-mail de quem está logado (útil para testar e para a demonstração).
  @Post('test')
  @UseGuards(AuthGuard)
  async teste(@Req() request: any) {
    const perfil = await this.profileService.obter(request.user.id);
    if (!perfil.email) {
      throw new BadRequestException('Seu perfil não tem e-mail cadastrado.');
    }
    await this.notificationsService.enviarResumo(perfil.email);
    return { ok: true, enviadoPara: perfil.email };
  }
}
