import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UnassignedDeveloperDto } from './dto/unassigned-developer.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Project } from '../../entities/project.entity';
import { Task } from '../../entities/task.entity';
import { Comment } from '../../entities/comment.entity';

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

  @ApiOperation({ summary: 'Create a new task for a project' })
  @ApiResponse({ status: 201, description: 'The task has been successfully created.', type: Task })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({ type: CreateTaskDto })
  @ApiParam({ name: 'projectId', type: 'number', description: 'The ID of the project' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('project_manager')
  @Post(':projectId/tasks')
  createTask(@Param('projectId') projectId: number, @Body() createTaskDto: CreateTaskDto) {
    return this.projectsService.createTask(projectId, createTaskDto);
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
  @ApiResponse({ status: 200, description: 'The list of tasks for the project.', type: [Task] })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({ name: 'projectId', type: 'number', description: 'The ID of the project' })
  @UseGuards(JwtAuthGuard)
  @Get(':projectId/tasks')
  getProjectTasks(@Param('projectId') projectId: number) {
    return this.projectsService.getProjectTasks(projectId);
  }

  @ApiOperation({ summary: 'Get all comments for a task' })
  @ApiResponse({ status: 200, description: 'The list of comments for the task.', type: [Comment] })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({ name: 'taskId', type: 'number', description: 'The ID of the task' })
  @UseGuards(JwtAuthGuard)
  @Get('tasks/:taskId/comments')
  getTaskComments(@Param('taskId') taskId: number) {
    return this.projectsService.getTaskComments(taskId);
  }

  @ApiOperation({ summary: 'Get all developers with role "development" not assigned to any project' })
  @ApiResponse({ status: 200, description: 'The list of unassigned developers with role "development".', type: [UnassignedDeveloperDto] })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseGuards(JwtAuthGuard)
  @Get('unassigned-developers')
  getUnassignedDevelopers() {
    return this.projectsService.getUnassignedDevelopers();
  }
}
