import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { WeatherModule } from '../weather/weather.module.js';
import { ChatbotController } from './chatbot.controller.js';
import { ChatbotService } from './chatbot.service.js';

@Module({
  imports: [NotificationsModule, WeatherModule],
  controllers: [ChatbotController],
  providers: [ChatbotService],
})
export class ChatbotModule {}
