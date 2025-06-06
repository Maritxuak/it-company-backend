export interface TaskResponse {
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
