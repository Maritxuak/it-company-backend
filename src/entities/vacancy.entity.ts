import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Candidate } from './candidate.entity';

@Entity()
export class Vacancy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  salaryRangeFrom: number;

  @Column()
  salaryRangeTo: number;

  @Column()
  requiredEmployees: number;

  @Column()
  role: string;

  @Column({ default: false })
  isClosed: boolean;

  @ManyToOne(() => User, (user) => user.createdVacancies)
  creator: User;

  @ManyToOne(() => User, (user) => user.assignedVacancies)
  assignedHr: User;

  @OneToMany(() => Candidate, (candidate) => candidate.vacancy)
  candidates: Candidate[];
}
