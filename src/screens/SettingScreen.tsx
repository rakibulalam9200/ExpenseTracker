import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  Platform,
  Modal,
} from 'react-native';
import {
  Settings,
  X,
  PieChart,
  BarChart3,
  ArrowLeft,
  Bolt,
  Wallet,
  Briefcase,
} from 'lucide-react-native';
import {
  useColorScheme as useNativeWindColorScheme,
  cssInterop,
} from 'nativewind';
import { format } from 'date-fns';
import { SettingScreenProps } from '../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native';

import {
  getAllExpenseTypes,
  addExpenseType,
  updateExpenseType,
  deleteExpenseType,
  getAllExpenseSubTypes,
  addExpenseSubType,
  updateExpenseSubType,
  deleteExpenseSubType,
  getExpensesByCategoryForDateRange,
  getExpensesBySubTypeForDateRange,
  getSetting,
  setSetting,
} from '../db/database';
import { ExpenseType, ExpenseSubType } from '../db/schema';
import { ExpenseChart } from '../components/ExpenseChart';
import { YearlyReportModal } from '../components/YearlyReportModal';
import { ManageTypes } from '../components/ManageTypes';
import { BackupRestore } from '../components/BackupRestore';
import { useI18n } from '../i18n/I18nContext';

cssInterop(SafeAreaView, { className: 'style' });
[Settings, X, PieChart, BarChart3, ArrowLeft, Bolt, Wallet, Briefcase].forEach(icon => {
  cssInterop(icon, {
    className: {
      target: 'style',
      nativeStyleToProp: {
        color: true,
      },
    },
  });
});

const fontFamily = Platform.OS === 'android' ? 'sans-serif' : undefined;

