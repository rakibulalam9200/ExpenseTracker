/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
  Platform,
  TextInput,
  Animated,
} from 'react-native';
import {
  Moon,
  Settings,
  Sun,
  Search,
  X,
  CalendarDays,
  Calendar,
  Wallet,
  Plus,
} from 'lucide-react-native';
import {
  useColorScheme as useNativeWindColorScheme,
  cssInterop,
} from 'nativewind';
import {
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  format,
} from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';
import { HomeScreenProps } from '../navigation/types';
import { useRef } from 'react';

import Logo from '../assets/images/logo_rounded.svg';

import {
  initDB,
  addExpense,
  updateExpense as updateExpenseDB,
  deleteExpense as deleteExpenseDB,
  getExpensesByDateRange,
  getAllExpenses,
  getAllExpenseTypes,
  getAllExpenseSubTypes,
  getSetting,
  getCurrentMonthExpenses,
} from '../db/database';
import { Expense, ExpenseType, ExpenseSubType } from '../db/schema';
import { ExpenseCard } from '../components/ExpenseCard';
import { ExpenseForm } from '../components/ExpenseForm';
import { DateFilter } from '../components/DateFilter';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useI18n } from '../i18n/I18nContext';
import { useDebounce } from '../hooks/useDebounce';

cssInterop(SafeAreaView, { className: 'style' });

// Enable className support for Lucide icons
[Moon, Settings, Sun, Search, X, CalendarDays, Calendar, Wallet, Plus].forEach(
  icon => {
    cssInterop(icon, {
      className: {
        target: 'style',
        nativeStyleToProp: {
          color: true,
        },
      },
    });
  },
);

