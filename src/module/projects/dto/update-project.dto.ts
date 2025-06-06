import { ProjectCategory } from '../../../enum/project-category.enum';

export class UpdateProjectDto {
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  teamMembers?: string[]; // Array of user IDs
  category?: ProjectCategory;
}
