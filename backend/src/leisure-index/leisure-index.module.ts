import { Module } from '@nestjs/common';
import { LeisureIndexController } from './leisure-index.controller.js';
import { LeisureIndexService } from './leisure-index.service.js';
import { CommonModule } from '../common/common.module.js';
import { WeatherModule } from '../weather/weather.module.js';

@Module({
  imports: [CommonModule, WeatherModule],
  controllers: [LeisureIndexController],
  providers: [LeisureIndexService],
})
export class LeisureIndexModule {}