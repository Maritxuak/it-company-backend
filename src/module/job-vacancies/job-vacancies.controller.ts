import { Controller, Post, Body, UseGuards, Get, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { JobVacanciesService } from './job-vacancies.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Vacancy } from '../../entities/vacancy.entity';
import { Candidate } from '../../entities/candidate.entity';

@ApiTags('job-vacancies')
@Controller('job-vacancies')
export class JobVacanciesController {
  constructor(private readonly jobVacanciesService: JobVacanciesService) {}

  @ApiOperation({ summary: 'Create a new vacancy' })
  @ApiResponse({ status: 201, description: 'The vacancy has been successfully created.', type: Vacancy })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({ type: CreateVacancyDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  createVacancy(@Body() createVacancyDto: CreateVacancyDto) {
    if (!createVacancyDto.title) {
      throw new Error('Title is required for creating a vacancy');
    }
    return this.jobVacanciesService.createVacancy(createVacancyDto);
  }

  @ApiOperation({ summary: 'Get all vacancies' })
  @ApiResponse({ status: 200, description: 'The list of all vacancies.', type: [Vacancy] })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'hr')
  @Get()
  getVacancies() {
    return this.jobVacanciesService.getVacancies();
  }

  @ApiOperation({ summary: 'Get a vacancy by ID' })
  @ApiResponse({ status: 200, description: 'The vacancy details.', type: Vacancy })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({ name: 'id', type: 'number', description: 'The ID of the vacancy' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'hr')
  @Get(':id')
  getVacancy(@Param('id') id: number) {
    return this.jobVacanciesService.getVacancy(id);
  }

  @ApiOperation({ summary: 'Add a candidate to a vacancy' })
  @ApiResponse({ status: 201, description: 'The candidate has been successfully added.', type: Candidate })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({ type: CreateCandidateDto })
  @ApiParam({ name: 'id', type: 'number', description: 'The ID of the vacancy' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'hr')
  @Post(':id/candidates')
  addCandidate(@Param('id') id: number, @Body() createCandidateDto: CreateCandidateDto) {
    return this.jobVacanciesService.addCandidate(id, createCandidateDto);
  }

  @ApiOperation({ summary: 'Update a candidate status' })
  @ApiResponse({ status: 200, description: 'The candidate status has been successfully updated.', type: Candidate })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({ name: 'id', type: 'number', description: 'The ID of the candidate' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
      },
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'hr')
  @Patch('candidates/:id/status')
  updateCandidateStatus(@Param('id') id: number, @Body('status') status: string) {
    return this.jobVacanciesService.updateCandidateStatus(id, status);
  }

  @ApiOperation({ summary: 'Update a candidate details' })
  @ApiResponse({ status: 200, description: 'The candidate details have been successfully updated.', type: Candidate })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({ name: 'id', type: 'number', description: 'The ID of the candidate' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        status: { type: 'string' },
      },
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'hr')
  @Patch('candidates/:id')
  updateCandidate(@Param('id') id: number, @Body() updateCandidateDto: any) {
    return this.jobVacanciesService.updateCandidate(id, updateCandidateDto);
  }
}
