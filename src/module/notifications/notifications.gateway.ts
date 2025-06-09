import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { Inject, forwardRef } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@WebSocketGateway()
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  @SubscribeMessage('sendNotification')
  async handleSendNotification(@MessageBody() createNotificationDto: CreateNotificationDto, @ConnectedSocket() client: Socket) {
    const notification = await this.notificationsService.createNotification(createNotificationDto);

    if (createNotificationDto.recipientIds && createNotificationDto.recipientIds.length > 0) {
      createNotificationDto.recipientIds.forEach(recipientId => {
        this.server.to(recipientId).emit('notification', notification);
              console.log(`notification ${notification}`);
      });
    } else {
      this.server.emit('notification', notification);
      console.log(`notification ${notification}`);
    }
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    const userId = client.handshake.auth.userId;
    if (userId) {
      client.join(userId);
      console.log(`Client ${client.id} joined room: ${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }
}
