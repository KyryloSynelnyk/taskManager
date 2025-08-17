import { DndContext, DragEndEvent, DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { memo, useMemo, useState } from 'react';
import type { ColumnStatus, Task } from '../../types/task';
import { useTasks } from '../../store/TaskContext';

const COLUMNS: { id: ColumnStatus; title: string }[] = [
  { id: 'todo', title: 'Todo' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

export function KanbanBoard({ tasks }: { tasks: Task[] }) {
  const { moveTask, removeTask } = useTasks();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const columns = useMemo(() => {
    return COLUMNS.map((c) => ({
      ...c,
      items: tasks.filter((t) => t.status === c.id),
    }));
  }, [tasks]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor),
  );

  const onDragStart = (event: DragStartEvent) => {
    const taskId = (event.active.data.current as { taskId?: string } | undefined)?.taskId;
    if (!taskId) return;
    const t = tasks.find((x) => x.id === taskId) || null;
    setActiveTask(t);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeTaskId = (active.data.current as { taskId?: string } | undefined)?.taskId;
    if (!activeTaskId) return;

    const overData = over.data.current as
      | { type: 'task'; column: ColumnStatus }
      | { type: 'slot'; column: ColumnStatus; index: number }
      | undefined;
    if (!overData) return;

    let destColumn = overData.column;
    let destIndex: number | undefined = undefined;

    if (overData.type === 'slot') {
      destIndex = overData.index;
    } else if (overData.type === 'task') {
      // find index of the target task within its column
      const colItems = columns.find((c) => c.id === overData.column)?.items ?? [];
      destIndex = colItems.findIndex((t) => t.id === over.id);
      if (destIndex < 0) destIndex = undefined;
    }

    moveTask(activeTaskId, destColumn, destIndex);
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        {columns.map((col) => (
          <Column key={col.id} id={col.id} title={col.title} items={col.items} />
        ))}
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} dragging onDelete={() => {}} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function Column({ id, title, items }: { id: ColumnStatus; title: string; items: Task[] }) {
  return (
    <div className="rounded-lg bg-gray-100 p-3">
      <h3 className="mb-3 font-medium">{title}</h3>
      {/* Use stable ids to avoid remounting/jitter */}
      <SortableContext items={items.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {items.map((task, index) => (
            <SortableTask key={task.id} task={task} column={id} index={index} />
          ))}
          {/* droppable area for new last position */}
          <DropSlot column={id} index={items.length} />
        </div>
      </SortableContext>
    </div>
  );
}

function SortableTask({ task, column, index }: { task: Task; column: ColumnStatus; index: number }) {
  const { removeTask } = useTasks();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task' as const, taskId: task.id, column },
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} dragging={isDragging} onDelete={() => removeTask(task.id)} />
    </div>
  );
}

function DropSlot({ column, index }: { column: ColumnStatus; index: number }) {
  const { setNodeRef } = useSortable({ id: `slot:${column}:${index}`, data: { type: 'slot' as const, column, index } });
  return <div ref={setNodeRef} className="h-2" />;
}

const TaskCard = memo(function TaskCard({
  task,
  dragging,
  onDelete,
}: {
  task: Task;
  dragging?: boolean;
  onDelete: () => void;
}) {
  return (
    <div
      className="relative rounded-md border border-gray-200 bg-white p-3 shadow-sm"
      style={{ opacity: dragging ? 0.6 : 1, cursor: 'grab' }}
    >
      {/* Delete button (cross). Stop events so it doesn't start a drag. */}
      <button
        aria-label="Delete task"
        className="absolute right-2 top-2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        ×
      </button>
      <div className="mb-1 text-sm font-medium">{task.title}</div>
      {task.description && (
        <div className="mb-2 line-clamp-2 text-xs text-gray-600">{task.description}</div>
      )}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span
          className={
            'rounded px-2 py-0.5 capitalize ' +
            (task.priority === 'low'
              ? 'bg-green-100 text-green-700'
              : task.priority === 'medium'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-700')
          }
        >
          {task.priority}
        </span>
        {task.assignee && <span className="truncate">{task.assignee.name}</span>}
      </div>
    </div>
  );
});
