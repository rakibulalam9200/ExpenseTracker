/* eslint-disable react/no-unstable-nested-components */
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  useColorScheme,
  Platform,
  TouchableOpacity,
} from 'react-native';

const fontFamily = Platform.OS === 'android' ? 'sans-serif' : undefined;
import { PieChart } from 'react-native-gifted-charts';
import { useI18n } from '../i18n/I18nContext';
import { ExpenseType, ExpenseSubType } from '../db/schema';
import { ReportModal } from './ReportModal';

interface ExpenseChartProps {
  data: { type: string; total: number }[];
  subTypeData: { type: string; sub_type: string | null; total: number }[];
  expenseTypes: ExpenseType[];
  expenseSubTypes: ExpenseSubType[];
}

const COLORS = [
  '#4f46e5', // primary-600
  '#06b6d4', // cyan-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#64748b', // slate-500
];

export function ExpenseChart({
  data,
  subTypeData,
  expenseTypes,
  expenseSubTypes,
}: ExpenseChartProps) {
  const isDark = useColorScheme() === 'dark';
  const { lang, t } = useI18n();
  const [reportVisible, setReportVisible] = useState(false);

  const resolveTypeLabel = (typeId: string): string => {
    const found = expenseTypes.find(et => et.id.toString() === typeId);
    return found ? (lang === 'bn' ? found.name_bn : found.name_en) : typeId;
  };

  const chartData = useMemo(() => {
    return data.map((item, index) => ({
      value: item.total,
      text: resolveTypeLabel(item.type),
      color: COLORS[index % COLORS.length],
      focused: index === 0,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, lang, expenseTypes]);

  const totalExpense = useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.total, 0);
  }, [data]);

  if (data.length === 0) {
    return (
      <View className="bg-white dark:bg-slate-800 rounded-3xl p-6 items-center justify-center border border-slate-100 dark:border-slate-700 my-4 py-12">
        <Text className="text-slate-400 dark:text-slate-500 text-base font-medium">
          {t('noChartData')}
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-white dark:bg-slate-800 rounded-3xl p-6 items-center border border-slate-100 dark:border-slate-700 my-4 shadow-sm">
      <View className="flex-row justify-between w-full items-center">
        <Text className="text-lg font-bold text-primary-800 dark:text-white mb-6 self-start">
          {t('expenseBreakdown')}
        </Text>
        <TouchableOpacity onPress={() => setReportVisible(true)}>
          <Text className="text-lg font-bold text-primary-600 mb-6 self-end">
            {t('report')}
          </Text>
        </TouchableOpacity>
      </View>

      <PieChart
        data={chartData}
        isAnimated
        animationDuration={1000}
        donut
        radius={110}
        innerRadius={70}
        innerCircleColor={isDark ? '#1e293b' : '#ffffff'}
        centerLabelComponent={() => {
          return (
            <View className="justify-center items-center">
              <Text className="text-2xl font-bold text-slate-800 dark:text-white">
                ৳{totalExpense.toFixed(2)}
              </Text>
              <Text className="text-xs text-slate-500 dark:text-slate-400">
                {t('total')}
              </Text>
            </View>
          );
        }}
      />

      <View className="flex-row flex-wrap justify-center mt-8 w-full">
        {chartData.map(item => (
          <View key={item.text} className="flex-row items-center w-[45%] mb-3">
            <View
              style={{ backgroundColor: item.color }}
              className="w-3 h-3 rounded-full mr-2"
            />
            <View className="flex-1">
              <Text
                className="text-sm text-slate-700 dark:text-slate-300"
                numberOfLines={1}
                // eslint-disable-next-line react-native/no-inline-styles
                style={{ fontFamily, fontWeight: '500' }}
              >
                {item.text}
              </Text>
              <Text className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                ৳{item.value.toFixed(2)} (
                {Math.round((item.value / totalExpense) * 100)}%)
              </Text>
            </View>
          </View>
        ))}
      </View>

      <ReportModal
        visible={reportVisible}
        onClose={() => setReportVisible(false)}
        chartData={chartData}
        totalExpense={totalExpense}
        subTypeData={subTypeData}
        expenseTypes={expenseTypes}
        expenseSubTypes={expenseSubTypes}
      />
    </View>
  );
}
