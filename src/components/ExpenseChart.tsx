import React, { useMemo } from 'react';
import { View, Text, useColorScheme, Platform } from 'react-native';

const fontFamily = Platform.OS === 'android' ? 'sans-serif' : undefined;
import { PieChart } from 'react-native-gifted-charts';
import { useI18n } from '../i18n/I18nContext';
import { ExpenseType } from '../db/schema';

interface ExpenseChartProps {
  data: { type: string; total: number }[];
  expenseTypes: ExpenseType[];
}

const COLORS = [
  '#4f46e5', // indigo-600
  '#06b6d4', // cyan-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#64748b', // slate-500
];

export function ExpenseChart({ data, expenseTypes }: ExpenseChartProps) {
  const isDark = useColorScheme() === 'dark';
  const { lang, t } = useI18n();

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
      <Text className="text-lg font-bold text-slate-800 dark:text-white mb-6 self-start">
        {t('expenseBreakdown')}
      </Text>

      <PieChart
        data={chartData}
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
        {chartData.map((item) => (
          <View key={item.text} className="flex-row items-center w-[45%] mb-3">
            <View
              style={{ backgroundColor: item.color }}
              className="w-3 h-3 rounded-full mr-2"
            />
            <View className="flex-1">
              <Text className="text-sm text-slate-700 dark:text-slate-300" numberOfLines={1} style={{ fontFamily, fontWeight: '500' }}>
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
    </View>
  );
}
