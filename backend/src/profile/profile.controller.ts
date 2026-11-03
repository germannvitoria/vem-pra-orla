import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { ProfileService } from './profile.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @UseGuards(AuthGuard)
  async obter(@Req() request: any) {
    return this.profileService.obter(request.user.id);
  }

  @Patch()
  @UseGuards(AuthGuard)
  async atualizar(@Req() request: any, @Body() dto: UpdateProfileDto) {
    return this.profileService.atualizar(request.user.id, dto);
  }
}