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
  description: string;

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

  @Column({ type: 'timestamp', nullable: true })
  executionStartedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  executionPausedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  executionResumedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  executionClosedAt: Date | null;

  @Column({ type: 'boolean', default: false })
  timerRunning: boolean;

  @ManyToOne(() => User, (user) => user.assignedTasks)
  assignedTo: User;

  @ManyToOne(() => User, (user) => user.createdTasks)
  creator: User;

  @ManyToOne(() => Project, (project) => project.tasks, { nullable: true })
  project: Project;

  @OneToMany(() => Comment, (comment) => comment.task)
  comments: Comment[];

  getTotalExecutionTime(): string {
    if (!this.executionStartedAt) {
      return '00:00:00';
    }

    let total = 0;

    if (this.executionPausedAt) {
      total += this.executionPausedAt.getTime() - this.executionStartedAt.getTime();
    } else if (this.executionResumedAt) {
      total += this.executionResumedAt.getTime() - this.executionStartedAt.getTime();
    } else if (this.executionClosedAt) {
      total += this.executionClosedAt.getTime() - this.executionStartedAt.getTime();
    } else {
      if (this.timerRunning) {
        total += new Date().getTime() - this.executionStartedAt.getTime();
      } else {
        total += 0;
      }
    }

    if (this.executionPausedAt && this.executionResumedAt) {
      total += this.executionResumedAt.getTime() - this.executionPausedAt.getTime();
    }

    if (this.executionResumedAt && this.executionClosedAt) {
      total += this.executionClosedAt.getTime() - this.executionResumedAt.getTime();
    }

    const milliseconds = total % 1000;
    total = Math.floor(total / 1000);
    const seconds = total % 60;
    total = Math.floor(total / 60);
    const minutes = total % 60;
    const hours = Math.floor(total / 60);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
  }
}
