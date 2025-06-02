import { Injectable, NotFoundException } from '@nestjs/common';
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

    // Create the project without developers first
    const project = this.projectsRepository.create(projectData);

    // If teamMembers is provided, fetch the users and associate them with the project
    if (teamMembers && teamMembers.length > 0) {
      const developers = await this.userService.findByIds(teamMembers);
      project.developers = developers;
    }

    return this.projectsRepository.save(project);
  }

  async createTask(projectId: number, createTaskDto: CreateTaskDto): Promise<Task> {
    const project = await this.projectsRepository.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    const task = this.tasksRepository.create({ ...createTaskDto, project });
    return this.tasksRepository.save(task);
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
    return this.tasksRepository.find({ where: { project: { id: projectId } } });
  }

  async getTaskComments(taskId: number): Promise<Comment[]> {
    return this.commentsRepository.find({ where: { task: { id: taskId } } });
  }

  async getUnassignedDevelopers(): Promise<UnassignedDeveloperDto[]> {
    const allUsers = await this.userService.getAllUsers();
    const allProjects = await this.projectsRepository.find({ relations: ['developers'] });

    console.log('All users:', allUsers);
    console.log('All projects:', allProjects);

    const assignedUserIds = new Set(
      allProjects.flatMap(project => project.developers.map(developer => developer.id))
    );

    return allUsers
      .filter(user => user.role === 'development' && !assignedUserIds.has(user.id))
      .map(user => ({
        id: user.id,
        role: user.role,
        firstName: user.profile.firstName,
        lastName: user.profile.lastName
      } as UnassignedDeveloperDto));
  }
}
