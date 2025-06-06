import { ApiProperty } from '@nestjs/swagger';

export class StartTaskExecutionDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'The ID of the user starting the task execution' })
  userId: string;
}
