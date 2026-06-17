import './global.css';

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
  Platform,
} from 'react-native';
import { Moon, Sun } from 'lucide-react-native';
import { useColorScheme as useNativeWindColorScheme, cssInterop } from 'nativewind';
import { startOfMonth, endOfMonth, format } from 'date-fns';

import {
  initDB,
  addExpense,
  updateExpense as updateExpenseDB,
  deleteExpense as deleteExpenseDB,
  getExpensesByDateRange,
  getExpensesByCategoryForDateRange,
  getExpensesBySubTypeForDateRange,
  getAllExpenseTypes,
  addExpenseType,
  updateExpenseType,
  deleteExpenseType,
  getAllExpenseSubTypes,
  addExpenseSubType,
  updateExpenseSubType,
  deleteExpenseSubType,
} from './src/db/database';
import { Expense, ExpenseType, ExpenseSubType } from './src/db/schema';
import { ExpenseCard } from './src/components/ExpenseCard';
import { ExpenseForm } from './src/components/ExpenseForm';
import { ExpenseChart } from './src/components/ExpenseChart';
import { DateFilter } from './src/components/DateFilter';
import { ManageTypes } from './src/components/ManageTypes';
import { SkeletonLoader } from './src/components/SkeletonLoader';
import { BackupRestore } from './src/components/BackupRestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { I18nProvider, useI18n } from './src/i18n/I18nContext';

cssInterop(SafeAreaView, { className: 'style' });

// Android-safe font that supports Bangla/Bengali script
const fontFamily = Platform.OS === 'android' ? 'sans-serif' : undefined;

