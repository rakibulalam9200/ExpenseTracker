import React, { useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  useColorScheme,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import { generatePDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { useI18n } from '../i18n/I18nContext';
import { PieChart } from 'react-native-gifted-charts';

const fontFamily = Platform.OS === 'android' ? 'sans-serif' : undefined;

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  chartData: any[];
  totalExpense: number;
}

export function ReportModal({ visible, onClose, chartData, totalExpense }: ReportModalProps) {
  const isDark = useColorScheme() === 'dark';
  const { t } = useI18n();
  const viewShotRef = useRef<any>(null);

  const generateHTML = (base64Image: string) => {
    const tableRows = chartData
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 500;">
          <div style="display: flex; align-items: center;">
            <div style="width: 12px; height: 12px; border-radius: 6px; background-color: ${item.color}; margin-right: 8px;"></div>
            ${item.text}
          </div>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #1e293b; font-weight: 700;">
          &#2547;${item.value.toFixed(2)}
        </td>
      </tr>
    `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
            h1 { color: #1e293b; text-align: center; margin-bottom: 40px; }
            .chart-container { text-align: center; margin-bottom: 40px; }
            .chart-image { max-width: 100%; height: auto; max-height: 400px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { background-color: #f8fafc; padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; color: #475569; }
            .total-row { font-size: 20px; font-weight: bold; color: #0f172a; }
            .total-label { text-align: right; padding-right: 20px; }
          </style>
        </head>
        <body>
          <h1>${t('report')}</h1>
          
          <div class="chart-container">
            <img src="data:image/png;base64,${base64Image}" class="chart-image" />
          </div>

          <table>
            <thead>
              <tr>
                <th>${t('type')}</th>
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

      // 1. Capture the chart as a base64 image
      const base64Image = await viewShotRef.current.capture();

      // 2. Generate HTML string
      const htmlContent = generateHTML(base64Image);

      // 3. Create PDF (use default cache directory — always writable on Android)
      const pdfFileName = `ExpenseReport_${Date.now()}`;
      const options = {
        html: htmlContent,
        fileName: pdfFileName,
        base64: false,
      };

      const file = await generatePDF(options);

      console.log('PDF generated:', file);

      if (!file.filePath) {
        throw new Error('PDF file path is empty');
      }

      if (action === 'download') {
        // Save directly to device Downloads folder
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
        // Share via share sheet
        try {
          await Share.open({
            url: `file://${file.filePath}`,
            type: 'application/pdf',
            title: t('report'),
          });
        } catch (shareError: any) {
          // User dismissed the share sheet — not a real error
          console.log('Share dismissed:', shareError?.message);
        }
      }
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      Alert.alert(
        'Error',
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
            {t('report')}
          </Text>
          <TouchableOpacity onPress={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
            <Text className="text-sm font-medium text-slate-600 dark:text-slate-300">{t('close')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
          {/* Chart Section to capture */}
          <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1, result: 'base64' }}>
            <View className="bg-white dark:bg-slate-800 rounded-3xl p-6 items-center border border-slate-100 dark:border-slate-700 mb-6">
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
            </View>
          </ViewShot>

          {/* Breakdown List */}
          <View className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700">
            {chartData.map((item) => (
              <View key={item.text} className="flex-row justify-between items-center py-3 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
                <View className="flex-row items-center flex-1">
                  <View
                    style={{ backgroundColor: item.color }}
                    className="w-3 h-3 rounded-full mr-3"
                  />
                  <Text className="text-base text-slate-700 dark:text-slate-300" style={{ fontFamily, fontWeight: '500' }}>
                    {item.text}
                  </Text>
                </View>
                <Text className="text-base font-bold text-slate-800 dark:text-white">
                  ৳{item.value.toFixed(2)}
                </Text>
              </View>
            ))}

            <View className="flex-row justify-between items-center pt-4 mt-2 border-t border-slate-200 dark:border-slate-600">
              <Text className="text-lg font-bold text-slate-800 dark:text-white">
                {t('total')}
              </Text>
              <Text className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                ৳{totalExpense.toFixed(2)}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex-row">
          <TouchableOpacity
            onPress={() => handleExportPDF('download')}
            className="flex-1 bg-indigo-50 dark:bg-indigo-900/30 py-4 rounded-2xl items-center mr-2"
          >
            <Text className="text-indigo-600 dark:text-indigo-400 font-bold text-base">
              {t('downloadPdf')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleExportPDF('share')}
            className="flex-1 bg-indigo-600 py-4 rounded-2xl items-center ml-2"
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
