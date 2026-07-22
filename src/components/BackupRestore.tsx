import React from 'react';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import { Download, Upload, Share2 } from 'lucide-react-native';
import { exportData, importData, shareData } from '../db/backup';
import { useI18n } from '../i18n/I18nContext';

interface BackupRestoreProps {
  onRestoreComplete: () => void;
  onActionComplete?: () => void;
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({
  onRestoreComplete,
  onActionComplete,
}) => {
  const { t, lang } = useI18n();

  const handleBackup = async () => {
    const fileName = await exportData();
    if (fileName) {
      Alert.alert(
        t('backupSuccess'),
        `${t('backupSuccessMessage')}\n\n📁 ${fileName}`,
      );
    } else {
      Alert.alert(t('error'), t('backupFailed'));
    }
    if (onActionComplete) onActionComplete();
  };

  const handleShare = async () => {
    await shareData();
    if (onActionComplete) onActionComplete();
  };

  const handleRestore = () => {
    Alert.alert(t('restoreConfirmTitle'), t('restoreConfirmMessage'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('restoreData'),
        style: 'destructive',
        onPress: async () => {
          const success = await importData();
          if (success) {
            Alert.alert(t('restoreSuccess'), t('restoreSuccessMessage'));
            onRestoreComplete();
          } else {
            Alert.alert(t('error'), t('restoreFailed'));
          }
          if (onActionComplete) onActionComplete();
        },
      },
    ]);
  };

  return (
    <>
      <TouchableOpacity
        onPress={handleBackup}
        className="bg-white dark:bg-slate-800 p-3 rounded-2xl flex-col items-center justify-center border border-slate-100 dark:border-slate-700 mb-3 w-[48%]"
      >
        <View className="bg-primary-100 dark:bg-primary-900/50 p-2.5 rounded-full mb-2">
          <Download color="#6366f1" size={20} />
        </View>
        <Text className="text-xs text-center text-slate-800 dark:text-slate-200 font-bold">
          {t('backupData')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleRestore}
        className="bg-white dark:bg-slate-800 p-3 rounded-2xl flex-col items-center justify-center border border-slate-100 dark:border-slate-700 mb-3 w-[48%]"
      >
        <View className="bg-rose-100 dark:bg-rose-900/50 p-2.5 rounded-full mb-2">
          <Upload color="#e11d48" size={20} />
        </View>
        <Text className="text-xs text-center text-slate-800 dark:text-slate-200 font-bold">
          {t('restoreData')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleShare}
        className="bg-white dark:bg-slate-800 p-3 rounded-2xl flex-col items-center justify-center border border-slate-100 dark:border-slate-700 mb-3 w-[48%]"
      >
        <View className="bg-indigo-100 dark:bg-indigo-900/50 p-2.5 rounded-full mb-2">
          <Share2 color="#4f46e5" size={20} />
        </View>
        <Text className="text-xs text-center text-slate-800 dark:text-slate-200 font-bold">
          {t('shareData') || 'Share Backup'}
        </Text>
      </TouchableOpacity>
    </>
  );
};
