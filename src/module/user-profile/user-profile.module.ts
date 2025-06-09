import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { User } from '../../entities/user.entity';
import { Project } from '../../entities/project.entity';
import { NotificationsModule } from '../../module/notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Project]), forwardRef(() => NotificationsModule)],
  controllers: [UserProfileController],
  providers: [UserProfileService],
  exports: [UserProfileService],
})
export class UserProfileModule {}
