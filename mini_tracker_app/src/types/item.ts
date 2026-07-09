export type ItemStatus = 'pending' | 'done';

export type ItemRow = {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  status: ItemStatus;
  created_at: string;
};

export type ItemInput = {
  title: string;
  amount: number;
  status: ItemStatus;
};

