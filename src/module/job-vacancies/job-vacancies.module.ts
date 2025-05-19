import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobVacanciesService } from './job-vacancies.service';
import { JobVacanciesController } from './job-vacancies.controller';
import { Vacancy } from '../../entities/vacancy.entity';
import { Candidate } from '../../entities/candidate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vacancy, Candidate])],
  controllers: [JobVacanciesController],
  providers: [JobVacanciesService],
})
export class JobVacanciesModule {}
