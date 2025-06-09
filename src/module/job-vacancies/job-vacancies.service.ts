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
    const vacancy = this.vacanciesRepository.create({
      ...createVacancyDto,
      isClosed: false
    });
    return this.vacanciesRepository.save(vacancy);
  }

  async getVacancies(): Promise<Vacancy[]> {
    return this.vacanciesRepository.find({ where: { isClosed: false } });
  }

  async getVacancy(id: number): Promise<Vacancy> {
    const vacancy = await this.vacanciesRepository.findOne({
      where: { id },
      relations: ['candidates']
    });
    if (!vacancy) {
      throw new NotFoundException('Vacancy not found');
    }
    return vacancy;
  }

  async addCandidate(vacancyId: number, createCandidateDto: CreateCandidateDto): Promise<Candidate> {
    const vacancy = await this.getVacancy(vacancyId);
    const candidate = this.candidatesRepository.create({
      name: createCandidateDto.name,
      email: createCandidateDto.email,
      phone: createCandidateDto.phone,
      status: createCandidateDto.status,
      vacancy
    });

    const savedCandidate = await this.candidatesRepository.save(candidate);

    // Check if the number of hired candidates equals the required number
    const hiredCandidates = await this.candidatesRepository.count({
      where: { vacancy: { id: vacancyId }, status: 'hired' }
    });

    if (hiredCandidates >= vacancy.requiredEmployees) {
      // Close the vacancy
      vacancy.isClosed = true;
      await this.vacanciesRepository.save(vacancy);
    }

    return savedCandidate;
  }

  async updateCandidateStatus(candidateId: number, status: string): Promise<Candidate> {
    const candidate = await this.candidatesRepository.findOne({ where: { id: candidateId } });
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }
    candidate.status = status;
    const savedCandidate = await this.candidatesRepository.save(candidate);

    // If the candidate was hired, check if the vacancy should be closed
    if (status === 'hired' && candidate.vacancy) {
      const hiredCandidates = await this.candidatesRepository.count({
        where: { vacancy: { id: candidate.vacancy.id }, status: 'hired' }
      });

      if (hiredCandidates >= candidate.vacancy.requiredEmployees) {
        // Close the vacancy
        candidate.vacancy.isClosed = true;
        await this.vacanciesRepository.save(candidate.vacancy);
      }
    }

    return savedCandidate;
  }

  async updateCandidate(candidateId: number, updateCandidateDto: any): Promise<Candidate> {
    const candidate = await this.candidatesRepository.findOne({ where: { id: candidateId } });
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    if (updateCandidateDto.name !== undefined) {
      candidate.name = updateCandidateDto.name;
    }

    if (updateCandidateDto.email !== undefined) {
      candidate.email = updateCandidateDto.email;
    }

    if (updateCandidateDto.phone !== undefined) {
      candidate.phone = updateCandidateDto.phone;
    }

    if (updateCandidateDto.status !== undefined) {
      candidate.status = updateCandidateDto.status;
    }

    const savedCandidate = await this.candidatesRepository.save(candidate);

    // If the candidate was hired, check if the vacancy should be closed
    if (updateCandidateDto.status === 'hired' && candidate.vacancy) {
      const hiredCandidates = await this.candidatesRepository.count({
        where: { vacancy: { id: candidate.vacancy.id }, status: 'hired' }
      });

      if (hiredCandidates >= candidate.vacancy.requiredEmployees) {
        // Close the vacancy
        candidate.vacancy.isClosed = true;
        await this.vacanciesRepository.save(candidate.vacancy);
      }
    }

    return savedCandidate;
  }
}
