import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notification } from '../../entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationsRepository.create(createNotificationDto);
    return this.notificationsRepository.save(notification);
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({ where: { recipients: { id: In([userId]) } } });
  }

  async getAllNotifications(): Promise<Notification[]> {
    return this.notificationsRepository.find();
  }

  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({ where: { id: Number(notificationId), recipients: { id: In([userId]) } } });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    notification.isRead = true;
    return this.notificationsRepository.save(notification);
  }

  async getNotificationReadStatus(): Promise<any> {
    const notifications = await this.notificationsRepository.find();
    const readCount = notifications.filter(n => n.isRead).length;
    const unreadCount = notifications.length - readCount;
    return { readCount, unreadCount };
  }

  async markAllAsRead(userId: string): Promise<void> {
    const notifications = await this.notificationsRepository.find({ relations: ['recipients'] });
    for (const notification of notifications) {
      if (notification.recipients.some(r => r.id === userId)) {
        notification.isRead = true;
        await this.notificationsRepository.save(notification);
      }
    }
  }
}
