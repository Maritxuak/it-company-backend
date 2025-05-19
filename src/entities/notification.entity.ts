import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message: string;

  @Column()
  type: string;

  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => User, (user) => user.sentNotifications)
  sender: User;

  @ManyToMany(() => User, (user) => user.receivedNotifications)
  @JoinTable()
  recipients: User[];
}
