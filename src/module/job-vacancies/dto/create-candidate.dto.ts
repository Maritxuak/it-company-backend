import { ApiProperty } from '@nestjs/swagger';

export class CreateCandidateDto {
  @ApiProperty({ example: 'John Doe', description: 'The full name of the candidate' })
  name: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'The email of the candidate' })
  email: string;

  @ApiProperty({ example: '123-456-7890', description: 'The phone number of the candidate' })
  phone: string;

  @ApiProperty({ example: 'new', description: 'The status of the candidate' })
  status: string;
}
