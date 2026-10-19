import { Controller, Get } from '@nestjs/common';
import { WeatherService } from './weather.service.js';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  getCurrent() {
    return this.weatherService.getCurrent();
  }
}