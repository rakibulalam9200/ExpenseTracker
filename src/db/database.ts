import { open } from '@op-engineering/op-sqlite';
import { Expense, ExpenseType } from './schema';
import { startOfMonth, endOfMonth, format, parseISO } from 'date-fns';

const db = open({
  name: 'expenses.sqlite',
});

// Default expense types seeded on first run
const DEFAULT_EXPENSE_TYPES: Omit<ExpenseType, 'id'>[] = [
  { name_en: 'Food ', name_bn: 'খাবার' },
  { name_en: 'Transportation', name_bn: 'পরিবহন' },
  { name_en: 'Shopping', name_bn: 'কেনাকাটা' },
  { name_en: 'Dining', name_bn: 'রেস্তোরাঁ' },
  { name_en: 'Housing', name_bn: 'বাসস্থান' },
  { name_en: 'Utilities', name_bn: 'ইউটিলিটি' },
  { name_en: 'Health', name_bn: 'স্বাস্থ্য' },
  { name_en: 'Relative', name_bn: 'আত্মীয়' },
  { name_en: 'Other', name_bn: 'অন্যান্য' },
];

export const seedDefaultTypes = () => {
  const countResult = db.executeSync('SELECT COUNT(*) as count FROM expense_types');
  const count = (countResult.rows as any[])[0]?.count ?? 0;
  if (count === 0) {
    for (const t of DEFAULT_EXPENSE_TYPES) {
      db.executeSync(
        'INSERT INTO expense_types (name_en, name_bn) VALUES (?, ?)',
        [encodeURIComponent(t.name_en), encodeURIComponent(t.name_bn)],
      );
    }
  }
};


