import {ApiProperty} from "@nestjs/swagger";
import { ProjectCategory } from '../../../enum/project-category.enum';

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

  @ApiProperty({ enum: ProjectCategory })
  category: ProjectCategory;
}
