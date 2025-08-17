# Task Manager

Kanban board with nested modals, Formik + Yup, file attachments, and local persistence.

## Tech
- React 18 + TypeScript + Vite
- Tailwind CSS
- Formik + Yup
- @dnd-kit (drag & drop)
- React Context (persistence in localStorage)
- ESLint + Prettier + Stylelint
- Husky + lint-staged

## Scripts
- `npm run dev` – start dev server
- `npm run build` – build
- `npm run preview` – preview build
- `npm run lint` – ESLint
- `npm run stylelint` – Stylelint
- `npm run format` – Prettier

## Setup
```bash
npm install
# optional tooling
git init
npm run prepare
npx husky add .husky/pre-commit "npx lint-staged"

npm run dev
```

Tasks persist in localStorage under key `tm_tasks_v1`.

### Nested modal data passing
The parent modal `CreateTaskModal` owns `assignee` state and opens `SelectAssigneeModal`. The child modal calls `onSelect(user)` to update the parent state. This keeps a single source of truth and avoids cross-modal form coupling.
