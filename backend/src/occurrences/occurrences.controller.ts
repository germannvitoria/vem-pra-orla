import { Body, Controller, Get, Post, Req, UseGuards, Patch, Delete, Param, ParseUUIDPipe } from '@nestjs/common';
import { OccurrencesService } from './occurrences.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { CreateOccurrenceDto } from './dto/create-occurrence.dto.js';
import { UpdateOccurrenceDto } from './dto/update-occurrence.dto.js';

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
  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: any,
    @Body() dto: UpdateOccurrenceDto,
  ) {
    return this.occurrencesService.update(id, request.user.id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() request: any) {
    return this.occurrencesService.remove(id, request.user.id);
  }
}