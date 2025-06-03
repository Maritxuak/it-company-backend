import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway({
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
     credentials: true,
  },
  transports: ["websocket", "polling"] 
})
export class ChatsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatsService: ChatsService) {}

  @SubscribeMessage('createChat')
  async handleCreateChat(@MessageBody() createChatDto: CreateChatDto) {
    const chat = await this.chatsService.createChat(createChatDto);
    this.server.emit('chatCreated', chat);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(@MessageBody() createMessageDto: CreateMessageDto) {
    const message = await this.chatsService.sendMessage(createMessageDto);
    this.server.emit('messageSent', message);
  }

  @SubscribeMessage('removeUserFromGroup')
  async handleRemoveUserFromGroup(@MessageBody() data: { chatId: number, userId: string }) {
    await this.chatsService.removeUserFromGroup(data.chatId, data.userId);
    this.server.emit('userRemovedFromGroup', data);
  }

  @SubscribeMessage('blockUser')
  async handleBlockUser(@MessageBody() data: { userId: string, blockedUserId: string }) {
    await this.chatsService.blockUser(data.userId, data.blockedUserId);
    this.server.emit('userBlocked', data);
  }
}
