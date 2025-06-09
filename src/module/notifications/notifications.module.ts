import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { Notification } from '../../entities/notification.entity';
import { UserProfileModule } from '../../module/user-profile/user-profile.module';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), forwardRef(() => UserProfileModule)],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
