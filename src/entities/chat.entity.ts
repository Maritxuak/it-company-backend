import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Message } from './message.entity';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: string; // 'private' or 'group'

  @ManyToMany(() => User, (user) => user.chats)
  @JoinTable()
  participants: User[];

  @ManyToOne(() => User, (user) => user.adminChats)
  admin: User;

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];
}
