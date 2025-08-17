import { KanbanBoard } from './modules/kanban/KanbanBoard';
import { useTasks } from './store/TaskContext';
import { CreateTaskModal } from './modules/task/CreateTaskModal';
import { useState } from 'react';
import { Button } from './components/Button';

export default function App() {
  const { tasks } = useTasks();
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-7xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Task Manager</h1>
        <Button onClick={() => setOpen(true)}>Create Task</Button>
      </header>
      <KanbanBoard tasks={tasks} />
      <CreateTaskModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
