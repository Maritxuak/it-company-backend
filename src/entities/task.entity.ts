import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Project } from './project.entity';
import { Comment } from './comment.entity';

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

  @ManyToOne(() => User, (user) => user.assignedTasks)
  assignedTo: User;

  @ManyToOne(() => User, (user) => user.createdTasks)
  creator: User;

  @ManyToOne(() => Project, (project) => project.tasks)
  project: Project;

  @OneToMany(() => Comment, (comment) => comment.task)
  comments: Comment[];
}
