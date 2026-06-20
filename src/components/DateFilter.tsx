import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Filter, X, Calendar as CalendarIcon } from 'lucide-react-native';
import { useI18n } from '../i18n/I18nContext';

// Android-safe font that supports Bangla/Bengali script
const fontFamily = Platform.OS === 'android' ? 'sans-serif' : undefined;

interface DateFilterProps {
  startDate: Date;
  endDate: Date;
  onApply: (start: Date, end: Date) => void;
  onClear: () => void;
  isFiltered: boolean;
}

export function DateFilter({ startDate, endDate, onApply, onClear, isFiltered }: DateFilterProps) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);
  const [pickingDate, setPickingDate] = useState<'start' | 'end' | null>(null);

  const handleOpen = () => {
    setTempStart(startDate);
    setTempEnd(endDate);
    setIsOpen(true);
  };

  const handleApply = () => {
    onApply(tempStart, tempEnd);
    setIsOpen(false);
  };

  return (
    <>
      <View className="flex-row items-center">
        <TouchableOpacity
          className="p-2"
          onPress={handleOpen}
        >
          <Filter size={24} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View
            className="bg-white dark:bg-slate-900 rounded-t-3xl p-5 pb-8"
            onStartShouldSetResponder={() => true}
          >
            <View className="items-center mb-4">
              <View className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mb-4" />
              <Text className="text-xl font-bold text-slate-900 dark:text-white">{t('filter')}</Text>
            </View>

            {/* Start Date */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('startDate')}
              </Text>
              <TouchableOpacity
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 flex-row items-center justify-between"
                onPress={() => setPickingDate('start')}
              >
                <Text className="text-base text-slate-900 dark:text-white">
                  {format(tempStart, 'MMM dd, yyyy')}
                </Text>
                <CalendarIcon size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* End Date */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('endDate')}
              </Text>
              <TouchableOpacity
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 flex-row items-center justify-between"
                onPress={() => setPickingDate('end')}
              >
                <Text className="text-base text-slate-900 dark:text-white">
                  {format(tempEnd, 'MMM dd, yyyy')}
                </Text>
                <CalendarIcon size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="bg-indigo-600 active:bg-indigo-700 py-4 rounded-xl items-center justify-center"
              onPress={handleApply}
            >
              <Text className="text-white font-bold text-lg">{t('applyFilter')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <DatePicker
        modal
        open={pickingDate !== null}
        date={pickingDate === 'start' ? tempStart : tempEnd}
        mode="date"
        onConfirm={(d) => {
          if (pickingDate === 'start') {
            setTempStart(d);
          } else {
            setTempEnd(d);
          }
          setPickingDate(null);
        }}
        onCancel={() => setPickingDate(null)}
      />
    </>
  );
}
