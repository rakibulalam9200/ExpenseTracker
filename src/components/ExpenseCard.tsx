/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  useColorScheme,
} from 'react-native';
import { Expense, ExpenseType, ExpenseSubType } from '../db/schema';
import { cn } from '../lib/utils';
import { format, parseISO } from 'date-fns';
import { Tag, Calendar, AlignLeft, Pencil, Trash2 } from 'lucide-react-native';
import { useI18n } from '../i18n/I18nContext';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

interface ExpenseCardProps {
  expense: Expense;
  expenseTypes: ExpenseType[];
  expenseSubTypes: ExpenseSubType[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => void;
  className?: string;
}

// Android-safe font that supports Bangla/Bengali script
const fontFamily = Platform.OS === 'android' ? 'sans-serif' : undefined;

export function ExpenseCard({
  expense,
  expenseTypes,
  expenseSubTypes,
  onEdit,
  onDelete,
  className,
}: ExpenseCardProps) {
  const { colorScheme } = useNativeWindColorScheme();
  const systemColorScheme = useColorScheme();
  const isDark =
    colorScheme === 'dark' ||
    ((colorScheme as any) === 'system' && systemColorScheme === 'dark');
  const { lang, t } = useI18n();

  const handleDelete = () => {
    Alert.alert(t('deleteConfirmTitle'), t('deleteConfirmMessage'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => onDelete(expense.id),
      },
    ]);
  };

  // Resolve type label from DB types
  const typeRecord = expenseTypes.find(et => et.id.toString() === expense.type);
  const typeLabel = typeRecord
    ? lang === 'bn'
      ? typeRecord.name_bn
      : typeRecord.name_en
    : expense.type;

  // Resolve sub-type label
  const subTypeRecord = expense.sub_type
    ? expenseSubTypes.find(st => st.id.toString() === expense.sub_type)
    : null;
  const subTypeLabel = subTypeRecord
    ? lang === 'bn'
      ? subTypeRecord.name_bn
      : subTypeRecord.name_en
    : null;

  return (
    <View
      className={cn(
        'bg-white dark:bg-slate-800 rounded-2xl p-4 mb-4 shadow-sm border border-slate-100 dark:border-slate-700',
        className,
      )}
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text
          className="text-lg text-slate-900 dark:text-white flex-1 mr-2"
          numberOfLines={1}
          style={{ fontFamily, fontWeight: 'bold' }}
        >
          {expense.title}
        </Text>
        <Text
          className="text-lg text-rose-500 dark:text-rose-400"
          style={{ fontWeight: 'bold' }}
        >
          ৳{expense.amount.toFixed(2)}
        </Text>
      </View>

      <View className="flex-row items-center mb-1">
        <Tag size={14} color="#94a3b8" />
        <Text
          className="text-sm text-slate-600 dark:text-slate-300 ml-1.5"
          style={{ fontFamily, fontWeight: '500' }}
        >
          {typeLabel}
          {subTypeLabel ? ` → ${subTypeLabel}` : ''}
        </Text>
      </View>

      <View className="flex-row items-center mb-1">
        <Calendar size={14} color="#94a3b8" />
        <Text className="text-sm text-slate-500 dark:text-slate-400 ml-1.5">
          {format(parseISO(expense.date), 'MMM dd, yyyy')}
        </Text>
      </View>

      {expense.description ? (
        <View className="flex-row items-start mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
          <AlignLeft size={14} color="#94a3b8" />
          <Text
            className="text-sm text-slate-500 dark:text-slate-400 flex-1 ml-1.5"
            numberOfLines={2}
            style={{ fontFamily }}
          >
            {expense.description}
          </Text>
        </View>
      ) : null}

      {/* Action Buttons */}
      <View className="flex-row justify-end mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
        <TouchableOpacity
          className="flex-row items-center px-3 py-1.5 rounded-lg bg-primary-100 dark:bg-primary-900/30 mr-2"
          onPress={() => onEdit(expense)}
        >
          <Pencil size={14} color={isDark ? '#6366f1' : '#191970'} />
          <Text className="text-sm font-semibold text-primary-600 dark:text-primary-400 ml-1">
            {t('edit')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/30"
          onPress={handleDelete}
        >
          <Trash2 size={14} color="#ef4444" />
          <Text className="text-sm font-semibold text-rose-600 dark:text-rose-400 ml-1">
            {t('delete')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
