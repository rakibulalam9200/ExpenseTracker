import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Loan } from '../db/schema';
import { format, parseISO } from 'date-fns';
import {
  Star,
  Landmark,
  Banknote,
  Calendar as CalendarIcon,
  User,
} from 'lucide-react-native';
import {
  useColorScheme as useNativeWindColorScheme,
  cssInterop,
} from 'nativewind';
import { useI18n } from '../i18n/I18nContext';

[Star, Landmark, Banknote, CalendarIcon, User].forEach(icon => {
  cssInterop(icon, {
    className: {
      target: 'style',
      nativeStyleToProp: {
        color: true,
      },
    },
  });
});

interface LoanCardProps {
  loan: Loan;
  onEdit: (loan: Loan) => void;
  onDelete: (id: number) => void;
}

export function LoanCard({ loan, onEdit }: LoanCardProps) {
  const { colorScheme } = useNativeWindColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useI18n();

  const isGiving = loan.type === 'giving';

  // Base colors depending on loan type
  const bgClass = isGiving
    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50'
    : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/50';

  const textClass = isGiving
    ? 'text-emerald-700 dark:text-emerald-400'
    : 'text-red-700 dark:text-red-400';

  const iconColor = isGiving
    ? isDark
      ? '#34d399'
      : '#059669' // emerald-400 / emerald-600
    : isDark
    ? '#f87171'
    : '#dc2626'; // red-400 / red-600

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onEdit(loan)}
      className={`p-4 rounded-2xl border mb-3 shadow-sm ${bgClass}`}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-row items-center flex-1">
          <View
            className={`p-2 rounded-full mr-3 ${
              isGiving
                ? 'bg-emerald-100 dark:bg-emerald-900/50'
                : 'bg-red-100 dark:bg-red-900/50'
            }`}
          >
            <User size={20} color={iconColor} />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {loan.name}
            </Text>
            <View className="flex-row items-center mt-1">
              {loan.transaction_way === 'bank' ? (
                <Landmark size={12} color="#94a3b8" />
              ) : (
                <Banknote size={12} color="#94a3b8" />
              )}
              <Text className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                {loan.transaction_way === 'bank'
                  ? loan.bank_name || t('bank')
                  : t('cash')}
              </Text>
            </View>
          </View>
        </View>

        <View className="items-end">
          <Text className={`text-lg font-black ${textClass}`}>
            ৳ {loan.amount}
          </Text>
          <View
            className={`px-2 py-0.5 rounded mt-1 ${
              loan.status === 'complete'
                ? 'bg-slate-200 dark:bg-slate-700'
                : loan.status === 'pending'
                ? 'bg-amber-100 dark:bg-amber-900/50'
                : 'bg-blue-100 dark:bg-blue-900/50'
            }`}
          >
            <Text
              className={`text-[10px] font-bold ${
                loan.status === 'complete'
                  ? 'text-slate-600 dark:text-slate-300'
                  : loan.status === 'pending'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-blue-600 dark:text-blue-400'
              }`}
            >
              {t(loan.status as any).toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {loan.description ? (
        <Text
          className="text-sm text-slate-600 dark:text-slate-300 mb-3"
          numberOfLines={2}
        >
          {loan.description}
        </Text>
      ) : null}

      <View className="flex-row items-center justify-between mt-1 border-t border-slate-200/50 dark:border-slate-700/50 pt-2">
        <View className="flex-row items-center">
          <CalendarIcon size={14} color="#64748b" />
          <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1.5">
            {isGiving ? t('payableDate') : t('dueDate')}:{' '}
            {format(parseISO(loan.target_date), 'MMM dd, yyyy')}
          </Text>
        </View>

        {loan.status === 'complete' && loan.rating ? (
          <View className="flex-row items-center">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                size={12}
                color={star <= loan.rating! ? '#fbbf24' : '#cbd5e1'}
                fill={star <= loan.rating! ? '#fbbf24' : 'transparent'}
              />
            ))}
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
