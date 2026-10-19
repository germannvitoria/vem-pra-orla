import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { CommonModule } from './common/common.module.js';
import { OccurrencesModule } from './occurrences/occurrences.module.js';
import { WeatherModule } from './weather/weather.module.js';
import { LeisureIndexModule } from './leisure-index/leisure-index.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    CommonModule,
    OccurrencesModule,
    WeatherModule,
    LeisureIndexModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
