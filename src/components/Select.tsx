import { SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={clsx(
        'w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500',
        props.className,
      )}
      {...props}
    />
  );
}
