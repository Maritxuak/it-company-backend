import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from '../../entities/project.entity';
import { Task } from '../../entities/task.entity';
import { Comment } from '../../entities/comment.entity';
import { UserProfileModule } from '../../module/user-profile/user-profile.module';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Task, Comment]), UserProfileModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