const fontFamily = Platform.OS === 'android' ? 'sans-serif' : undefined;

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { colorScheme, toggleColorScheme } = useNativeWindColorScheme();
  const systemColorScheme = useColorScheme();
  const isDark =
    colorScheme === 'dark' ||
    ((colorScheme as any) === 'system' && systemColorScheme === 'dark');
  const { lang, toggleLanguage, t } = useI18n();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isDBReady, setIsDBReady] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isExpenseFormVisible, setIsExpenseFormVisible] = useState(false);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [expenseSubTypes, setExpenseSubTypes] = useState<ExpenseSubType[]>([]);

  // Date filter state
  const now = new Date();
  const [filterStart, setFilterStart] = useState(startOfMonth(now));
  const [filterEnd, setFilterEnd] = useState(endOfMonth(now));
  const [isFiltered, setIsFiltered] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'day' | 'month'>(
    'all',
  );

  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [budgetDesc, setBudgetDesc] = useState('');
  const [currentMonthTotal, setCurrentMonthTotal] = useState(0);

  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (monthlyBudget > 0) {
      const targetProgress = Math.min(
        (currentMonthTotal / monthlyBudget) * 100,
        100,
      );
      Animated.timing(progressAnim, {
        toValue: targetProgress,
        duration: 1200,
        useNativeDriver: false,
      }).start();
    }
  }, [currentMonthTotal, monthlyBudget, progressAnim]);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const filteredExpenses = expenses.filter(expense => {
    if (!debouncedSearchQuery.trim()) return true;
    const query = debouncedSearchQuery.toLowerCase();

    const matchesTitle = expense.title.toLowerCase().includes(query);

    const type = expenseTypes.find(t => t.id.toString() === expense.type);
    const matchesTypeEn = type?.name_en.toLowerCase().includes(query) || false;
    const matchesTypeBn = type?.name_bn.toLowerCase().includes(query) || false;

    const subType = expenseSubTypes.find(
      st => st.id.toString() === expense.sub_type,
    );
    const matchesSubTypeEn =
      subType?.name_en.toLowerCase().includes(query) || false;
    const matchesSubTypeBn =
      subType?.name_bn.toLowerCase().includes(query) || false;

    return (
      matchesTitle ||
      matchesTypeEn ||
      matchesTypeBn ||
      matchesSubTypeEn ||
      matchesSubTypeBn
    );
  });

  const loadData = useCallback(() => {
    try {
      const types = getAllExpenseTypes();
      setExpenseTypes(types);

      const subTypes = getAllExpenseSubTypes();
      setExpenseSubTypes(subTypes);

      const savedBudget = getSetting('monthly_budget');
      if (savedBudget) setMonthlyBudget(parseFloat(savedBudget));
      else setMonthlyBudget(0);

      const savedBudgetDesc = getSetting('monthly_budget_desc');
      if (savedBudgetDesc) setBudgetDesc(savedBudgetDesc);
      else setBudgetDesc('');

      const currentMonthExps = getCurrentMonthExpenses();
      const total = currentMonthExps.reduce((sum, e) => sum + e.amount, 0);
      setCurrentMonthTotal(total);

      if (isFiltered) {
        // User applied custom date filter
        const start = format(new Date(filterStart), 'yyyy-MM-dd');
        const end = format(new Date(filterEnd), 'yyyy-MM-dd');
        const currentExpenses = getExpensesByDateRange(start, end);
        setExpenses(currentExpenses);
      } else if (quickFilter === 'month') {
        // This Month toggle active
        const n = new Date();
        const start = format(startOfMonth(n), 'yyyy-MM-dd');
        const end = format(endOfMonth(n), 'yyyy-MM-dd');
        const currentExpenses = getExpensesByDateRange(start, end);
        setExpenses(currentExpenses);
      } else if (quickFilter === 'day') {
        // This Day toggle active
        const n = new Date();
        const start = format(startOfDay(n), 'yyyy-MM-dd');
        const end = format(endOfDay(n), 'yyyy-MM-dd');
        const currentExpenses = getExpensesByDateRange(start, end);
        setExpenses(currentExpenses);
      } else {
        // Default: show all expenses
        const allExpenses = getAllExpenses();
        setExpenses(allExpenses);
      }
    } catch (e) {
      console.error('Failed to load data', e);
    }
  }, [filterStart, filterEnd, isFiltered, quickFilter]);

  useEffect(() => {
    try {
      initDB();
      setIsDBReady(true);
      loadData();
    } catch (e) {
      console.error('Failed to init DB', e);
    }
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      if (isDBReady) {
        loadData();
      }
    }, [isDBReady, loadData]),
  );

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
    <View className="">
      {monthlyBudget > 0 && (
        <View className="mb-4 bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center flex-1 mr-2">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                  currentMonthTotal > monthlyBudget
                    ? 'bg-red-50 dark:bg-red-900/20'
                    : 'bg-primary-50 dark:bg-primary-900/20'
                }`}
              >
                <Wallet
                  size={28}
                  color={
                    currentMonthTotal > monthlyBudget
                      ? '#ef4444'
                      : isDark
                      ? '#38bdf8'
                      : '#0ea5e9'
                  }
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-sm font-extrabold text-slate-800 dark:text-slate-100"
                  style={{ fontFamily }}
                >
                  {t('monthlyBudget')}
                </Text>
                <Text
                  className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5"
                  style={{ fontFamily }}
                  numberOfLines={1}
                >
                  {currentMonthTotal > monthlyBudget ? (
                    <Text className="text-red-500 font-bold">
                      {t('budgetExceeded')}
                    </Text>
                  ) : (
                    <Text className="text-emerald-500 dark:text-emerald-400 font-bold">
                      {t('budgetLeft') || 'Remaining'}: ৳{' '}
                      {monthlyBudget - currentMonthTotal}
                    </Text>
                  )}
                  {budgetDesc ? ` • ${budgetDesc}` : ''}
                </Text>
              </View>
            </View>

            <View className="items-end justify-center">
              <Text
                className={`text-base font-black ${
                  currentMonthTotal > monthlyBudget
                    ? 'text-red-500'
                    : 'text-primary-600 dark:text-primary-400'
                }`}
                style={{ fontFamily }}
              >
                ৳ {currentMonthTotal}
              </Text>
              <Text
                className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5"
                style={{ fontFamily }}
              >
                / ৳ {monthlyBudget} (
                {Math.min(
                  Math.round((currentMonthTotal / monthlyBudget) * 100),
                  100,
                )}
                %)
              </Text>
            </View>
          </View>

          <View className="h-1.5 w-full bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden mt-1">
            <Animated.View
              className={`h-full rounded-full ${
                currentMonthTotal > monthlyBudget
                  ? 'bg-red-500'
                  : 'bg-primary-500 dark:bg-primary-400'
              }`}
              style={{
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              }}
            />
          </View>
        </View>
      )}

      <View className="flex-col">
        <View className="flex-row justify-between items-center">
          <View className="flex-1 flex-row items-center bg-white dark:bg-slate-800 border border-slate-200 py-2 dark:border-slate-700 rounded-full px-4 mr-3">
            <Search size={18} color="#94a3b8" />
            <TextInput
              className="flex-1 ml-2 text-base text-slate-900 dark:text-white py-0"
              placeholder="Search ...."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ fontFamily }}
            />
          </View>
          <TouchableOpacity
            className="bg-primary-600 active:bg-primary-700 flex-row items-center justify-center p-2 rounded-full shadow-md"
            onPress={() => setIsExpenseFormVisible(true)}
          >
            <Plus color="white" size={24} />
          </TouchableOpacity>
        </View>
      </View>
      <View className="flex-row items-center justify-between">
        <ExpenseForm
          isVisible={isExpenseFormVisible}
          onClose={() => setIsExpenseFormVisible(false)}
          onSubmit={handleAddExpense}
          onUpdate={handleUpdateExpense}
          editingExpense={editingExpense}
          onCancelEdit={() => setEditingExpense(null)}
          expenseTypes={expenseTypes}
          expenseSubTypes={expenseSubTypes}
        />
      </View>
      <View className="flex-row items-center justify-between mt-4 mb-2">
        <Text
          className="text-xl font-bold text-slate-800 dark:text-white"
          style={{ fontFamily }}
        >
          {t('recentExpenses')}
        </Text>

        <DateFilter
          startDate={filterStart}
          endDate={filterEnd}
          onApply={handleApplyFilter}
          onClear={handleClearFilter}
          isFiltered={isFiltered}
        />
        {/* <View className="flex-row">
          <TouchableOpacity
            onPress={() =>
              setQuickFilter(prev => (prev === 'day' ? 'all' : 'day'))
            }
            className={`flex-row items-center px-3 py-1.5 rounded-full border mr-2 ${
              quickFilter === 'day'
                ? 'bg-primary-600 dark:bg-primary-500 border-primary-600 dark:border-primary-500'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Calendar
              size={15}
              color={
                quickFilter === 'day'
                  ? '#ffffff'
                  : isDark
                  ? '#94a3b8'
                  : '#64748b'
              }
            />
            <Text
              className={`text-xs font-semibold ml-1.5 ${
                quickFilter === 'day'
                  ? 'text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              style={{ fontFamily }}
            >
              {t('thisDay')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              setQuickFilter(prev => (prev === 'month' ? 'all' : 'month'))
            }
            className={`flex-row items-center px-3 py-1.5 rounded-full border ${
              quickFilter === 'month'
                ? 'bg-primary-600 dark:bg-primary-500 border-primary-600 dark:border-primary-500'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}
          >
            <CalendarDays
              size={15}
              color={
                quickFilter === 'month'
                  ? '#ffffff'
                  : isDark
                  ? '#94a3b8'
                  : '#64748b'
              }
            />
            <Text
              className={`text-xs font-semibold ml-1.5 ${
                quickFilter === 'month'
                  ? 'text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              style={{ fontFamily }}
            >
              {t('thisMonth')}
            </Text>
          </TouchableOpacity>
        </View> */}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gary-100 dark:bg-slate-950">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#020617' : '#F3F4F6'}
      />

      <View className="flex-row justify-between items-center px-4 py-2 z-10">
        <View className="flex-row items-center justify-center">
          <Logo width={50} height={50} />
          <View className="px-3">
            <Text
              className="text-2xl font-bold text-primary-600 dark:text-primary-400"
              style={{ fontFamily }}
            >
              {t('appName')}
            </Text>
            <Text
              className="text-xs text-slate-500 dark:text-slate-400 font-medium"
              style={{ fontFamily }}
            >
              {t('offlineFirst')}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Settings', {
                filterStart: filterStart.toISOString(),
                filterEnd: filterEnd.toISOString(),
              })
            }
            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"
          >
            <Settings color={isDark ? '#6366f1' : '#191970'} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1 px-4 pt-2">
        {!isDBReady ? (
          <SkeletonLoader isDark={isDark} />
        ) : (
          <FlatList
            data={filteredExpenses}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <ExpenseCard
                expense={item}
                expenseTypes={expenseTypes}
                expenseSubTypes={expenseSubTypes}
                onEdit={expense => {
                  setEditingExpense(expense);
                  setIsExpenseFormVisible(true);
                }}
                onDelete={handleDeleteExpense}
              />
            )}
            ListHeaderComponent={renderHeader()}
            ListEmptyComponent={
              <View className="items-center justify-center py-10">
                <Text
                  className="text-slate-400 dark:text-slate-500 text-lg"
                  style={{ fontFamily }}
                >
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
