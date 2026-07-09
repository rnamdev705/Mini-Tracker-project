import { supabase } from '@/lib/supabaseClient';

import type { ItemInput, ItemRow, ItemStatus } from '@/types/item';

const selectColumns = 'id,user_id,title,amount,status,created_at';

function coerceItemAmount(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return 0;
}

export async function fetchMyItems() {
  const { data, error } = await supabase
    .from('items')
    .select(selectColumns)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    ...(row as Omit<ItemRow, 'amount'>),
    amount: coerceItemAmount((row as any).amount),
  })) as ItemRow[];
}

export async function fetchMyItem(id: string) {
  const { data, error } = await supabase
    .from('items')
    .select(selectColumns)
    .eq('id', id)
    .single();

  if (error) throw error;
  return {
    ...(data as Omit<ItemRow, 'amount'>),
    amount: coerceItemAmount((data as any).amount),
  } as ItemRow;
}

export async function createMyItem(input: ItemInput) {
  const { data, error } = await supabase
    .from('items')
    .insert({
      title: input.title,
      amount: input.amount,
      status: input.status as ItemStatus,
    })
    .select(selectColumns)
    .single();

  if (error) throw error;
  return {
    ...(data as Omit<ItemRow, 'amount'>),
    amount: coerceItemAmount((data as any).amount),
  } as ItemRow;
}

export async function updateMyItem(id: string, input: ItemInput) {
  const { data, error } = await supabase
    .from('items')
    .update({
      title: input.title,
      amount: input.amount,
      status: input.status as ItemStatus,
    })
    .eq('id', id)
    .select(selectColumns)
    .single();

  if (error) throw error;
  return {
    ...(data as Omit<ItemRow, 'amount'>),
    amount: coerceItemAmount((data as any).amount),
  } as ItemRow;
}

export async function deleteMyItem(id: string) {
  const { error } = await supabase.from('items').delete().eq('id', id);
  if (error) throw error;
}

