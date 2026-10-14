import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { OccurrencesService } from './occurrences.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { CreateOccurrenceDto } from './dto/create-occurrence.dto.js';


@Controller('occurrences')
export class OccurrencesController {
  constructor(private readonly occurrencesService: OccurrencesService) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAll() {
    return this.occurrencesService.findAll();
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Req() request: any, @Body() dto: CreateOccurrenceDto) {
    return this.occurrencesService.create(request.user.id, dto);
  }
}