export function SettingScreen({ navigation, route }: SettingScreenProps) {
  const { colorScheme } = useNativeWindColorScheme();
  const systemColorScheme = useColorScheme();
  const isDark =
    colorScheme === 'dark' ||
    ((colorScheme as any) === 'system' && systemColorScheme === 'dark');
  const { t } = useI18n();

  const { filterStart, filterEnd } = route.params;

  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [expenseSubTypes, setExpenseSubTypes] = useState<ExpenseSubType[]>([]);
  const [chartData, setChartData] = useState<{ type: string; total: number }[]>(
    [],
  );
  const [subTypeChartData, setSubTypeChartData] = useState<
    { type: string; sub_type: string | null; total: number }[]
  >([]);

  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [isYearlyReportModalOpen, setIsYearlyReportModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetDesc, setBudgetDesc] = useState('');
  const [tempBudgetAmount, setTempBudgetAmount] = useState('');
  const [tempBudgetDesc, setTempBudgetDesc] = useState('');

  const loadData = useCallback(() => {
    try {
      const types = getAllExpenseTypes();
      setExpenseTypes(types);

      const subTypes = getAllExpenseSubTypes();
      setExpenseSubTypes(subTypes);

      const start = format(new Date(filterStart), 'yyyy-MM-dd');
      const end = format(new Date(filterEnd), 'yyyy-MM-dd');

      const categoryTotals = getExpensesByCategoryForDateRange(start, end);
      setChartData(categoryTotals);

      const subTypeTotals = getExpensesBySubTypeForDateRange(start, end);
      setSubTypeChartData(subTypeTotals);

      const savedBudget = getSetting('monthly_budget');
      if (savedBudget) setBudgetAmount(savedBudget);

      const savedBudgetDesc = getSetting('monthly_budget_desc');
      if (savedBudgetDesc) setBudgetDesc(savedBudgetDesc);
    } catch (e) {
      console.error('Failed to load data', e);
    }
  }, [filterStart, filterEnd]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddType = (nameEn: string, nameBn: string) => {
    addExpenseType(nameEn, nameBn);
    loadData();
  };

  const handleUpdateType = (id: number, nameEn: string, nameBn: string) => {
    updateExpenseType(id, nameEn, nameBn);
    loadData();
  };

  const handleDeleteType = (id: number) => {
    deleteExpenseType(id);
    loadData();
  };

  const handleAddSubType = (
    expenseTypeId: number,
    nameEn: string,
    nameBn: string,
  ) => {
    addExpenseSubType(expenseTypeId, nameEn, nameBn);
    loadData();
  };

  const handleUpdateSubType = (id: number, nameEn: string, nameBn: string) => {
    updateExpenseSubType(id, nameEn, nameBn);
    loadData();
  };

  const handleDeleteSubType = (id: number) => {
    deleteExpenseSubType(id);
    loadData();
  };

  const handleOpenBudgetModal = () => {
    setTempBudgetAmount(budgetAmount);
    setTempBudgetDesc(budgetDesc);
    setIsBudgetModalOpen(true);
  };

  const handleApplyBudget = () => {
    setBudgetAmount(tempBudgetAmount);
    setSetting('monthly_budget', tempBudgetAmount);

    setBudgetDesc(tempBudgetDesc);
    setSetting('monthly_budget_desc', tempBudgetDesc);

    setIsBudgetModalOpen(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <View className="flex-row items-center px-4 py-4 z-10 border-b border-slate-200 dark:border-slate-800">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 mr-3 bg-slate-100 dark:bg-slate-800 rounded-full"
        >
          <ArrowLeft color={isDark ? '#fff' : '#0f172a'} size={20} />
        </TouchableOpacity>
        <Text
          className="text-xl font-bold text-slate-900 dark:text-white"
          style={{ fontFamily }}
        >
          {t('settings') || 'Settings'}
        </Text>
      </View>

      <View className="flex-1 px-4 pt-6">
        <TouchableOpacity
          onPress={handleOpenBudgetModal}
          className="bg-white dark:bg-slate-800 p-4 rounded-xl flex-row items-center border border-slate-100 dark:border-slate-700 mb-3"
        >
          <View className="bg-primary-100 dark:bg-primary-900/50 p-2 rounded-lg mr-3">
            <Wallet color={isDark ? '#0ea5e9' : '#191970'} size={20} />
          </View>
          <Text
            className="text-base text-primary-700 dark:text-slate-200 font-bold flex-1"
            style={{ fontFamily }}
          >
            {t('monthlyBudget')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsChartModalOpen(true)}
          className="bg-white dark:bg-slate-800 p-4 rounded-xl flex-row items-center border border-slate-100 dark:border-slate-700 mb-3"
        >
          <View className="bg-primary-100 dark:bg-primary-900/50 p-2 rounded-lg mr-3">
            <PieChart color={isDark ? '#0ea5e9' : '#191970'} size={20} />
          </View>
          <Text
            className="text-base text-primary-700 dark:text-slate-200 font-bold flex-1"
            style={{ fontFamily }}
          >
            {t('expenseChart')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsYearlyReportModalOpen(true)}
          className="bg-white dark:bg-slate-800 p-4 rounded-xl flex-row items-center border border-slate-100 dark:border-slate-700 mb-3"
        >
          <View className="bg-primary-100 dark:bg-primary-900/50 p-2 rounded-lg mr-3">
            <BarChart3 color={isDark ? '#0ea5e9' : '#191970'} size={20} />
          </View>
          <Text
            className="text-base text-slate-800 dark:text-slate-200 font-bold flex-1"
            style={{ fontFamily }}
          >
            {t('yearlyReport')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('LoanManagement')}
          className="bg-white dark:bg-slate-800 p-4 rounded-xl flex-row items-center border border-slate-100 dark:border-slate-700 mb-3"
        >
          <View className="bg-primary-100 dark:bg-primary-900/50 p-2 rounded-lg mr-3">
            <Briefcase color={isDark ? '#0ea5e9' : '#191970'} size={20} />
          </View>
          <Text
            className="text-base text-slate-800 dark:text-slate-200 font-bold flex-1"
            style={{ fontFamily }}
          >
            {t('loanManagement') || 'Loan Management'}
          </Text>
        </TouchableOpacity>

        <ManageTypes
          expenseTypes={expenseTypes}
          expenseSubTypes={expenseSubTypes}
          onAdd={handleAddType}
          onUpdate={handleUpdateType}
          onDelete={handleDeleteType}
          onAddSubType={handleAddSubType}
          onUpdateSubType={handleUpdateSubType}
          onDeleteSubType={handleDeleteSubType}
          renderTrigger={onPress => (
            <TouchableOpacity
              onPress={onPress}
              className="bg-white dark:bg-slate-800 p-4 rounded-xl flex-row items-center border border-slate-100 dark:border-slate-700 mb-3"
            >
              <View className="bg-primary-100 dark:bg-primary-900/50 p-2 rounded-lg mr-3">
                <Bolt color={isDark ? '#0ea5e9' : '#191970'} size={20} />
              </View>
              <Text
                className="text-base text-primary-700 dark:text-slate-200 font-bold flex-1"
                style={{ fontFamily }}
              >
                {t('manageTypes')}
              </Text>
            </TouchableOpacity>
          )}
        />

        <BackupRestore
          onRestoreComplete={() => loadData()}
          onActionComplete={() => {}}
        />
      </View>

      {/* Budget Modal */}
      <Modal
        visible={isBudgetModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsBudgetModalOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setIsBudgetModalOpen(false)}
        >
          <View
            className="bg-slate-50 dark:bg-slate-900 rounded-t-3xl p-5 pb-8"
            onStartShouldSetResponder={() => true}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text
                className="text-xl font-bold text-slate-900 dark:text-white"
                style={{ fontFamily }}
              >
                {t('monthlyBudget')}
              </Text>
              <TouchableOpacity
                onPress={() => setIsBudgetModalOpen(false)}
                className="p-2 -mr-2"
              >
                <X color="#94a3b8" size={24} />
              </TouchableOpacity>
            </View>

            <TextInput
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 mb-4 text-slate-900 dark:text-white"
              placeholder={t('budgetAmount')}
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={tempBudgetAmount}
              onChangeText={setTempBudgetAmount}
              style={{ fontFamily }}
            />
            <TextInput
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 mb-6 text-slate-900 dark:text-white"
              placeholder={t('descriptionOptional')}
              placeholderTextColor="#94a3b8"
              value={tempBudgetDesc}
              onChangeText={setTempBudgetDesc}
              style={{ fontFamily }}
            />

            <TouchableOpacity
              onPress={handleApplyBudget}
              className="bg-primary-600 active:bg-primary-700 py-4 rounded-xl items-center justify-center"
            >
              <Text
                className="text-white font-bold text-lg"
                style={{ fontFamily }}
              >
                {t('save') || 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Chart Modal */}
      <Modal
        visible={isChartModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsChartModalOpen(false)}
      >
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
              <Text
                className="text-xl font-bold text-slate-900 dark:text-white"
                style={{ fontFamily }}
              >
                {t('expenseChart') || 'Expense Chart'}
              </Text>
              <TouchableOpacity
                onPress={() => setIsChartModalOpen(false)}
                className="p-2 -mr-2"
              >
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
                <Text
                  className="text-slate-400 dark:text-slate-500 text-lg"
                  style={{ fontFamily }}
                >
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
