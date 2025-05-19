import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@WebSocketGateway()
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly notificationsService: NotificationsService) {}

  @SubscribeMessage('sendNotification')
  async handleSendNotification(@MessageBody() createNotificationDto: CreateNotificationDto) {
    const notification = await this.notificationsService.createNotification(createNotificationDto);
    this.server.emit('notification', notification);
  }
}
