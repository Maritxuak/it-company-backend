import { ApiProperty } from '@nestjs/swagger';

export class CreateChatDto {
  @ApiProperty({ example: 'General Chat', description: 'The name of the chat' })
  name: string;

  @ApiProperty({ example: ['123e4567-e89b-12d3-a456-426614174000'], description: 'The IDs of the users in the chat' })
  userIds: string[];

  @ApiProperty({ example: true, description: 'Whether the chat is a group chat' })
  isGroup: boolean;
}
