import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { X, Calendar as CalendarIcon, Star } from 'lucide-react-native';
import DatePicker from 'react-native-date-picker';
import { format } from 'date-fns';
import { Loan } from '../db/schema';
import { useI18n } from '../i18n/I18nContext';
import { cssInterop } from 'nativewind';

[X, CalendarIcon, Star].forEach(icon => {
  cssInterop(icon, {
    className: {
      target: 'style',
      nativeStyleToProp: {
        color: true,
      },
    },
  });
});

interface LoanFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (loan: Omit<Loan, 'id'>) => void;
  onUpdate: (loan: Loan) => void;
  initialLoan: Loan | null;
}

const fontFamily = Platform.OS === 'android' ? 'sans-serif' : undefined;

export function LoanForm({
  visible,
  onClose,
  onSubmit,
  onUpdate,
  initialLoan,
}: LoanFormProps) {
  const { t } = useI18n();

  const [type, setType] = useState<'giving' | 'taking'>('giving');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState(new Date());
  const [status, setStatus] = useState<'active' | 'pending' | 'complete'>(
    'active',
  );
  const [rating, setRating] = useState<number>(0);
  const [transactionWay, setTransactionWay] = useState<'cash' | 'bank'>('cash');
  const [bankName, setBankName] = useState('');

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    if (initialLoan) {
      setType(initialLoan.type);
      setName(initialLoan.name);
      setAmount(initialLoan.amount.toString());
      setDescription(initialLoan.description || '');
      setTargetDate(new Date(initialLoan.target_date));
      setStatus(initialLoan.status);
      setRating(initialLoan.rating || 0);
      setTransactionWay(initialLoan.transaction_way);
      setBankName(initialLoan.bank_name || '');
    } else {
      resetForm();
    }
  }, [initialLoan, visible]);

  const resetForm = () => {
    setType('giving');
    setName('');
    setAmount('');
    setDescription('');
    setTargetDate(new Date());
    setStatus('active');
    setRating(0);
    setTransactionWay('cash');
    setBankName('');
  };

  const handleSubmit = () => {
    if (!name.trim() || !amount.trim() || isNaN(Number(amount))) {
      return;
    }

    const loanData = {
      type,
      name: name.trim(),
      amount: Number(amount),
      description: description.trim(),
      target_date: targetDate.toISOString(),
      status,
      rating: status === 'complete' && rating > 0 ? rating : null,
      transaction_way: transactionWay,
      bank_name: transactionWay === 'bank' ? bankName.trim() : null,
    };

    if (initialLoan) {
      onUpdate({ ...loanData, id: initialLoan.id } as Loan);
    } else {
      onSubmit(loanData);
    }
    resetForm();
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={onClose}
        >
          <View
            className="bg-slate-50 dark:bg-slate-900 rounded-t-3xl p-5 pb-8 max-h-[90%]"
            onStartShouldSetResponder={() => true}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text
                className="text-xl font-bold text-slate-900 dark:text-white"
                style={{ fontFamily }}
              >
                {initialLoan ? t('editLoan') : t('addLoan')}
              </Text>
              <TouchableOpacity onPress={onClose} className="p-2 -mr-2">
                <X color="#94a3b8" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              {/* Type Toggle */}
              <Text
                className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                style={{ fontFamily }}
              >
                {t('debtorCreditor')}
              </Text>
              <View className="flex-row bg-slate-200 dark:bg-slate-800 rounded-xl p-1 mb-4">
                <TouchableOpacity
                  className={`flex-1 py-2 items-center rounded-lg ${
                    type === 'giving'
                      ? 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600'
                      : ''
                  }`}
                  onPress={() => setType('giving')}
                >
                  <Text
                    className={`font-semibold ${
                      type === 'giving'
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-500'
                    }`}
                    style={{ fontFamily }}
                  >
                    {t('givingLoan')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-2 items-center rounded-lg ${
                    type === 'taking'
                      ? 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600'
                      : ''
                  }`}
                  onPress={() => setType('taking')}
                >
                  <Text
                    className={`font-semibold ${
                      type === 'taking'
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-500'
                    }`}
                    style={{ fontFamily }}
                  >
                    {t('takingLoan')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Name & Amount */}
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                    style={{ fontFamily }}
                  >
                    Name
                  </Text>
                  <TextInput
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white"
                    placeholder="John Doe"
                    placeholderTextColor="#94a3b8"
                    value={name}
                    onChangeText={setName}
                    style={{ fontFamily }}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                    style={{ fontFamily }}
                  >
                    Amount
                  </Text>
                  <TextInput
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white"
                    placeholder="0"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                    style={{ fontFamily }}
                  />
                </View>
              </View>

              {/* Description */}
              <Text
                className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                style={{ fontFamily }}
              >
                Description
              </Text>
              <TextInput
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white mb-4"
                placeholder="Details..."
                placeholderTextColor="#94a3b8"
                value={description}
                onChangeText={setDescription}
                style={{ fontFamily }}
              />

              {/* Date & Transaction Way */}
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                    style={{ fontFamily }}
                  >
                    {type === 'giving' ? t('payableDate') : t('dueDate')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsDatePickerOpen(true)}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 flex-row items-center justify-between"
                  >
                    <Text
                      className="text-slate-900 dark:text-white"
                      style={{ fontFamily }}
                    >
                      {format(targetDate, 'MMM dd, yyyy')}
                    </Text>
                    <CalendarIcon size={18} color="#94a3b8" />
                  </TouchableOpacity>
                </View>

                <View className="flex-1">
                  <Text
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                    style={{ fontFamily }}
                  >
                    {t('transactionWay')}
                  </Text>
                  <View className="flex-row bg-slate-200 dark:bg-slate-800 rounded-xl p-1 h-[48px]">
                    <TouchableOpacity
                      className={`flex-1 items-center justify-center rounded-lg ${
                        transactionWay === 'cash'
                          ? 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600'
                          : ''
                      }`}
                      onPress={() => setTransactionWay('cash')}
                    >
                      <Text
                        className={`font-semibold text-xs ${
                          transactionWay === 'cash'
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-500'
                        }`}
                        style={{ fontFamily }}
                      >
                        {t('cash')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`flex-1 items-center justify-center rounded-lg ${
                        transactionWay === 'bank'
                          ? 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600'
                          : ''
                      }`}
                      onPress={() => setTransactionWay('bank')}
                    >
                      <Text
                        className={`font-semibold text-xs ${
                          transactionWay === 'bank'
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-500'
                        }`}
                        style={{ fontFamily }}
                      >
                        {t('bank')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Bank Name */}
              {transactionWay === 'bank' && (
                <View className="mb-4">
                  <Text
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                    style={{ fontFamily }}
                  >
                    {t('bankName')}
                  </Text>
                  <TextInput
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white"
                    placeholder="Dutch Bangla Bank etc."
                    placeholderTextColor="#94a3b8"
                    value={bankName}
                    onChangeText={setBankName}
                    style={{ fontFamily }}
                  />
                </View>
              )}

              {/* Status */}
              <Text
                className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
                style={{ fontFamily }}
              >
                {t('status')}
              </Text>
              <View className="flex-row bg-slate-200 dark:bg-slate-800 rounded-xl p-1 mb-4">
                {['active', 'pending', 'complete'].map(s => (
                  <TouchableOpacity
                    key={s}
                    className={`flex-1 py-2 items-center rounded-lg ${
                      status === s
                        ? 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600'
                        : ''
                    }`}
                    onPress={() => setStatus(s as any)}
                  >
                    <Text
                      className={`font-semibold text-xs ${
                        status === s
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-500'
                      }`}
                      style={{ fontFamily }}
                    >
                      {t(s as any)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Rating */}
              {status === 'complete' && (
                <View className="mb-6 items-center">
                  <Text
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3"
                    style={{ fontFamily }}
                  >
                    {t('rating')}
                  </Text>
                  <View className="flex-row gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setRating(star)}
                      >
                        <Star
                          size={32}
                          color={star <= rating ? '#fbbf24' : '#cbd5e1'}
                          fill={star <= rating ? '#fbbf24' : 'transparent'}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <TouchableOpacity
                onPress={handleSubmit}
                className="bg-primary-600 active:bg-primary-700 py-4 rounded-xl items-center justify-center mt-4"
              >
                <Text
                  className="text-white font-bold text-lg"
                  style={{ fontFamily }}
                >
                  {initialLoan ? t('editLoan') : t('addLoan')}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <DatePicker
        modal
        open={isDatePickerOpen}
        date={targetDate}
        mode="date"
        onConfirm={date => {
          setIsDatePickerOpen(false);
          setTargetDate(date);
        }}
        onCancel={() => setIsDatePickerOpen(false)}
      />
    </>
  );
}
