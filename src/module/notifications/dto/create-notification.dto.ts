import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ example: 'New message from admin', description: 'The message of the notification' })
  message: string;

  @ApiProperty({ example: 'info', description: 'The type of the notification' })
  type: string;

  @ApiProperty({ example: ['123e4567-e89b-12d3-a456-426614174000'], description: 'The IDs of the recipients' })
  recipientIds: string[];

  @ApiProperty({ example: false, description: 'Whether the notification is public or not' })
  isPublic: boolean;
}
