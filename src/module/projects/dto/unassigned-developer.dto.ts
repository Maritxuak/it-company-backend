import {ApiProperty} from "@nestjs/swagger";
export class UnassignedDeveloperDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  role: string;
}
