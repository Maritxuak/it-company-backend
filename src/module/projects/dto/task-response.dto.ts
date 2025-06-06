import { TaskResponse } from '../interfaces/task-response.interface';

export class TaskResponseDto implements TaskResponse {
  constructor(task: TaskResponse) {
    this.id = task.id;
    this.title = task.title;
    this.description = task.description;
    this.dueDate = task.dueDate;
    this.estimatedTime = task.estimatedTime;
    this.status = task.status;
    this.executionStartedAt = task.executionStartedAt;
    this.executionPausedAt = task.executionPausedAt;
    this.executionResumedAt = task.executionResumedAt;
    this.executionClosedAt = task.executionClosedAt;
    this.totalExecutionTime = task.totalExecutionTime;
    this.timerRunning = task.timerRunning;
  }

  id: number;
  title: string;
  description: string;
  dueDate: Date;
  estimatedTime: string;
  status: string;
  executionStartedAt: Date | null;
  executionPausedAt: Date | null;
  executionResumedAt: Date | null;
  executionClosedAt: Date | null;
  totalExecutionTime: string;
  timerRunning: boolean;
}
