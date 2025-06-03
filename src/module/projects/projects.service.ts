import { Injectable, NotFoundException, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { Task } from '../../entities/task.entity';
import { Comment } from '../../entities/comment.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UserProfileService } from '../../module/user-profile/user-profile.service';
import { UnassignedDeveloperDto } from './dto/unassigned-developer.dto';
import { User } from '../../entities/user.entity';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private projectsRepository: Repository<Project>,
        @InjectRepository(Task)
        private tasksRepository: Repository<Task>,
        @InjectRepository(Comment)
        private commentsRepository: Repository<Comment>,
        private userService: UserProfileService,
    ) {}

    async createProject(createProjectDto: CreateProjectDto): Promise<Project> {
        const { teamMembers, ...projectData } = createProjectDto;
        const project = this.projectsRepository.create(projectData);

        if (teamMembers?.length > 0) {
            const developers = await this.userService.findByIds(teamMembers);
            project.developers = developers;
        }

        return await this.projectsRepository.save(project);
    }

    async createTask(projectId: number | null, createTaskDto: CreateTaskDto): Promise<Task> {
        let assignedTo: User | null = null;
        if (createTaskDto.developerId) {
            const developer = await this.userService.getUserProfile(createTaskDto.developerId) as User;
            if (!developer) {
                throw new NotFoundException('Developer not found');
            }
            assignedTo = developer;
        }

        const taskData: Partial<Task> = {
            title: createTaskDto.title,
            description: createTaskDto.description,
            dueDate: new Date(createTaskDto.dueDate),
            estimatedTime: createTaskDto.estimatedTime,
            assignedTo: assignedTo ? assignedTo : undefined,
        };

        if (projectId) {
            const project = await this.projectsRepository.findOne({ where: { id: projectId } });
            if (!project) {
                throw new NotFoundException('Project not found');
            }
            taskData.project = project;
        }

        const task = this.tasksRepository.create(taskData);
        return await this.tasksRepository.save(task);
    }

  async addComment(taskId: number, createCommentDto: CreateCommentDto): Promise<Comment> {
    const task = await this.tasksRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    const comment = this.commentsRepository.create({ ...createCommentDto, task });
    return this.commentsRepository.save(comment);
  }

  async getProjectTasks(projectId: number): Promise<Task[]> {
    try {
      return await this.tasksRepository.find({ where: { project: { id: projectId } } });
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      throw new Error('Failed to fetch project tasks');
    }
  }

  async getTaskComments(taskId: number): Promise<Comment[]> {
    try {
      return await this.commentsRepository.find({ where: { task: { id: taskId } } });
    } catch (error) {
      console.error('Error fetching task comments:', error);
      throw new Error('Failed to fetch task comments');
    }
  }

  async getAllDevelopers(): Promise<UnassignedDeveloperDto[]> {
    const allUsers = await this.userService.getAllUsers();

    return allUsers
      .filter(user => user.role === 'development')
      .map(user => ({
        id: user.id,
        role: user.role,
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        assigned: user.projects ? user.projects.length > 0 : false
      } as UnassignedDeveloperDto));
  }

  async getCurrentUserProjects(@Req() req): Promise<Project[]> {
    const userId = req.user.id;
    const user = await this.userService.getUserProfile(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Use the user object directly in the query to ensure proper type handling
    return this.projectsRepository.find({ where: { developers: { id: userId } } });
  }

  async getCurrentUserTasks(@Req() req): Promise<Task[]> {
    const userId = req.user.id;
    const user = await this.userService.getUserProfile(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Use the user object directly in the query to ensure proper type handling
    return this.tasksRepository.find({ where: { assignedTo: { id: userId } } });
  }

  async getAllProjects(): Promise<Project[]> {
    return this.projectsRepository.find();
  }
}
