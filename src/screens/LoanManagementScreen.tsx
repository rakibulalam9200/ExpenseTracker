import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus } from 'lucide-react-native';
import {
  useColorScheme as useNativeWindColorScheme,
  cssInterop,
} from 'nativewind';
import { LoanManagementScreenProps } from '../navigation/types';
import { useI18n } from '../i18n/I18nContext';
import {
  getAllLoans,
  getLoanSummary,
  addLoan,
  updateLoan,
  deleteLoan,
} from '../db/database';
import { Loan } from '../db/schema';
import { LoanCard } from '../components/LoanCard';
import { LoanForm } from '../components/LoanForm';

cssInterop(SafeAreaView, { className: 'style' });
[ArrowLeft, Plus].forEach(icon => {
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

export function LoanManagementScreen({
  navigation,
}: LoanManagementScreenProps) {
  const { colorScheme } = useNativeWindColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useI18n();

  const [loans, setLoans] = useState<Loan[]>([]);
  const [totalGiven, setTotalGiven] = useState(0);
  const [totalTaken, setTotalTaken] = useState(0);

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

  const loadData = useCallback(() => {
    try {
      setLoans(getAllLoans());
      const summary = getLoanSummary();
      setTotalGiven(summary.totalGiven);
      setTotalTaken(summary.totalTaken);
    } catch (e) {
      console.error('Failed to load loans', e);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddLoan = (loanData: Omit<Loan, 'id'>) => {
    addLoan(loanData);
    setIsFormVisible(false);
    loadData();
  };

  const handleUpdateLoan = (loan: Loan) => {
    updateLoan(loan);
    setIsFormVisible(false);
    setEditingLoan(null);
    loadData();
  };

  const handleDeleteLoan = (id: number) => {
    deleteLoan(id);
    setIsFormVisible(false);
    setEditingLoan(null);
    loadData();
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <View className="flex-row items-center px-4 py-4 z-10 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
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
          {t('loanManagement')}
        </Text>
      </View>

      <View className="flex-row px-4 py-4 gap-3">
        <View className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 p-4 rounded-2xl shadow-sm">
          <Text
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1"
            style={{ fontFamily }}
          >
            {t('totalGiven')}
          </Text>
          <Text
            className="text-xl font-black text-emerald-600 dark:text-emerald-300"
            style={{ fontFamily }}
          >
            ৳ {totalGiven}
          </Text>
        </View>

        <View className="flex-1 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 p-4 rounded-2xl shadow-sm">
          <Text
            className="text-xs font-bold text-red-700 dark:text-red-400 mb-1"
            style={{ fontFamily }}
          >
            {t('totalTaken')}
          </Text>
          <Text
            className="text-xl font-black text-red-600 dark:text-red-300"
            style={{ fontFamily }}
          >
            ৳ {totalTaken}
          </Text>
        </View>
      </View>

      <FlatList
        data={loans}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <LoanCard
            loan={item}
            onEdit={loan => {
              setEditingLoan(loan);
              setIsFormVisible(true);
            }}
            onDelete={handleDeleteLoan}
          />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-10 mt-10">
            <Text
              className="text-slate-400 dark:text-slate-500 text-lg"
              style={{ fontFamily }}
            >
              {t('noLoans')}
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        onPress={() => {
          setEditingLoan(null);
          setIsFormVisible(true);
        }}
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary-600 rounded-full items-center justify-center shadow-lg"
      >
        <Plus color="#fff" size={24} />
      </TouchableOpacity>

      <LoanForm
        visible={isFormVisible}
        onClose={() => {
          setIsFormVisible(false);
          setEditingLoan(null);
        }}
        onSubmit={handleAddLoan}
        onUpdate={handleUpdateLoan}
        initialLoan={editingLoan}
      />
    </SafeAreaView>
  );
}
