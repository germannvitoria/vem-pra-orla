import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module.js';
import { LeisureIndexModule } from '../leisure-index/leisure-index.module.js';
import { ProfileModule } from '../profile/profile.module.js';
import { MailService } from './mail.service.js';
import { NotificationsController } from './notifications.controller.js';
import { NotificationsService } from './notifications.service.js';

@Module({
  imports: [CommonModule, LeisureIndexModule, ProfileModule],
  controllers: [NotificationsController],
  providers: [MailService, NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
