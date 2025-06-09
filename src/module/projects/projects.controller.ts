import { Controller, Post, Body, UseGuards, Get, Param, Req, Optional, Put, NotFoundException, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { StartTaskExecutionDto } from './dto/start-task-execution.dto';
import { PauseTaskExecutionDto } from './dto/pause-task-execution.dto';
import { CloseTaskExecutionDto } from './dto/close-task-execution.dto';
import { UnassignedDeveloperDto } from './dto/unassigned-developer.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Project } from '../../entities/project.entity';
import { Task } from '../../entities/task.entity';
import { Comment } from '../../entities/comment.entity';
import { TaskResponse } from './interfaces/task-response.interface';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'The project has been successfully created.', type: Project })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({ type: CreateProjectDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  createProject(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.createProject(createProjectDto);
  }

  @ApiOperation({ summary: 'Get all projects for the current user' })
  @ApiResponse({ status: 200, description: 'The list of projects for the current user.', type: [Project] })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getCurrentUserProjects(@Req() req) {
    return this.projectsService.getCurrentUserProjects(req);
  }

  @ApiOperation({ summary: 'Get all tasks for the current user' })
  @ApiResponse({ status: 200, description: 'The list of tasks for the current user with total execution time.', type: [TaskResponseDto] })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseGuards(JwtAuthGuard)
  @Get('me/tasks')
  async getCurrentUserTasks(@Req() req) {
    try {
      const tasks = await this.projectsService.getCurrentUserTasks(req);
      return tasks.map(task => new TaskResponseDto(task));
    } catch (error) {
      console.error('Error fetching current user tasks:', error);
      throw new Error('Failed to fetch current user tasks');
    }
  }

  @ApiOperation({ summary: 'Create a new task for a project or without a project' })
  @ApiResponse({ status: 201, description: 'The task has been successfully created.', type: Task })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({ type: CreateTaskDto })
  @ApiParam({ name: 'projectId', type: 'number', description: 'The ID of the project (optional)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('project_manager', 'admin')
  @Post(':projectId/tasks')
  createTask(@Param('projectId') projectId: number, @Body() createTaskDto: CreateTaskDto) {
    return this.projectsService.createTask(projectId, createTaskDto);
  }

  @ApiOperation({ summary: 'Create a new task without a project' })
  @ApiResponse({ status: 201, description: 'The task has been successfully created.', type: Task })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({ type: CreateTaskDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('project_manager', 'admin')
  @Post('tasks')
  createTaskWithoutProject(@Body() createTaskDto: CreateTaskDto) {
    return this.projectsService.createTask(null, createTaskDto);
  }

  @ApiOperation({ summary: 'Add a comment to a task' })
  @ApiResponse({ status: 201, description: 'The comment has been successfully added.', type: Comment })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({ type: CreateCommentDto })
  @ApiParam({ name: 'taskId', type: 'number', description: 'The ID of the task' })
  @UseGuards(JwtAuthGuard)
  @Post('tasks/:taskId/comments')
  addComment(@Param('taskId') taskId: number, @Body() createCommentDto: CreateCommentDto) {
    return this.projectsService.addComment(taskId, createCommentDto);
  }

  @ApiOperation({ summary: 'Get all tasks for a project' })
  @ApiResponse({ status: 200, description: 'The list of tasks for the project with total execution time.', type: [TaskResponseDto] })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({ name: 'projectId', type: 'number', description: 'The ID of the project' })
  @UseGuards(JwtAuthGuard)
  @Get(':projectId/tasks')
  async getProjectTasks(@Param('projectId') projectId: number) {
    try {
      const tasks = await this.projectsService.getProjectTasks(projectId);
      return tasks.map(task => new TaskResponseDto(task));
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      throw new Error('Failed to fetch project tasks');
    }
  }

  @ApiOperation({ summary: 'Get all comments for a task' })
  @ApiResponse({ status: 200, description: 'The list of comments for the task and the task details.', type: Object })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({ name: 'taskId', type: 'number', description: 'The ID of the task' })
  @UseGuards(JwtAuthGuard)
  @Get('tasks/:taskId/comments')
  async getTaskComments(@Param('taskId') taskId: number) {
    try {
      const { comments, task } = await this.projectsService.getTaskComments(taskId);
      const taskResponse = new TaskResponseDto({
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
      });
      return { comments, task: taskResponse, totalExecutionTime: task.getTotalExecutionTime() };
    } catch (error) {
      console.error('Error fetching task comments:', error);
      throw new Error('Failed to fetch task comments');
    }
  }

  @ApiOperation({ summary: 'Get all developers with role "development"' })
  @ApiResponse({ status: 200, description: 'The list of all developers with role "development".', type: [UnassignedDeveloperDto] })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseGuards(JwtAuthGuard)
  @Get('developers')
  async getAllDevelopers() {
    try {
      const developers = await this.projectsService.getAllDevelopers();
      return developers;
    } catch (error) {
      console.error('Error fetching developers:', error);
      throw new Error('Failed to fetch developers');
    }
  }

  @ApiOperation({ summary: 'Get all projects' })
  @ApiResponse({ status: 200, description: 'The list of all projects.', type: [Project] })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseGuards(JwtAuthGuard)
  @Get()
  getAllProjects() {
    return this.projectsService.getAllProjects();
  }

  @ApiOperation({ summary: 'Get detailed information about a specific project' })
  @ApiResponse({ status: 200, description: 'Detailed information about the project.', type: Project })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  @ApiParam({ name: 'id', type: 'number', description: 'The ID of the project' })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getProjectById(@Param('id') id: number) {
    const project = await this.projectsService.findOne(id);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({ status: 200, description: 'The project has been successfully updated.', type: Project })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  @ApiBody({ type: UpdateProjectDto })
  @ApiParam({ name: 'id', type: 'number', description: 'The ID of the project' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('project_manager', 'admin')
  @Put(':id')
  async updateProject(
    @Param('id') id: number,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    const project = await this.projectsService.findOne(id);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    Object.assign(project, updateProjectDto);
    return this.projectsService.save(project);
  }

  @ApiOperation({ summary: 'Start task execution' })
  @ApiResponse({ status: 200, description: 'Task execution started successfully.', type: Task })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  @ApiParam({ name: 'taskId', type: 'number', description: 'The ID of the task' })
  @UseGuards(JwtAuthGuard)
  @Post('tasks/:taskId/start')
  async startTaskExecution(
    @Param('taskId') taskId: number,
  ) {
    const task = await this.projectsService.startTaskExecution(taskId);
    task.getTotalExecutionTime = task.getTotalExecutionTime.bind(task);
    return {
      ...task,
      totalExecutionTime: task.getTotalExecutionTime()
    };
  }

  @ApiOperation({ summary: 'Pause task execution' })
  @ApiResponse({ status: 200, description: 'Task execution paused successfully.', type: Task })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  @ApiParam({ name: 'taskId', type: 'number', description: 'The ID of the task' })
  @UseGuards(JwtAuthGuard)
  @Post('tasks/:taskId/pause')
  async pauseTaskExecution(
    @Param('taskId') taskId: number,
  ) {
    const task = await this.projectsService.pauseTaskExecution(taskId);
    task.getTotalExecutionTime = task.getTotalExecutionTime.bind(task);
    return {
      ...task,
      totalExecutionTime: task.getTotalExecutionTime()
    };
  }

  @ApiOperation({ summary: 'Resume task execution' })
  @ApiResponse({ status: 200, description: 'Task execution resumed successfully.', type: Task })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  @ApiParam({ name: 'taskId', type: 'number', description: 'The ID of the task' })
  @UseGuards(JwtAuthGuard)
  @Post('tasks/:taskId/resume')
  async resumeTaskExecution(
    @Param('taskId') taskId: number,
  ) {
    const task = await this.projectsService.resumeTaskExecution(taskId);
    task.getTotalExecutionTime = task.getTotalExecutionTime.bind(task);
    return {
      ...task,
      totalExecutionTime: task.getTotalExecutionTime()
    };
  }

  @ApiOperation({ summary: 'Close task execution' })
  @ApiResponse({ status: 200, description: 'Task execution closed successfully.', type: Task })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  @ApiParam({ name: 'taskId', type: 'number', description: 'The ID of the task' })
  @UseGuards(JwtAuthGuard)
  @Post('tasks/:taskId/close')
  async closeTaskExecution(
    @Param('taskId') taskId: number,
  ) {
    const task = await this.projectsService.closeTaskExecution(taskId);
    task.getTotalExecutionTime = task.getTotalExecutionTime.bind(task);
    return {
      ...task,
      totalExecutionTime: task.getTotalExecutionTime()
    };
  }
}
