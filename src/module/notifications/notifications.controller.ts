import { Controller, Post, Body, UseGuards, Get, Param, Patch, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Notification } from '../../entities/notification.entity';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({ summary: 'Send a notification' })
  @ApiResponse({ status: 201, description: 'The notification has been successfully sent.', type: Notification })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({ type: CreateNotificationDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  createNotification(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.createNotification(createNotificationDto);
  }

  @ApiOperation({ summary: 'Get notifications for the current user' })
  @ApiResponse({ status: 200, description: 'The list of notifications for the current user.', type: [Notification] })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getCurrentUserNotifications(@Req() req: any) {
    const userId = req.user.id;
    return this.notificationsService.getNotifications(userId);
  }

  @ApiOperation({ summary: 'Get all notifications for the current user' })
  @ApiResponse({ status: 200, description: 'The list of all notifications for the current user.', type: [Notification] })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseGuards(JwtAuthGuard)
  @Get()
  getAllNotifications(@Req() req: any) {
    const userId = req.user.id;
    return this.notificationsService.getAllNotifications(userId);
  }

  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, description: 'The notification has been marked as read.', type: Notification })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({ name: 'id', type: 'string', description: 'The ID of the notification to mark as read' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.notificationsService.markAsRead(id, userId);
  }

  @ApiOperation({ summary: 'Get notification read status' })
  @ApiResponse({ status: 200, description: 'The read status of notifications.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('read-status')
  getNotificationReadStatus() {
    return this.notificationsService.getNotificationReadStatus();
  }

  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications have been marked as read.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseGuards(JwtAuthGuard)
  @Post('mark-all-read')
  markAllAsRead(@Req() req: any) {
    const userId = req.user.id;
    return this.notificationsService.markAllAsRead(userId);
  }
}
