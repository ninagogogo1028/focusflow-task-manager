
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: number;
  dueDate: string; // ISO string
  reminderTime?: string; // HH:mm format
  nextSteps?: string[];
  source?: 'manual' | 'auto';
  category?: 'work' | 'personal';
  isArchived: boolean;
  archivedAt?: number;
  isPermanent?: boolean;
}

export interface AppState {
  tasks: Task[];
  notifications: string[];
}
