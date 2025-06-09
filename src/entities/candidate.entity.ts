import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Vacancy } from './vacancy.entity';
import { User } from './user.entity';

@Entity()
export class Candidate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ default: 'new' })
  status: string;

  @ManyToOne(() => Vacancy, (vacancy) => vacancy.candidates)
  vacancy: Vacancy;

  @ManyToOne(() => User, (user) => user.addedCandidates)
  addedBy: User;
}
