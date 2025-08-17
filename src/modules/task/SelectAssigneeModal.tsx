import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useEffect, useMemo, useState } from 'react';
import { listAssignees } from '../../services/assignees';
import type { Assignee } from '../../types/task';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (user: Assignee) => void;
}

export function SelectAssigneeModal({ open, onClose, onSelect }: Props) {
  const [q, setQ] = useState('');
  const [users, setUsers] = useState<Assignee[]>([]);

  useEffect(() => {
    if (!open) return;
    setUsers(listAssignees());
  }, [open]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return query
      ? users.filter((u) => u.name.toLowerCase().includes(query))
      : users;
  }, [q, users]);

  return (
    <Modal open={open} onClose={onClose} title="Select Assignee" zIndex={60}>
      <div className="space-y-3">
        <Input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="max-h-64 space-y-2 overflow-auto">
          {filtered.map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-2">
              <div className="flex items-center gap-2">
                {u.avatar ? (
                  <img src={u.avatar} alt={u.name} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs">
                    {u.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="text-sm">{u.name}</span>
              </div>
              <Button onClick={() => onSelect(u)}>Select</Button>
            </div>
          ))}
          {filtered.length === 0 && <div className="p-2 text-sm text-gray-500">Nothing found</div>}
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose} className="bg-gray-200 text-gray-800 hover:bg-gray-300">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
