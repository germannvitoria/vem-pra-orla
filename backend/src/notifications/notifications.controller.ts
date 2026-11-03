import { BadRequestException, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { ProfileService } from '../profile/profile.service.js';
import { NotificationsService } from './notifications.service.js';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly profileService: ProfileService,
  ) {}

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
