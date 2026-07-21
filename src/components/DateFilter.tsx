import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
  useColorScheme,
  ScrollView,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { format, startOfMonth, endOfMonth, setYear, setMonth } from 'date-fns';
import {
  Filter,
  X,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import { useI18n } from '../i18n/I18nContext';
import {
  useColorScheme as useNativeWindColorScheme,
  cssInterop,
} from 'nativewind';

// Android-safe font that supports Bangla/Bengali script
const fontFamily = Platform.OS === 'android' ? 'sans-serif' : undefined;

interface DateFilterProps {
  startDate: Date;
  endDate: Date;
  onApply: (start: Date, end: Date) => void;
  onClear: () => void;
  isFiltered: boolean;
}

export function DateFilter({
  startDate,
  endDate,
  onApply,
  onClear,
  isFiltered,
}: DateFilterProps) {
  const { colorScheme } = useNativeWindColorScheme();
  const systemColorScheme = useColorScheme();
  const isDark =
    colorScheme === 'dark' ||
    ((colorScheme as any) === 'system' && systemColorScheme === 'dark');
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'month' | 'custom'>('month');

  // Custom range state
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);
  const [pickingDate, setPickingDate] = useState<'start' | 'end' | null>(null);

  // Month & Year state
  const [selectedYear, setSelectedYear] = useState(startDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(startDate.getMonth());

  const handleOpen = () => {
    setTempStart(startDate);
    setTempEnd(endDate);
    setSelectedYear(startDate.getFullYear());
    setSelectedMonth(startDate.getMonth());
    setIsOpen(true);
  };

  const handleApply = () => {
    if (activeTab === 'month') {
      let date = new Date(selectedYear, selectedMonth, 1);
      onApply(startOfMonth(date), endOfMonth(date));
    } else {
      onApply(tempStart, tempEnd);
    }
    setIsOpen(false);
  };

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  return (
    <>
      <View className="flex-row items-center">
        <TouchableOpacity className="p-2" onPress={handleOpen}>
          <Filter size={24} color={isDark ? '#6366f1' : '#191970'} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View
            className="bg-white dark:bg-slate-900 rounded-t-3xl p-5 pb-8 max-h-[90%]"
            onStartShouldSetResponder={() => true}
          >
            <View className="items-center mb-4">
              <View className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mb-4" />
              <Text
                className="text-xl font-bold text-slate-900 dark:text-white"
                style={{ fontFamily }}
              >
                {t('filter')}
              </Text>
            </View>

            {/* Tabs */}
            <View className="flex-row bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-6">
              <TouchableOpacity
                className={`flex-1 py-2 items-center rounded-lg ${
                  activeTab === 'month'
                    ? 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600'
                    : ''
                }`}
                onPress={() => setActiveTab('month')}
              >
                <Text
                  className={`font-semibold ${
                    activeTab === 'month'
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                  style={{ fontFamily }}
                >
                  {t('selectMonthYear')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2 items-center rounded-lg ${
                  activeTab === 'custom'
                    ? 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600'
                    : ''
                }`}
                onPress={() => setActiveTab('custom')}
              >
                <Text
                  className={`font-semibold ${
                    activeTab === 'custom'
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                  style={{ fontFamily }}
                >
                  {t('customRange')}
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'month' ? (
              <View className="mb-6">
                <View className="flex-row justify-between items-center mb-4">
                  <TouchableOpacity
                    onPress={() => setSelectedYear(y => y - 1)}
                    className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"
                  >
                    <ChevronLeft color={isDark ? '#fff' : '#000'} size={20} />
                  </TouchableOpacity>
                  <Text
                    className="text-xl font-bold text-slate-900 dark:text-white"
                    style={{ fontFamily }}
                  >
                    {selectedYear}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setSelectedYear(y => y + 1)}
                    className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"
                  >
                    <ChevronRight color={isDark ? '#fff' : '#000'} size={20} />
                  </TouchableOpacity>
                </View>
                <View className="flex-row flex-wrap justify-between">
                  {months.map((m, index) => (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setSelectedMonth(index)}
                      className={`w-[30%] py-3 mb-3 items-center rounded-xl border ${
                        selectedMonth === index
                          ? 'bg-primary-600 border-primary-600'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <Text
                        className={`font-semibold ${
                          selectedMonth === index
                            ? 'text-white'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                        style={{ fontFamily }}
                      >
                        {m}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <View className="mb-6">
                <View className="mb-4">
                  <Text
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                    style={{ fontFamily }}
                  >
                    {t('startDate')}
                  </Text>
                  <TouchableOpacity
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 flex-row items-center justify-between"
                    onPress={() => setPickingDate('start')}
                  >
                    <Text
                      className="text-base text-slate-900 dark:text-white"
                      style={{ fontFamily }}
                    >
                      {tempStart
                        ? format(new Date(tempStart), 'MMM dd, yyyy')
                        : ''}
                    </Text>
                    <CalendarIcon size={18} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
                <View className="mb-2">
                  <Text
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                    style={{ fontFamily }}
                  >
                    {t('endDate')}
                  </Text>
                  <TouchableOpacity
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 flex-row items-center justify-between"
                    onPress={() => setPickingDate('end')}
                  >
                    <Text
                      className="text-base text-slate-900 dark:text-white"
                      style={{ fontFamily }}
                    >
                      {tempEnd ? format(new Date(tempEnd), 'MMM dd, yyyy') : ''}
                    </Text>
                    <CalendarIcon size={18} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity
              className="bg-primary-600 active:bg-primary-700 py-4 rounded-xl items-center justify-center mt-2"
              onPress={handleApply}
            >
              <Text
                className="text-white font-bold text-lg"
                style={{ fontFamily }}
              >
                {t('applyFilter')}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <DatePicker
        modal
        open={pickingDate !== null}
        date={pickingDate === 'start' ? new Date(tempStart) : new Date(tempEnd)}
        mode="date"
        onConfirm={d => {
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
