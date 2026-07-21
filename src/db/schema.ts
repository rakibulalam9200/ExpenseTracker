export interface Expense {
  id: number;
  title: string;
  amount: number;
  date: string; // yyyy-MM-dd
  type: string; // expense_type id stored as string
  sub_type?: string; // expense_sub_type id stored as string (optional)
  description?: string;
}

export interface ExpenseType {
  id: number;
  name_en: string;
  name_bn: string;
}

export interface ExpenseSubType {
  id: number;
  expense_type_id: number;
  name_en: string;
  name_bn: string;
}

export interface Loan {
  id: number;
  type: 'giving' | 'taking';
  name: string;
  amount: number;
  description?: string;
  target_date: string; // yyyy-MM-dd
  status: 'active' | 'pending' | 'complete';
  rating?: number | null;
  transaction_way: 'cash' | 'bank';
  bank_name?: string | null;
}
