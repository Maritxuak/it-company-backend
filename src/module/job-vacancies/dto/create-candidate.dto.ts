import { ApiProperty } from '@nestjs/swagger';

export class CreateCandidateDto {
  @ApiProperty({ example: 'John Doe', description: 'The full name of the candidate' })
  fullName: string;

  @ApiProperty({ example: '123 Main St, Anytown, USA', description: 'The address of the candidate' })
  address: string;

  @ApiProperty({ example: '1990-01-01', description: 'The date of birth of the candidate' })
  dateOfBirth: string;

  @ApiProperty({ example: 'Resume content here', description: 'The resume of the candidate' })
  resume: string;

  @ApiProperty({ example: 'Some notes about the candidate', description: 'Notes about the candidate' })
  notes: string;
}
