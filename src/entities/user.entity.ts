import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Profile } from './profile.entity';
import { Vacancy } from './vacancy.entity';
import { Candidate } from './candidate.entity';
import { Notification } from './notification.entity';
import { Chat } from './chat.entity';
import { Project } from './project.entity';
import { Task } from './task.entity';
import { Message } from './message.entity';
import { Comment } from './comment.entity';

export enum UserRole {
  ADMIN = 'admin',
  HR = 'hr',
  PROJECT_MANAGER = 'project_manager',
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  USER = 'user',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  profile: Profile;

  @OneToMany(() => Vacancy, (vacancy) => vacancy.creator)
  createdVacancies: Vacancy[];

  @OneToMany(() => Vacancy, (vacancy) => vacancy.assignedHr)
  assignedVacancies: Vacancy[];

  @OneToMany(() => Candidate, (candidate) => candidate.addedBy)
  addedCandidates: Candidate[];

  @OneToMany(() => Notification, (notification) => notification.sender)
  sentNotifications: Notification[];

  @ManyToMany(() => Notification, (notification) => notification.recipients)
  receivedNotifications: Notification[];

  @ManyToMany(() => Chat, (chat) => chat.participants)
  chats: Chat[];

  @OneToMany(() => Chat, (chat) => chat.admin)
  adminChats: Chat[];

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  @OneToMany(() => Project, (project) => project.projectManager)
  managedProjects: Project[];

  @ManyToMany(() => Project, (project) => project.developers)
  projects: Project[];

  @OneToMany(() => Task, (task) => task.assignedTo)
  assignedTasks: Task[];

  @OneToMany(() => Task, (task) => task.creator)
  createdTasks: Task[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
