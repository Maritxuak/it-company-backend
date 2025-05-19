import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ example: 'John', description: 'The first name of the user' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'The last name of the user' })
  lastName: string;

  @ApiProperty({ example: 'Software Developer', description: 'The about section of the user' })
  about: string;

  @ApiProperty({ example: 'user', description: 'The role of the user', default: 'user' })
  role: string;
}
