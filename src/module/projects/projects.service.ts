import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { Task } from '../../entities/task.entity';
import { Comment } from '../../entities/comment.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  async createProject(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = this.projectsRepository.create(createProjectDto);
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
}
