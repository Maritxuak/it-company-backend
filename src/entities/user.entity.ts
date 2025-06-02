// user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany } from 'typeorm';
import { Profile } from './profile.entity';
import { UserRole } from '../enum/user-role.enum';
import { Candidate } from './candidate.entity';
import { Chat } from './chat.entity';
import { Message } from './message.entity';
import { Comment } from './comment.entity';
import { Notification } from './notification.entity';
import { Project } from './project.entity';
import { Task } from './task.entity';
import { Vacancy } from './vacancy.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ 
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  // Профиль
  @OneToOne(() => Profile, profile => profile.user, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE'
  })
  @JoinColumn()
  profile: Profile;

  // Кандидаты
  @OneToMany(() => Candidate, candidate => candidate.addedBy)
  addedCandidates: Candidate[];

  // Чаты
  @ManyToMany(() => Chat, chat => chat.participants)
  chats: Chat[];

  // Администрируемые чаты
  @OneToMany(() => Chat, chat => chat.admin)
  adminChats: Chat[];

  // Комментарии
  @OneToMany(() => Comment, comment => comment.author)
  comments: Comment[];

  // Сообщения
  @OneToMany(() => Message, message => message.sender)
  messages: Message[];

  // Отправленные уведомления
  @OneToMany(() => Notification, notification => notification.sender)
  sentNotifications: Notification[];

  // Полученные уведомления
  @ManyToMany(() => Notification, notification => notification.recipients)
  receivedNotifications: Notification[];

  // Управляемые проекты
  @OneToMany(() => Project, project => project.projectManager)
  managedProjects: Project[];

  // Проекты, в которых участвует
  @ManyToMany(() => Project, project => project.developers)
  projects: Project[];

  // Назначенные задачи
  @OneToMany(() => Task, task => task.assignedTo)
  assignedTasks: Task[];

  // Созданные задачи
  @OneToMany(() => Task, task => task.creator)
  createdTasks: Task[];

  // Созданные вакансии
  @OneToMany(() => Vacancy, vacancy => vacancy.creator)
  createdVacancies: Vacancy[];

  // Назначенные вакансии (для HR)
  @OneToMany(() => Vacancy, vacancy => vacancy.assignedHr)
  assignedVacancies: Vacancy[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}