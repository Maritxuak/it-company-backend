import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'The ID of the chat' })
  chatId: number;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'The ID of the user sending the message' })
  userId: string;

  @ApiProperty({ example: 'Hello, this is a message', description: 'The content of the message' })
  content: string;
}
