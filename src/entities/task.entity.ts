import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Project } from './project.entity';
import { Comment } from './comment.entity';

export enum TaskStatus {
  PENDING = 'pending',       // В ожидании
  IN_PROGRESS = 'in_progress', // В разработке
  IN_REVIEW = 'in_review',    // На проверке
  CLOSED = 'closed',         // Закрыто
  BLOCKED = 'blocked'        // Заблокировано
}

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: Text;

  @Column()
  dueDate: Date;

  @Column()
  estimatedTime: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING
  })
  status: TaskStatus;

  @ManyToOne(() => User, (user) => user.assignedTasks)
  assignedTo: User;

  @ManyToOne(() => User, (user) => user.createdTasks)
  creator: User;

  @ManyToOne(() => Project, (project) => project.tasks)
  project: Project;

  @OneToMany(() => Comment, (comment) => comment.task)
  comments: Comment[];
}