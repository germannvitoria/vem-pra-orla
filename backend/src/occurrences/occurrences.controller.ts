import { Controller, Get, UseGuards } from '@nestjs/common';
import { OccurrencesService } from './occurrences.service.js';
import { AuthGuard } from '../auth/auth.guard.js';

@Controller('occurrences')
export class OccurrencesController {
  constructor(private readonly occurrencesService: OccurrencesService) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAll() {
    return this.occurrencesService.findAll();
  }
}