import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { CommonModule } from './common/common.module.js';
import { OccurrencesModule } from './occurrences/occurrences.module.js';
import { WeatherModule } from './weather/weather.module.js';
import { LeisureIndexModule } from './leisure-index/leisure-index.module.js';
import { ProfileModule } from './profile/profile.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { ChatbotModule } from './chatbot/chatbot.module.js';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ScheduleModule.forRoot(),

    ChatbotModule,
    ProfileModule,
    NotificationsModule,
    CommonModule,
    OccurrencesModule,
    WeatherModule,
    LeisureIndexModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
