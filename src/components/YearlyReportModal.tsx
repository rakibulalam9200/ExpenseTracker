import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  useColorScheme,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import { generatePDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { useI18n } from '../i18n/I18nContext';
import { BarChart } from 'react-native-gifted-charts';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { getMonthlyExpensesForYear } from '../db/database';

const fontFamily = Platform.OS === 'android' ? 'sans-serif' : undefined;

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_BN = ['জানু', 'ফেব', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];

interface YearlyReportModalProps {
  visible: boolean;
  onClose: () => void;
}

export function YearlyReportModal({ visible, onClose }: YearlyReportModalProps) {
  const isDark = useColorScheme() === 'dark';
  const { lang, t } = useI18n();
  const viewShotRef = useRef<any>(null);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState<{ month: string; total: number }[]>([]);

  useEffect(() => {
    if (visible) {
      const data = getMonthlyExpensesForYear(selectedYear);
      setMonthlyData(data);
    }
  }, [visible, selectedYear]);

  // Transform data for the bar chart
  const chartData = useMemo(() => {
    const months = lang === 'bn' ? MONTHS_BN : MONTHS_EN;
    const data = [];
    let maxVal = 0;

    const CHART_COLORS = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308',
      '#84cc16', '#22c55e', '#10b981', '#06b6d4',
      '#3b82f6', '#6366f1', '#a855f7', '#ec4899'
    ];

    for (let i = 1; i <= 12; i++) {
      const monthStr = i.toString().padStart(2, '0');
      const found = monthlyData.find((d) => d.month === monthStr);
      const val = found ? found.total : 0;
      if (val > maxVal) maxVal = val;

      data.push({
        value: val,
        label: months[i - 1],
        frontColor: CHART_COLORS[i - 1],
        topLabelComponent: val > 0 ? () => (
          <Text style={{ color: isDark ? '#f1f5f9' : '#0f172a', fontSize: 9, fontWeight: 'bold', marginBottom: 5 }}>
            {val}
          </Text>
        ) : undefined,
        labelTextStyle: {
          color: isDark ? '#94a3b8' : '#64748b',
          fontFamily,
          fontSize: 11,
          fontWeight: '600' as '600'
        },
      });
    }

    // Ensure the chart has a decent max value and add headroom for top labels
    const maxValue = maxVal > 0 ? maxVal * 1.2 : 100;

    return { data, maxValue };
  }, [monthlyData, lang, isDark]);

  const totalExpense = useMemo(() => {
    return monthlyData.reduce((acc, curr) => acc + curr.total, 0);
  }, [monthlyData]);

  const generateHTML = (base64Image: string) => {
    const months = lang === 'bn' ? MONTHS_BN : MONTHS_EN;
    let tableRows = '';

    for (let i = 0; i < 12; i++) {
      const val = chartData.data[i].value;
      if (val > 0) {
        tableRows += `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 500;">
            ${months[i]}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #1e293b; font-weight: 700;">
            &#2547;${val.toFixed(2)}
          </td>
        </tr>`;
      }
    }

    // Add empty state to table if no expenses
    if (totalExpense === 0) {
      tableRows += `<tr><td colspan="2" style="text-align: center; padding: 20px; color: #64748b;">${t('noChartData') || 'No expenses for this year.'}</td></tr>`;
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
            h1 { color: #1e293b; text-align: center; margin-bottom: 10px; }
            h2 { color: #475569; text-align: center; margin-bottom: 40px; font-weight: 400; }
            .chart-container { text-align: center; margin-bottom: 40px; }
            .chart-image { max-width: 100%; height: auto; max-height: 400px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { background-color: #f8fafc; padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; color: #475569; }
            .total-row { font-size: 20px; font-weight: bold; color: #0f172a; }
            .total-label { text-align: right; padding-right: 20px; }
          </style>
        </head>
        <body>
          <h1>${t('yearlyReport')}</h1>
          <h2>${t('year')}: ${selectedYear}</h2>
          
          <div class="chart-container">
            <img src="data:image/png;base64,${base64Image}" class="chart-image" />
          </div>

          <table>
            <thead>
              <tr>
                <th>${t('months') || 'Month'}</th>
                <th style="text-align: right;">${t('amount')}</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
            <tfoot>
              <tr>
                <td class="total-label total-row">${t('total')}</td>
                <td class="total-row" style="text-align: right;">&#2547;${totalExpense.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </body>
      </html>
    `;
  };

  const handleExportPDF = async (action: 'download' | 'share') => {
    try {
      if (!viewShotRef.current || !viewShotRef.current.capture) {
        throw new Error('ViewShot capture not available');
      }

      // Capture the chart
      const base64Image = await viewShotRef.current.capture();

      // Generate HTML
      const htmlContent = generateHTML(base64Image);

      const pdfFileName = `YearlyReport_${selectedYear}_${Date.now()}`;
      const options = {
        html: htmlContent,
        fileName: pdfFileName,
        base64: false,
      };

      const file = await generatePDF(options);

      if (!file.filePath) {
        throw new Error('PDF file path is empty');
      }

      if (action === 'download') {
        if (Platform.OS === 'android') {
          await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
            {
              name: `${pdfFileName}.pdf`,
              parentFolder: '',
              mimeType: 'application/pdf',
            },
            'Download',
            file.filePath,
          );
        }
        Alert.alert('✅', t('pdfSaved') || 'PDF saved to Downloads folder.');
      } else {
        try {
          await Share.open({
            url: `file://${file.filePath}`,
            type: 'application/pdf',
            title: `${t('yearlyReport')} - ${selectedYear}`,
          });
        } catch (shareError: any) {
          console.log('Share dismissed:', shareError?.message);
        }
      }
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      Alert.alert(
        t('error') || 'Error',
        `Failed to generate PDF: ${error?.message || 'Unknown error'}. Please try again.`,
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white dark:bg-slate-900">
        {/* Header */}
        <View className="flex-row justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
          <Text className="text-xl font-bold text-slate-800 dark:text-white">
            {t('yearlyReport')}
          </Text>
          <TouchableOpacity onPress={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
            <Text className="text-sm font-medium text-slate-600 dark:text-slate-300">{t('close')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
          {/* Year Selector */}
          <View className="flex-row justify-center items-center mb-8">
            <TouchableOpacity
              onPress={() => setSelectedYear(prev => prev - 1)}
              className="p-3 bg-primary-50 dark:bg-primary-900/40 rounded-full"
            >
              <ChevronLeft color="#00AFCD" size={24} />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-primary-600 dark:text-primary-400 mx-8">
              {selectedYear}
            </Text>
            <TouchableOpacity
              onPress={() => setSelectedYear(prev => prev + 1)}
              className="p-3 bg-primary-50 dark:bg-primary-900/40 rounded-full"
            >
              <ChevronRight color="#00AFCD" size={24} />
            </TouchableOpacity>
          </View>

          {/* Chart Section */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1, result: 'base64' }}>
              <View className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700" style={{ minWidth: 380 }}>
                {totalExpense > 0 ? (
                  <View className="">
                    <BarChart
                      data={chartData.data}
                      barWidth={30}
                      spacing={12}
                      // roundedTop
                      xAxisThickness={1}
                      yAxisThickness={1}
                      xAxisColor={isDark ? '#334155' : '#cbd5e1'}
                      yAxisColor={isDark ? '#334155' : '#cbd5e1'}
                      yAxisTextStyle={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }}
                      noOfSections={5}
                      maxValue={chartData.maxValue}
                      hideRules
                      initialSpacing={10}
                      width={500}
                      height={280}
                      yAxisLabelWidth={35}
                      isAnimated
                      animationDuration={800}
                    />
                  </View>
                ) : (
                  <View className="py-12 items-center justify-center min-w-[340px]">
                    <Text className="text-slate-400 dark:text-slate-500 font-medium text-base">
                      {t('noChartData')}
                    </Text>
                  </View>
                )}

                <View className="flex-row justify-between items-center pt-6 mt-6 border-t border-slate-100 dark:border-slate-700">
                  <Text className="text-lg font-bold text-slate-800 dark:text-white">
                    {t('total')}
                  </Text>
                  <Text className="text-xl font-bold text-primary-600 dark:text-primary-400">
                    ৳{totalExpense.toFixed(2)}
                  </Text>
                </View>
              </View>
            </ViewShot>
          </ScrollView>

          {/* Detailed List */}
          <View className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 mb-6">
            {chartData.data.map((item, idx) => {
              if (item.value === 0) return null;
              return (
                <View key={idx} className="flex-row justify-between items-center py-3 border-b border-slate-50 dark:border-slate-700/50">
                  <Text className="text-base text-slate-700 dark:text-slate-300 font-medium" style={{ fontFamily }}>
                    {item.label}
                  </Text>
                  <Text className="text-base font-bold text-slate-800 dark:text-white">
                    ৳{item.value.toFixed(2)}
                  </Text>
                </View>
              );
            })}
            {totalExpense === 0 && (
              <Text className="text-center text-slate-400 py-4">{t('noChartData')}</Text>
            )}
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex-row">
          <TouchableOpacity
            onPress={() => handleExportPDF('download')}
            className="flex-1 bg-primary-50 dark:bg-primary-900/30 py-4 rounded-2xl items-center mr-2"
          >
            <Text className="text-primary-600 dark:text-primary-400 font-bold text-base">
              {t('downloadPdf')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleExportPDF('share')}
            className="flex-1 bg-primary-600 py-4 rounded-2xl items-center ml-2"
          >
            <Text className="text-white font-bold text-base">
              {t('sharePdf')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
