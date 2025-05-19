import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Vacancy } from './vacancy.entity';
import { User } from './user.entity';

@Entity()
export class Candidate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  address: string;

  @Column()
  birthDate: Date;

  @Column()
  resume: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ default: 'awaiting_first_stage' })
  status: string;

  @ManyToOne(() => Vacancy, (vacancy) => vacancy.candidates)
  vacancy: Vacancy;

  @ManyToOne(() => User, (user) => user.addedCandidates)
  addedBy: User;
}
