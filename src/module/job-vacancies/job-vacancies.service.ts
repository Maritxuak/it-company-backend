import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vacancy } from '../../entities/vacancy.entity';
import { Candidate } from '../../entities/candidate.entity';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { CreateCandidateDto } from './dto/create-candidate.dto';

@Injectable()
export class JobVacanciesService {
  constructor(
    @InjectRepository(Vacancy)
    private vacanciesRepository: Repository<Vacancy>,
    @InjectRepository(Candidate)
    private candidatesRepository: Repository<Candidate>,
  ) {}

  async createVacancy(createVacancyDto: CreateVacancyDto): Promise<Vacancy> {
    if (!createVacancyDto.title) {
      throw new Error('Title is required for creating a vacancy');
    }
    const vacancy = this.vacanciesRepository.create(createVacancyDto);
    return this.vacanciesRepository.save(vacancy);
  }

  async getVacancies(): Promise<Vacancy[]> {
    return this.vacanciesRepository.find();
  }

  async getVacancy(id: number): Promise<Vacancy> {
    const vacancy = await this.vacanciesRepository.findOne({ where: { id } });
    if (!vacancy) {
      throw new NotFoundException('Vacancy not found');
    }
    return vacancy;
  }

  async addCandidate(vacancyId: number, createCandidateDto: CreateCandidateDto): Promise<Candidate> {
    const vacancy = await this.getVacancy(vacancyId);
    const candidate = this.candidatesRepository.create({ ...createCandidateDto, vacancy });
    return this.candidatesRepository.save(candidate);
  }

  async updateCandidateStatus(candidateId: number, status: string): Promise<Candidate> {
    const candidate = await this.candidatesRepository.findOne({ where: { id: candidateId } });
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }
    candidate.status = status;
    return this.candidatesRepository.save(candidate);
  }
}
