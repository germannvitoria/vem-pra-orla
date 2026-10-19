import { Controller, Get } from '@nestjs/common';
import { LeisureIndexService } from './leisure-index.service.js';

@Controller('leisure-index')
export class LeisureIndexController {
  constructor(private readonly leisureIndexService: LeisureIndexService) {}

  @Get()
  calculate() {
    return this.leisureIndexService.calculate();
  }
}