export const initDB = () => {
  db.executeSync(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT
    );
  `);

  db.executeSync(`
    CREATE TABLE IF NOT EXISTS expense_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_en TEXT NOT NULL,
      name_bn TEXT NOT NULL
    );
  `);

  // Seed default types if table is empty
  seedDefaultTypes();
  
  // Auto-repair existing corrupted default types from before the encode fix
  for (const t of DEFAULT_EXPENSE_TYPES) {
    db.executeSync(
      'UPDATE expense_types SET name_en = ?, name_bn = ? WHERE name_en = ? OR name_en = ?',
      [encodeURIComponent(t.name_en), encodeURIComponent(t.name_bn), t.name_en, encodeURIComponent(t.name_en)]
    );
  }
};

// ─── Expense Type CRUD ─────────────────────────────────────────────

export const getAllExpenseTypes = (): ExpenseType[] => {
  const result = db.executeSync('SELECT * FROM expense_types ORDER BY id ASC');
  const rows = (result.rows as unknown as ExpenseType[]) || [];

  return rows.map(row => ({
    ...row,
    name_en: row.name_en ? decodeURIComponent(row.name_en) : row.name_en,
    name_bn: row.name_bn ? decodeURIComponent(row.name_bn) : row.name_bn,
  }));
};

export const addExpenseType = (nameEn: string, nameBn: string): void => {
  db.executeSync(
    'INSERT INTO expense_types (name_en, name_bn) VALUES (?, ?)',
    [encodeURIComponent(nameEn), encodeURIComponent(nameBn)],
  );
};

export const updateExpenseType = (id: number, nameEn: string, nameBn: string): void => {
  db.executeSync(
    'UPDATE expense_types SET name_en = ?, name_bn = ? WHERE id = ?',
    [encodeURIComponent(nameEn), encodeURIComponent(nameBn), id],
  );
};

export const deleteExpenseType = (id: number): void => {
  db.executeSync('DELETE FROM expense_types WHERE id = ?', [id]);
};

// ─── Expense CRUD ──────────────────────────────────────────────────

export const addExpense = (expense: Omit<Expense, 'id'>) => {
  const normalizedDate = format(
    typeof expense.date === 'string' ? parseISO(expense.date) : expense.date,
    'yyyy-MM-dd',
  );

  const safeTitle = encodeURIComponent(expense.title);
  const safeDesc = expense.description ? encodeURIComponent(expense.description) : null;

  db.executeSync(
    'INSERT INTO expenses (title, amount, date, type, description) VALUES (?, ?, ?, ?, ?)',
    [safeTitle, expense.amount, normalizedDate, expense.type, safeDesc],
  );
};

export const updateExpense = (expense: Expense) => {
  const normalizedDate = format(
    typeof expense.date === 'string' ? parseISO(expense.date) : expense.date,
    'yyyy-MM-dd',
  );

  const safeTitle = encodeURIComponent(expense.title);
  const safeDesc = expense.description ? encodeURIComponent(expense.description) : null;

  db.executeSync(
    'UPDATE expenses SET title = ?, amount = ?, date = ?, type = ?, description = ? WHERE id = ?',
    [safeTitle, expense.amount, normalizedDate, expense.type, safeDesc, expense.id],
  );
};

export const deleteExpense = (id: number) => {
  db.executeSync('DELETE FROM expenses WHERE id = ?', [id]);
};

// ─── Expense Queries ───────────────────────────────────────────────

export const getExpensesByDateRange = (startDate: string, endDate: string): Expense[] => {
  const result = db.executeSync(
    'SELECT * FROM expenses WHERE date >= ? AND date <= ? ORDER BY date DESC, id DESC',
    [startDate, endDate],
  );

  const rows = (result.rows as unknown as Expense[]) || [];

  return rows.map(row => {
    try {
      return {
        ...row,
        title: row.title ? decodeURIComponent(row.title) : row.title,
        description: row.description ? decodeURIComponent(row.description) : row.description,
      };
    } catch (e) {
      // Fallback if it wasn't encoded properly
      return row;
    }
  });
};

export const getCurrentMonthExpenses = (): Expense[] => {
  const now = new Date();
  const start = format(startOfMonth(now), 'yyyy-MM-dd');
  const end = format(endOfMonth(now), 'yyyy-MM-dd');
  return getExpensesByDateRange(start, end);
};

export const getExpensesByCategoryForDateRange = (startDate: string, endDate: string) => {
  const result = db.executeSync(
    'SELECT type, SUM(amount) as total FROM expenses WHERE date >= ? AND date <= ? GROUP BY type',
    [startDate, endDate],
  );

  return (result.rows as { type: string; total: number }[]) || [];
};

export const getExpensesByCategoryForCurrentMonth = () => {
  const now = new Date();
  const start = format(startOfMonth(now), 'yyyy-MM-dd');
  const end = format(endOfMonth(now), 'yyyy-MM-dd');
  return getExpensesByCategoryForDateRange(start, end);
};

export const getAllExpenses = (): Expense[] => {
  const result = db.executeSync('SELECT * FROM expenses ORDER BY id ASC');
  const rows = (result.rows as unknown as Expense[]) || [];

  return rows.map(row => {
    try {
      return {
        ...row,
        title: row.title ? decodeURIComponent(row.title) : row.title,
        description: row.description ? decodeURIComponent(row.description) : row.description,
      };
    } catch (e) {
      return row;
    }
  });
};

export const clearAllData = () => {
  db.executeSync('DELETE FROM expenses');
  db.executeSync('DELETE FROM expense_types');
};

export const importExpensesBatch = (expenses: Expense[]) => {
  for (const exp of expenses) {
    const safeTitle = encodeURIComponent(exp.title);
    const safeDesc = exp.description ? encodeURIComponent(exp.description) : null;
    db.executeSync(
      'INSERT INTO expenses (id, title, amount, date, type, description) VALUES (?, ?, ?, ?, ?, ?)',
      [exp.id, safeTitle, exp.amount, exp.date, exp.type, safeDesc]
    );
  }
};

export const importExpenseTypesBatch = (types: ExpenseType[]) => {
  for (const type of types) {
    db.executeSync(
      'INSERT INTO expense_types (id, name_en, name_bn) VALUES (?, ?, ?)',
      [type.id, encodeURIComponent(type.name_en), encodeURIComponent(type.name_bn)]
    );
  }
};
