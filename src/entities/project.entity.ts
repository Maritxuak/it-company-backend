import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';
import { Task } from './task.entity';
import { ProjectCategory } from '../enum/project-category.enum';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ type: 'int', default: ProjectCategory.WEB_PROJECT })
  category: ProjectCategory;

  @ManyToOne(() => User, (user) => user.managedProjects)
  projectManager: User;

  @ManyToMany(() => User, (user) => user.projects)
  @JoinTable()
  developers: User[];

  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];
}