function AppContent() {
  const { colorScheme, toggleColorScheme } = useNativeWindColorScheme();
  const systemColorScheme = useColorScheme();
  const isDark = colorScheme === 'dark' || ((colorScheme as any) === 'system' && systemColorScheme === 'dark');
  const { lang, toggleLanguage, t } = useI18n();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [chartData, setChartData] = useState<{ type: string; total: number }[]>([]);
  const [subTypeChartData, setSubTypeChartData] = useState<{ type: string; sub_type: string | null; total: number }[]>([]);
  const [isDBReady, setIsDBReady] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [expenseSubTypes, setExpenseSubTypes] = useState<ExpenseSubType[]>([]);

  // Date filter state
  const now = new Date();
  const [filterStart, setFilterStart] = useState(startOfMonth(now));
  const [filterEnd, setFilterEnd] = useState(endOfMonth(now));
  const [isFiltered, setIsFiltered] = useState(false);

  const loadTypes = useCallback(() => {
    try {
      const types = getAllExpenseTypes();
      setExpenseTypes(types);
    } catch (e) {
      console.error('Failed to load types', e);
    }
  }, []);

  const loadSubTypes = useCallback(() => {
    try {
      const subTypes = getAllExpenseSubTypes();
      setExpenseSubTypes(subTypes);
    } catch (e) {
      console.error('Failed to load sub-types', e);
    }
  }, []);

  const loadData = useCallback(() => {
    try {
      const start = format(filterStart, 'yyyy-MM-dd');
      const end = format(filterEnd, 'yyyy-MM-dd');

      const currentExpenses = getExpensesByDateRange(start, end);
      console.log(currentExpenses, "current expenses");
      setExpenses(currentExpenses);

      const categoryTotals = getExpensesByCategoryForDateRange(start, end);
      setChartData(categoryTotals);

      const subTypeTotals = getExpensesBySubTypeForDateRange(start, end);
      setSubTypeChartData(subTypeTotals);
    } catch (e) {
      console.error('Failed to load data', e);
    }
  }, [filterStart, filterEnd]);

  useEffect(() => {
    try {
      initDB();
      setIsDBReady(true);
      loadTypes();
      loadSubTypes();
      loadData();
    } catch (e) {
      console.error('Failed to init DB', e);
    }
  }, [loadData, loadTypes, loadSubTypes]);

  // ─── Expense Handlers ────────────────────────────────────────────

  const handleAddExpense = (expenseData: Omit<Expense, 'id'>) => {
    try {
      addExpense(expenseData);
      loadData();
    } catch (e) {
      console.error('Failed to add expense', e);
    }
  };

  const handleUpdateExpense = (expense: Expense) => {
    try {
      updateExpenseDB(expense);
      setEditingExpense(null);
      loadData();
    } catch (e) {
      console.error('Failed to update expense', e);
    }
  };

  const handleDeleteExpense = (id: number) => {
    try {
      deleteExpenseDB(id);
      loadData();
    } catch (e) {
      console.error('Failed to delete expense', e);
    }
  };

  // ─── Type Handlers ───────────────────────────────────────────────

  const handleAddType = (nameEn: string, nameBn: string) => {
    try {
      addExpenseType(nameEn, nameBn);
      loadTypes();
    } catch (e) {
      console.error('Failed to add type', e);
    }
  };

  const handleUpdateType = (id: number, nameEn: string, nameBn: string) => {
    try {
      updateExpenseType(id, nameEn, nameBn);
      loadTypes();
    } catch (e) {
      console.error('Failed to update type', e);
    }
  };

  const handleDeleteType = (id: number) => {
    try {
      deleteExpenseType(id);
      loadTypes();
      loadSubTypes(); // sub-types are cascade-deleted
    } catch (e) {
      console.error('Failed to delete type', e);
    }
  };

  // ─── Sub-Type Handlers ───────────────────────────────────────────

  const handleAddSubType = (expenseTypeId: number, nameEn: string, nameBn: string) => {
    try {
      addExpenseSubType(expenseTypeId, nameEn, nameBn);
      loadSubTypes();
    } catch (e) {
      console.error('Failed to add sub-type', e);
    }
  };

  const handleUpdateSubType = (id: number, nameEn: string, nameBn: string) => {
    try {
      updateExpenseSubType(id, nameEn, nameBn);
      loadSubTypes();
    } catch (e) {
      console.error('Failed to update sub-type', e);
    }
  };

  const handleDeleteSubType = (id: number) => {
    try {
      deleteExpenseSubType(id);
      loadSubTypes();
    } catch (e) {
      console.error('Failed to delete sub-type', e);
    }
  };

  // ─── Filter Handlers ─────────────────────────────────────────────

  const handleApplyFilter = (start: Date, end: Date) => {
    setFilterStart(start);
    setFilterEnd(end);
    setIsFiltered(true);
  };

  const handleClearFilter = () => {
    const n = new Date();
    setFilterStart(startOfMonth(n));
    setFilterEnd(endOfMonth(n));
    setIsFiltered(false);
  };

  const renderHeader = () => (
    <View className="mb-4">
      <ExpenseForm
        onSubmit={handleAddExpense}
        onUpdate={handleUpdateExpense}
        editingExpense={editingExpense}
        onCancelEdit={() => setEditingExpense(null)}
        expenseTypes={expenseTypes}
        expenseSubTypes={expenseSubTypes}
      />

      <View className='flex-row justify-between items-center'>
        <DateFilter
          startDate={filterStart}
          endDate={filterEnd}
          onApply={handleApplyFilter}
          onClear={handleClearFilter}
          isFiltered={isFiltered}
        />


        <ManageTypes
          expenseTypes={expenseTypes}
          expenseSubTypes={expenseSubTypes}
          onAdd={handleAddType}
          onUpdate={handleUpdateType}
          onDelete={handleDeleteType}
          onAddSubType={handleAddSubType}
          onUpdateSubType={handleUpdateSubType}
          onDeleteSubType={handleDeleteSubType}
        />
      </View>
      {chartData.length > 0 && (
        <ExpenseChart
          data={chartData}
          subTypeData={subTypeChartData}
          expenseTypes={expenseTypes}
          expenseSubTypes={expenseSubTypes}
        />
      )}

      <BackupRestore onRestoreComplete={() => { loadTypes(); loadSubTypes(); loadData(); }} />

      <Text className="text-xl font-bold text-slate-800 dark:text-white mt-4 mb-2" style={{ fontFamily }}>
        {t('recentExpenses')}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#020617' : '#f8fafc'}
      />

      {/* Top Navigation Bar */}
      <View className="flex-row justify-between items-center px-6 py-4 bg-white dark:bg-slate-900 shadow-sm z-10">
        <View>
          <Text className="text-2xl font-bold text-indigo-600 dark:text-indigo-400" style={{ fontFamily }}>
            {t('appName')}
          </Text>
          <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium" style={{ fontFamily }}>
            {t('offlineFirst')}
          </Text>
        </View>
        <View className="flex-row items-center">
          {/* Language Toggle */}
          <TouchableOpacity
            onPress={toggleLanguage}
            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full mr-2"
          >
            <Text className="text-sm font-bold text-indigo-600 dark:text-indigo-400" style={{ fontFamily }}>
              {lang === 'en' ? 'বাং' : 'EN'}
            </Text>
          </TouchableOpacity>

          {/* Dark Mode Toggle */}
          <TouchableOpacity
            onPress={toggleColorScheme}
            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"
          >
            {isDark ? (
              <Sun color="#fbbf24" size={24} />
            ) : (
              <Moon color="#6366f1" size={24} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      <View className="flex-1 px-4 pt-6">
        {!isDBReady ? (
          <SkeletonLoader />
        ) : (
          <FlatList
            data={expenses}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <ExpenseCard
                expense={item}
                expenseTypes={expenseTypes}
                expenseSubTypes={expenseSubTypes}
                onEdit={setEditingExpense}
                onDelete={handleDeleteExpense}
              />
            )}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={
              <View className="items-center justify-center py-10">
                <Text className="text-slate-400 dark:text-slate-500 text-lg" style={{ fontFamily }}>
                  {t('noExpenses')}
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}
