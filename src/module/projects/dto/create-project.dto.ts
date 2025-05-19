export class CreateProjectDto {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  teamMembers: string[]; // Array of user IDs
}
