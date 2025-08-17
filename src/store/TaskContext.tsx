import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ColumnStatus, Task } from '../types/task';
import { load, save } from '../utils/storage';

const STORAGE_KEY = 'tm_tasks_v1';

interface TaskContextValue {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  moveTask: (id: string, status: ColumnStatus, index?: number) => void;
  removeTask: (id: string) => void;
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => load<Task[]>(STORAGE_KEY, []));

  useEffect(() => save(STORAGE_KEY, tasks), [tasks]);

  const addTask: TaskContextValue['addTask'] = (task) => {
    setTasks((prev) => [
      ...prev,
      {
        ...task,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const moveTask: TaskContextValue['moveTask'] = (id, status, index) => {
    setTasks((prev) => {
      const next = [...prev];
      const i = next.findIndex((t) => t.id === id);
      if (i === -1) return prev;
      const [item] = next.splice(i, 1);
      item.status = status;

      if (index == null) {
        next.push(item);
      } else {
        const before = next.filter((t) => t.status === status);
        const targetGlobalIndex = (() => {
          if (before.length === 0) return next.length;
          let count = 0;
          for (let g = 0; g < next.length; g++) {
            if (next[g].status === status) {
              if (count === index) return g;
              count++;
            }
          }
          return next.length;
        })();
        next.splice(targetGlobalIndex, 0, item);
      }
      return next;
    });
  };

  const removeTask: TaskContextValue['removeTask'] = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const value = useMemo(() => ({ tasks, addTask, moveTask, removeTask }), [tasks]);

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
}
