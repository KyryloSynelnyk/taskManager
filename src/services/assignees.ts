import type { Assignee } from '../types/task';

const MOCK_ASSIGNEES: Assignee[] = [
  { id: 'u1', name: 'John Carter' },
  { id: 'u2', name: 'Emily Davis' },
  { id: 'u3', name: 'Michael Johnson' },
  { id: 'u4', name: 'Sofia Martinez' },
  { id: 'u5', name: 'Alex Turner' },
];

export function listAssignees(): Assignee[] {
  // Could be replaced with API call. For now return mock data.
  return MOCK_ASSIGNEES;
}
