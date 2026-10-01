import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service.js';
import { AuthGuard } from './auth/auth.guard.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@Req() request: any) {
    return { ok: true, user: request.user };
  }
}