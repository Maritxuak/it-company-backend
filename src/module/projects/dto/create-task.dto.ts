import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Task Title', description: 'The title of the task' })
  title: string;

  @ApiProperty({ example: 'Task Description', description: 'The description of the task' })
  description: string;

  @ApiProperty({ example: '2023-12-31', description: 'The due date of the task' })
  dueDate: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'The ID of the developer assigned to the task' })
  developerId: string;

  @ApiProperty({ example: '08:00', description: 'The estimated time for the task' })
  estimatedTime: string;
}
