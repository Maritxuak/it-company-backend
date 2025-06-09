import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notification } from '../../entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UserProfileService } from '../../module/user-profile/user-profile.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    private userService: UserProfileService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationsRepository.create(createNotificationDto);
    const savedNotification = await this.notificationsRepository.save(notification);

    try {
      if (createNotificationDto.recipientIds && createNotificationDto.recipientIds.length > 0) {
        const recipients = await Promise.all(
          createNotificationDto.recipientIds.map(id => this.userService.getUserProfile(id))
        );

        const validRecipients = recipients.filter(recipient => recipient !== null);

        if (validRecipients.length > 0) {
          savedNotification.recipients = validRecipients;
          await this.notificationsRepository.save(savedNotification);
          console.log(savedNotification)
          this.notificationsGateway.server.emit('notification', savedNotification);
        }
      }
    } catch (error) {
      console.error('Error getting user profiles:', error);
    }

    return savedNotification;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({ where: { recipients: { id: In([userId]) }, isRead: false } });
  }

  async getAllNotifications(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({ where: { recipients: { id: In([userId]) } } });
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
