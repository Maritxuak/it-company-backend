import { ApiProperty } from '@nestjs/swagger';

export class CreateVacancyDto {
  @ApiProperty({ example: 50000, description: 'The minimum salary for the vacancy' })
  salaryMin: number;

  @ApiProperty({ example: 70000, description: 'The maximum salary for the vacancy' })
  salaryMax: number;

  @ApiProperty({ example: 3, description: 'The number of required employees for the vacancy' })
  requiredEmployees: number;

  @ApiProperty({ example: 'Frontend Developer', description: 'The type of employee required for the vacancy' })
  employeeType: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'The ID of the HR assigned to the vacancy' })
  hrId: string;

  @ApiProperty({ example: 'Software Engineer', description: 'The title of the vacancy' })
  title: string = 'Software Engineer';

  @ApiProperty({ example: 'development', description: 'The role of the vacancy' })
  role: string = 'development';

  @ApiProperty({ example: false, description: 'Whether the vacancy is closed' })
  isClosed: boolean = false;
}
