import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  about: string;

  @Column({ nullable: true })
  birthDate: Date;

  @Column({ nullable: true })
  education: string;

  @Column({ nullable: true })
  gender: string;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn()
  user: User;
}