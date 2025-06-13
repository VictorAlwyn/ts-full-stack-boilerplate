'use client';

import { trpc } from '@repo/trpc/client';

export default function Home() {
  const { data } = trpc.todo.getAllTodos.useQuery();

  console.log('Data', data);

  return <></>;
}
