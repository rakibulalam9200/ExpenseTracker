export interface Expense {
  id: number;
  title: string;
  amount: number;
  date: string; // yyyy-MM-dd
  type: string; // expense_type id stored as string
  description?: string;
}

export interface ExpenseType {
  id: number;
  name_en: string;
  name_bn: string;
}
