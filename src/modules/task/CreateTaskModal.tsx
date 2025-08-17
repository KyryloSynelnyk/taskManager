import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import type { Attachment, ColumnStatus, Priority, Task, Assignee } from '../../types/task';
import { fileToBase64 } from '../../utils/file';
import { useState } from 'react';
import { SelectAssigneeModal } from './SelectAssigneeModal';
import { useTasks } from '../../store/TaskContext';

const schema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string().optional(),
  priority: Yup.mixed<Priority>().oneOf(['low', 'medium', 'high']).required(),
  dueDate: Yup.date().nullable().optional(),
  status: Yup.mixed<ColumnStatus>().oneOf(['todo', 'in_progress', 'done']).required(),
});

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateTaskModal({ open, onClose }: Props) {
  const { addTask } = useTasks();
  const [assignee, setAssignee] = useState<Task['assignee']>();
  const [openAssignee, setOpenAssignee] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);

  /*
   * Nested modal data passing approach:
   * - The parent modal (CreateTaskModal) owns the piece of state for `assignee`.
   * - Clicking "Select assignee" opens the child modal (SelectAssigneeModal).
   * - The child modal calls `onSelect(user)` which sets parent's `assignee` via setAssignee.
   * - This keeps a single source of truth at the parent and avoids form library coupling between modals.
   */

  return (
    <>
      <Modal open={open} onClose={onClose} title="Create Task" zIndex={40}>
        <Formik
          initialValues={{
            title: '',
            description: '',
            priority: 'medium' as Priority,
            dueDate: '',
            status: 'todo' as ColumnStatus,
          }}
          validationSchema={schema}
          onSubmit={(values, { resetForm }) => {
            addTask({
              title: values.title,
              description: values.description,
              priority: values.priority,
              dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
              attachment,
              assignee,
              status: values.status,
            });
            resetForm();
            setAssignee(undefined);
            setAttachment(null);
            onClose();
          }}
        >
          {({ setFieldValue, isSubmitting }) => (
            <Form className="space-y-4">
              <div className="col-span-full">
                <label className="mb-1 block text-sm">Title</label>
                <Field
                  as={Input}
                  name="title"
                  placeholder="e.g., Implement authentication"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
                <ErrorMessage name="title" component="div" className="text-xs text-red-600" />
              </div>
              <div>
                <label className="mb-1 block text-sm">Description</label>
                <Field
                  as="textarea"
                  name="description"
                  className="h-24 w-full rounded-md border border-gray-300 bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm">Priority</label>
                  <Field
                    as={Select}
                    name="priority"
                    className="w-[150px] rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Field>
                </div>
                <div>
                  <label className="mb-1 block text-sm">Deadline</label>
                  <Input type="date" onChange={(e) => setFieldValue('dueDate', e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm">Column</label>
                  <Field
                    as={Select}
                    name="status"
                    className="w-[150px] rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </Field>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <label className="mb-1 block text-sm">File</label>
                <Input
                  type="file"
                  onChange={async (e) => {
                    const file = e.currentTarget.files?.[0];
                    if (!file) {
                      setAttachment(null);
                      return;
                    }
                    const base64 = await fileToBase64(file);
                    setAttachment({ name: file.name, type: file.type, size: file.size, base64 });
                  }}
                />
                {attachment && (
                  <div className="mt-1 text-xs text-gray-600">
                    Attached: {attachment.name} ({Math.round(attachment.size / 1024)} KB)
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-3">
                <label className="mb-1 block text-sm">Assignee</label>
                <div className="flex flex-col gap-2">
                  <Input readOnly value={assignee?.name ?? ''} placeholder="Not selected" />
                  <Button type="button" onClick={() => setOpenAssignee(true)} className="w-max">
                    Select assignee
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 hover:bg-gray-300">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  Create
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Nested modal */}
      <SelectAssigneeModal
        open={openAssignee}
        onClose={() => setOpenAssignee(false)}
        onSelect={(user: Assignee) => {
          setAssignee(user);
          setOpenAssignee(false);
        }}
      />
    </>
  );
}
