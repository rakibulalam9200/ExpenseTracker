import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Platform } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { format, parseISO } from 'date-fns';
import { Plus, X, Calendar as CalendarIcon, ChevronDown } from 'lucide-react-native';
import { cn } from '../lib/utils';
import { useI18n } from '../i18n/I18nContext';
import { Expense, ExpenseType } from '../db/schema';

// Android-safe font that supports Bangla/Bengali script
const fontFamily = Platform.OS === 'android' ? 'sans-serif' : undefined;

interface ExpenseFormProps {
  onSubmit: (expense: { title: string; amount: number; date: string; type: string; description?: string }) => void;
  onUpdate?: (expense: Expense) => void;
  editingExpense?: Expense | null;
  onCancelEdit?: () => void;
  expenseTypes: ExpenseType[];
}

export function ExpenseForm({ onSubmit, onUpdate, editingExpense, onCancelEdit, expenseTypes }: ExpenseFormProps) {
  const { lang, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const defaultTypeId = expenseTypes.length > 0 ? expenseTypes[0].id.toString() : '';

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [type, setType] = useState(defaultTypeId);
  const [description, setDescription] = useState('');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  const isEditing = !!editingExpense;

  // Populate form when editing
  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title);
      setAmount(editingExpense.amount.toString());
      setDate(parseISO(editingExpense.date));
      setType(editingExpense.type);
      setDescription(editingExpense.description || '');
      setIsOpen(true);
    }
  }, [editingExpense]);

  // Update default type when types load
  useEffect(() => {
    if (!isEditing && expenseTypes.length > 0 && !type) {
      setType(expenseTypes[0].id.toString());
    }
  }, [expenseTypes, isEditing, type]);

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setDate(new Date());
    setType(expenseTypes.length > 0 ? expenseTypes[0].id.toString() : '');
    setDescription('');
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  const handleSubmit = () => {
    if (!title || !amount || !type) {
      return;
    }

    console.log(title, amount, type, description, "type")

    if (isEditing && onUpdate && editingExpense) {
      onUpdate({
        id: editingExpense.id,
        title,
        amount: parseFloat(amount),
        date: date.toISOString(),
        type,
        description: description.trim() || undefined,
      });
    } else {
      onSubmit({
        title,
        amount: parseFloat(amount),
        date: date.toISOString(),
        type,
        description: description.trim() || undefined,
      });
    }

    handleClose();
  };

  // Resolve selected type label from DB
  const selectedType = expenseTypes.find(et => et.id.toString() === type);
  const selectedTypeLabel = selectedType
    ? (lang === 'bn' ? selectedType.name_bn : selectedType.name_en)
    : type;

  return (
    <>
      <TouchableOpacity
        className="bg-indigo-600 active:bg-indigo-700 flex-row items-center justify-center py-3.5 px-6 rounded-full shadow-md mb-6"
        onPress={() => setIsOpen(true)}
      >
        <Plus color="white" size={20} />
        <Text className="text-white font-bold text-base ml-2">{t('addExpense')}</Text>
      </TouchableOpacity>

      <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
        <View className="flex-1 bg-white dark:bg-slate-900">
          <View className="flex-row justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800">
            <Text className="text-xl font-bold text-slate-900 dark:text-white">
              {isEditing ? t('editExpense') : t('newExpense')}
            </Text>
            <TouchableOpacity onPress={handleClose} className="p-2 -mr-2">
              <X color="#94a3b8" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-5" keyboardShouldPersistTaps="handled">
            <View className="mb-5">
              <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('amount')} *
              </Text>
              <TextInput
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-lg text-slate-900 dark:text-white"
                placeholder={t('amountPlaceholder')}
                placeholderTextColor="#94a3b8"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
                style={{ fontFamily }}
              />
            </View>

            <View className="mb-5">
              <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('title')} *
              </Text>
              <TextInput
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-base text-slate-900 dark:text-white"
                placeholder={t('titlePlaceholder')}
                placeholderTextColor="#94a3b8"
                value={title}
                onChangeText={setTitle}
                style={{ fontFamily }}
              />
            </View>

            <View className="flex-row space-x-4 mb-5">
              <View className="flex-1 mr-2">
                <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('date')} *
                </Text>
                <TouchableOpacity
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 flex-row items-center justify-between"
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text className="text-base text-slate-900 dark:text-white">{format(date, 'MMM dd, yyyy')}</Text>
                  <CalendarIcon size={18} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <View className="flex-1 ml-2">
                <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('type')} *
                </Text>
                <TouchableOpacity
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 flex-row items-center justify-between"
                  onPress={() => setShowTypePicker(true)}
                >
                  <Text className="text-base text-slate-900 dark:text-white" numberOfLines={1} style={{ fontFamily }}>
                    {selectedTypeLabel}
                  </Text>
                  <ChevronDown size={18} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-8">
              <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('descriptionOptional')}
              </Text>
              <TextInput
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-base text-slate-900 dark:text-white"
                placeholder={t('descriptionPlaceholder')}
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
                style={{ fontFamily }}
              />
            </View>

            <TouchableOpacity
              className={cn(
                "py-4 rounded-xl items-center justify-center",
                title && amount ? "bg-indigo-600 active:bg-indigo-700" : "bg-indigo-300 dark:bg-indigo-900/50"
              )}
              disabled={!title || !amount}
              onPress={handleSubmit}
            >
              <Text className={cn("font-bold text-lg", title && amount ? "text-white" : "text-indigo-100 dark:text-indigo-400/50")}>
                {isEditing ? t('updateExpense') : t('saveExpense')}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      <DatePicker
        modal
        open={showDatePicker}
        date={date}
        mode="date"
        onConfirm={(d) => {
          setShowDatePicker(false);
          setDate(d);
        }}
        onCancel={() => setShowDatePicker(false)}
      />

      {/* Type Picker Modal */}
      <Modal visible={showTypePicker} transparent animationType="fade" onRequestClose={() => setShowTypePicker(false)}>
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setShowTypePicker(false)}
        >
          <View className="bg-white dark:bg-slate-900 rounded-t-3xl p-5 pb-8 max-h-[70%]">
            <View className="items-center mb-4">
              <View className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mb-4" />
              <Text className="text-xl font-bold text-slate-900 dark:text-white">{t('selectCategory')}</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {expenseTypes.map((et) => {
                const isSelected = type === et.id.toString();
                const label = lang === 'bn' ? et.name_bn : et.name_en;
                const secondaryLabel = lang === 'bn' ? et.name_en : et.name_bn;

                return (
                  <TouchableOpacity
                    key={et.id}
                    className={cn(
                      "py-4 px-5 rounded-xl mb-2",
                      isSelected ? "bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800" : ""
                    )}
                    onPress={() => {
                      setType(et.id.toString());
                      setShowTypePicker(false);
                    }}
                  >
                    <Text
                      className={cn(
                        "text-lg",
                        isSelected ? "text-indigo-700 dark:text-indigo-400 font-bold" : "text-slate-700 dark:text-slate-300"
                      )}
                      style={{ fontFamily }}
                    >
                      {label}
                    </Text>
                    <Text className="text-xs text-slate-400 dark:text-slate-500 mt-0.5" style={{ fontFamily }}>
                      {secondaryLabel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
