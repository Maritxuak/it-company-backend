import { Injectable, NotFoundException, Req, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { Task, TaskStatus } from '../../entities/task.entity';
import { Comment } from '../../entities/comment.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { StartTaskExecutionDto } from './dto/start-task-execution.dto';
import { PauseTaskExecutionDto } from './dto/pause-task-execution.dto';
import { CloseTaskExecutionDto } from './dto/close-task-execution.dto';
import { UserProfileService } from '../../module/user-profile/user-profile.service';
import { UnassignedDeveloperDto } from './dto/unassigned-developer.dto';
import { User } from '../../entities/user.entity';
import { ProjectCategory } from '../../enum/project-category.enum';
import { TaskResponse } from './interfaces/task-response.interface';

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

    async getProjectTasks(projectId: number): Promise<TaskResponse[]> {
        try {
            const tasks = await this.tasksRepository.find({ where: { project: { id: projectId }, status: Not(TaskStatus.CLOSED) } });

            // Update timerRunning state based on task status
            tasks.forEach(task => {
                if (task.status === TaskStatus.IN_PROGRESS) {
                    task.timerRunning = true;
                } else {
                    task.timerRunning = false;
                }
            });

            // Add total execution time to each task
            return tasks.map(task => {
                task.getTotalExecutionTime = task.getTotalExecutionTime.bind(task);
                return {
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    dueDate: task.dueDate,
                    estimatedTime: task.estimatedTime,
                    status: task.status,
                    executionStartedAt: task.executionStartedAt,
                    executionPausedAt: task.executionPausedAt,
                    executionResumedAt: task.executionResumedAt,
                    executionClosedAt: task.executionClosedAt,
                    totalExecutionTime: task.getTotalExecutionTime(),
                    timerRunning: task.timerRunning
                };
            });
        } catch (error) {
            console.error('Error fetching project tasks:', error);
            throw new Error('Failed to fetch project tasks');
        }
    }

    async getCurrentUserTasks(@Req() req): Promise<TaskResponse[]> {
        const userId = req.user.id;
        const user = await this.userService.getUserProfile(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Use the user object directly in the query to ensure proper type handling
        const tasks = await this.tasksRepository.find({ where: { assignedTo: { id: userId }, status: Not(TaskStatus.CLOSED) } });

        // Update timerRunning state based on task status
        tasks.forEach(task => {
            if (task.status === TaskStatus.IN_PROGRESS) {
                task.timerRunning = true;
            } else {
                task.timerRunning = false;
            }
        });

        // Add total execution time to each task
        return tasks.map(task => {
            task.getTotalExecutionTime = task.getTotalExecutionTime.bind(task);
            return {
                id: task.id,
                title: task.title,
                description: task.description,
                dueDate: task.dueDate,
                estimatedTime: task.estimatedTime,
                status: task.status,
                executionStartedAt: task.executionStartedAt,
                executionPausedAt: task.executionPausedAt,
                executionResumedAt: task.executionResumedAt,
                executionClosedAt: task.executionClosedAt,
                totalExecutionTime: task.getTotalExecutionTime(),
                timerRunning: task.timerRunning
            };
        });
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

    async getAllProjects(): Promise<Project[]> {
        return this.projectsRepository.find();
    }

    async findOne(id: number): Promise<Project | null> {
        return this.projectsRepository.findOne({ where: { id } });
    }

    async save(project: Project): Promise<Project> {
        return this.projectsRepository.save(project);
    }

    async startTaskExecution(taskId: number): Promise<Task> {
        const task = await this.tasksRepository.findOne({ where: { id: taskId } });
        if (!task) {
            throw new NotFoundException('Task not found');
        }

        task.status = TaskStatus.IN_PROGRESS;
        task.executionStartedAt = new Date();
        task.executionPausedAt = null;
        task.executionResumedAt = null;
        task.executionClosedAt = null;
        task.timerRunning = true;

        return this.tasksRepository.save(task);
    }

    async pauseTaskExecution(taskId: number): Promise<Task> {
        const task = await this.tasksRepository.findOne({ where: { id: taskId } });
        if (!task) {
            throw new NotFoundException('Task not found');
        }

        if (task.status !== TaskStatus.IN_PROGRESS) {
            throw new BadRequestException('Task is not in progress');
        }

        task.executionPausedAt = new Date();
        task.status = TaskStatus.PENDING;
        task.timerRunning = false;

        return this.tasksRepository.save(task);
    }

    async resumeTaskExecution(taskId: number): Promise<Task> {
        const task = await this.tasksRepository.findOne({ where: { id: taskId } });
        if (!task) {
            throw new NotFoundException('Task not found');
        }

        if (task.status !== TaskStatus.PENDING) {
            throw new BadRequestException('Task is not paused');
        }

        task.executionResumedAt = new Date();
        task.status = TaskStatus.IN_PROGRESS;
        task.timerRunning = true;

        return this.tasksRepository.save(task);
    }

    async closeTaskExecution(taskId: number): Promise<Task> {
        const task = await this.tasksRepository.findOne({ where: { id: taskId } });
        if (!task) {
            throw new NotFoundException('Task not found');
        }

        if (task.status !== TaskStatus.IN_PROGRESS) {
            throw new BadRequestException('Task is not in progress');
        }

        task.executionClosedAt = new Date();
        task.status = TaskStatus.CLOSED;
        task.timerRunning = false;

        return this.tasksRepository.save(task);
    }

    async getTaskComments(taskId: number): Promise<{ comments: Comment[], task: Task }> {
        const task = await this.tasksRepository.findOne({ where: { id: taskId }, relations: ['comments'] });
        if (!task) {
            throw new NotFoundException('Task not found');
        }

        // Update timerRunning state based on task status
        if (task.status === TaskStatus.IN_PROGRESS) {
            task.timerRunning = true;
        } else {
            task.timerRunning = false;
        }

        await this.tasksRepository.save(task);

        return { comments: task.comments, task };
    }
}
