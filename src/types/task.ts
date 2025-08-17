export type ColumnStatus = 'todo' | 'in_progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';

export interface Assignee {
  id: string;
  name: string;
  avatar?: string;
}

export interface Attachment {
  name: string;
  type: string;
  size: number;
  base64: string; // stored locally; could be uploaded to cloud in future
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string; // ISO
  assignee?: Assignee;
  attachment?: Attachment | null;
  status: ColumnStatus;
  createdAt: string;
}
