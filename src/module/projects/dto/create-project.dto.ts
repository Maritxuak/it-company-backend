import {ApiProperty} from "@nestjs/swagger";

export class CreateProjectDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty()
  teamMembers: string[];
}
