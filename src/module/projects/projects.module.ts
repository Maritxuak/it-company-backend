import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from '../../entities/project.entity';
import { Task } from '../../entities/task.entity';
import { Comment } from '../../entities/comment.entity';
import { Notification } from '../../entities/notification.entity';
import { UserProfileModule } from '../../module/user-profile/user-profile.module';
import { NotificationsModule } from '../../module/notifications/notifications.module';
import { NotificationsService } from '../../module/notifications/notifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Task, Comment, Notification]), UserProfileModule, NotificationsModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, NotificationsService],
})
export class ProjectsModule {}
