import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Chat } from '../../entities/chat.entity';
import { Message } from '../../entities/message.entity';
import { User } from '../../entities/user.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private chatsRepository: Repository<Chat>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async createChat(createChatDto: CreateChatDto): Promise<Chat> {
    const chat = this.chatsRepository.create(createChatDto);
    return this.chatsRepository.save(chat);
  }

  async sendMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const chat = await this.chatsRepository.findOne({ where: { id: createMessageDto.chatId } });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    const sender = await this.chatsRepository.manager.findOne(User, { where: { id: createMessageDto.userId } });
    if (!sender) {
      throw new NotFoundException('User not found');
    }
    const message = this.messagesRepository.create({
      ...createMessageDto,
      chat,
      sender
    });
    return this.messagesRepository.save(message);
  }

  async removeUserFromGroup(chatId: number, userId: string): Promise<void> {
    const chat = await this.chatsRepository.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
  }

  async blockUser(userId: string, blockedUserId: string): Promise<void> {
  }

  async getMessagesByChatId(chatId: number): Promise<Message[]> {
    const chat = await this.chatsRepository.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    return await this.messagesRepository.find({ where: { chat: { id: chatId } }, relations: ['sender'] });
  }

  async getChatWithUser(userId: string, otherUserId: string): Promise<{ chat: Chat, messages: Message[] }> {
    let chat = await this.chatsRepository.findOne({
        where: {
            type: 'private',
            participants: {
                id: In([userId, otherUserId])
            }
        },
        relations: ['participants', 'messages', 'messages.sender']
    });

    if (!chat) {
        const newChat = new Chat();
        newChat.name = `Chat between ${userId} and ${otherUserId}`;
        newChat.type = 'private';
        
        const user1 = await this.chatsRepository.manager.findOne(User, { where: { id: userId } });
        const user2 = await this.chatsRepository.manager.findOne(User, { where: { id: otherUserId } });
        
        if (!user1 || !user2) {
            throw new NotFoundException('User not found');
        }
        
        newChat.participants = [user1, user2];
        newChat.messages = [];
        chat = await this.chatsRepository.save(newChat);
    } else {
        const participantIds = chat.participants.map(p => p.id);
        if (!participantIds.includes(userId) || !participantIds.includes(otherUserId)) {
            const newChat = new Chat();
            newChat.name = `Chat between ${userId} and ${otherUserId}`;
            newChat.type = 'private';
            
            const user1 = await this.chatsRepository.manager.findOne(User, { where: { id: userId } });
            const user2 = await this.chatsRepository.manager.findOne(User, { where: { id: otherUserId } });
            
            if (!user1 || !user2) {
                throw new NotFoundException('User not found');
            }
            
            newChat.participants = [user1, user2];
            newChat.messages = [];
            chat = await this.chatsRepository.save(newChat);
        }
    }

    return {
        chat,
        messages: chat.messages || []
    };
}
}
