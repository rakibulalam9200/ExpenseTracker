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
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { Moon, Settings, Sun, Search, X, PieChart, BarChart3 } from 'lucide-react-native';
import { useColorScheme as useNativeWindColorScheme, cssInterop } from 'nativewind';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import Logo from './src/assets/images/logo_rounded.svg';

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
import { YearlyReportModal } from './src/components/YearlyReportModal';
import { DateFilter } from './src/components/DateFilter';
import { ManageTypes } from './src/components/ManageTypes';
import { SkeletonLoader } from './src/components/SkeletonLoader';
import { BackupRestore } from './src/components/BackupRestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { I18nProvider, useI18n } from './src/i18n/I18nContext';
import { useDebounce } from './src/hooks/useDebounce';

cssInterop(SafeAreaView, { className: 'style' });

// Enable className support for Lucide icons
[Moon, Settings, Sun, Search, X, PieChart, BarChart3].forEach((icon) => {
  cssInterop(icon, {
    className: {
      target: 'style',
      nativeStyleToProp: {
        color: true,
      },
    },
  });
});

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
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [isYearlyReportModalOpen, setIsYearlyReportModalOpen] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const filteredExpenses = expenses.filter(expense => {
    if (!debouncedSearchQuery.trim()) return true;
    const query = debouncedSearchQuery.toLowerCase();

    const matchesTitle = expense.title.toLowerCase().includes(query);

    const type = expenseTypes.find(t => t.id.toString() === expense.type);
    const matchesTypeEn = type?.name_en.toLowerCase().includes(query) || false;
    const matchesTypeBn = type?.name_bn.toLowerCase().includes(query) || false;

    const subType = expenseSubTypes.find(st => st.id.toString() === expense.sub_type);
    const matchesSubTypeEn = subType?.name_en.toLowerCase().includes(query) || false;
    const matchesSubTypeBn = subType?.name_bn.toLowerCase().includes(query) || false;

    return matchesTitle || matchesTypeEn || matchesTypeBn || matchesSubTypeEn || matchesSubTypeBn;
  });

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
      <View className="flex-row items-center justify-between mb-4">
        <ExpenseForm
          onSubmit={handleAddExpense}
          onUpdate={handleUpdateExpense}
          editingExpense={editingExpense}
          onCancelEdit={() => setEditingExpense(null)}
          expenseTypes={expenseTypes}
          expenseSubTypes={expenseSubTypes}
        />

      </View>

      <View className='flex-col mb-4'>
        <View className='flex-row justify-between items-center'>
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
          <DateFilter
            startDate={filterStart}
            endDate={filterEnd}
            onApply={handleApplyFilter}
            onClear={handleClearFilter}
            isFiltered={isFiltered}
          />
        </View>

        {isFiltered && (
          <View className="flex-row items-center mt-3 ml-1">
            <View className="bg-primary-100 dark:bg-primary-900/40 border border-primary-200 dark:border-primary-700 rounded-full px-4 py-2 flex-row items-center">
              <Text className="text-sm font-semibold text-primary-700 dark:text-primary-300 mr-2">
                {`${format(filterStart, 'MMM dd')} - ${format(filterEnd, 'MMM dd')}`}
              </Text>
              <TouchableOpacity onPress={handleClearFilter} className="p-1 rounded-full bg-primary-200 dark:bg-primary-800">
                <X size={14} color="#4338ca" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
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
      <View className="flex-row justify-between items-center px-4 py-2 z-10">
        <View className="flex-row items-center justify-center">
          <Logo width={50} height={50} />
          <View className='px-3'>
            <Text className="text-2xl font-bold text-primary-600 dark:text-primary-400" style={{ fontFamily }}>
              {t('appName')}
            </Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium" style={{ fontFamily }}>
              {t('offlineFirst')}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center">
          {/* Language Toggle */}
          <TouchableOpacity
            onPress={toggleLanguage}
            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full mr-2"
          >
            <Text className="text-sm font-bold text-primary-600 dark:text-primary-400" style={{ fontFamily }}>
              {lang === 'en' ? 'বাং' : 'EN'}
            </Text>
          </TouchableOpacity>

          {/* Dark Mode Toggle */}
          <TouchableOpacity
            onPress={toggleColorScheme}
            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full mr-2"
          >
            {isDark ? (
              <Sun color="#fbbf24" size={20} />
            ) : (
              <Moon color="#6366f1" size={20} />
            )}
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity
            onPress={() => setIsSettingsOpen(true)}
            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"
          >
            <Settings color="#6366f1" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      <View className="flex-1 px-4 pt-6">
        {!isDBReady ? (
          <SkeletonLoader />
        ) : (
          <FlatList
            data={filteredExpenses}
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
            ListHeaderComponent={renderHeader()}
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

      {/* Settings Modal */}
      <Modal visible={isSettingsOpen} animationType="slide" transparent={true} onRequestClose={() => setIsSettingsOpen(false)}>
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setIsSettingsOpen(false)}
        >
          <View
            className="bg-slate-50 dark:bg-slate-900 rounded-t-3xl p-5 pb-8"
            onStartShouldSetResponder={() => true}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-slate-900 dark:text-white">
                {t('settings') || 'Settings'}
              </Text>
              <TouchableOpacity onPress={() => setIsSettingsOpen(false)} className="p-2 -mr-2">
                <X color="#94a3b8" size={24} />
              </TouchableOpacity>
            </View>

            <ManageTypes
              expenseTypes={expenseTypes}
              expenseSubTypes={expenseSubTypes}
              onAdd={handleAddType}
              onUpdate={handleUpdateType}
              onDelete={handleDeleteType}
              onAddSubType={handleAddSubType}
              onUpdateSubType={handleUpdateSubType}
              onDeleteSubType={handleDeleteSubType}
              renderTrigger={(onPress) => (
                <TouchableOpacity
                  onPress={onPress}
                  className="bg-white dark:bg-slate-800 p-4 rounded-xl flex-row items-center border border-slate-100 dark:border-slate-700 mb-3"
                >
                  <View className="bg-primary-100 dark:bg-primary-900/50 p-2 rounded-lg mr-3">
                    <Settings color="#6366f1" size={20} />
                  </View>
                  <Text className="text-base text-slate-800 dark:text-slate-200 font-medium flex-1">
                    {t('manageTypes')}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <BackupRestore
              onRestoreComplete={() => { loadTypes(); loadSubTypes(); loadData(); }}
              onActionComplete={() => setIsSettingsOpen(false)}
            />

            <TouchableOpacity
              onPress={() => {
                setIsSettingsOpen(false);
                setIsChartModalOpen(true);
              }}
              className="bg-white dark:bg-slate-800 p-4 rounded-xl flex-row items-center border border-slate-100 dark:border-slate-700 mb-3"
            >
              <View className="bg-primary-100 dark:bg-primary-900/50 p-2 rounded-lg mr-3">
                <PieChart color="#0ea5e9" size={20} />
              </View>
              <Text className="text-base text-slate-800 dark:text-slate-200 font-medium flex-1">
                {t('expenseChart')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setIsSettingsOpen(false);
                setIsYearlyReportModalOpen(true);
              }}
              className="bg-white dark:bg-slate-800 p-4 rounded-xl flex-row items-center border border-slate-100 dark:border-slate-700 mb-3"
            >
              <View className="bg-primary-100 dark:bg-primary-900/50 p-2 rounded-lg mr-3">
                <BarChart3 color="#0ea5e9" size={20} />
              </View>
              <Text className="text-base text-slate-800 dark:text-slate-200 font-medium flex-1">
                {t('yearlyReport')}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Chart Modal */}
      <Modal visible={isChartModalOpen} animationType="slide" transparent={true} onRequestClose={() => setIsChartModalOpen(false)}>
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setIsChartModalOpen(false)}
        >
          <View
            className="bg-slate-50 dark:bg-slate-900 rounded-t-3xl p-5 pb-8 max-h-[80%]"
            onStartShouldSetResponder={() => true}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-slate-900 dark:text-white">
                {t('expenseChart') || 'Expense Chart'}
              </Text>
              <TouchableOpacity onPress={() => setIsChartModalOpen(false)} className="p-2 -mr-2">
                <X color="#94a3b8" size={24} />
              </TouchableOpacity>
            </View>

            {chartData.length > 0 ? (
              <ExpenseChart
                data={chartData}
                subTypeData={subTypeChartData}
                expenseTypes={expenseTypes}
                expenseSubTypes={expenseSubTypes}
              />
            ) : (
              <View className="items-center justify-center py-10">
                <Text className="text-slate-400 dark:text-slate-500 text-lg" style={{ fontFamily }}>
                  {t('noExpenses') || 'No expenses found.'}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <YearlyReportModal
        visible={isYearlyReportModalOpen}
        onClose={() => setIsYearlyReportModalOpen(false)}
      />
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
