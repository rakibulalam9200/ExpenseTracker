import React from 'react';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import { Download, Upload } from 'lucide-react-native';
import { exportData, importData } from '../db/backup';
import { useI18n } from '../i18n/I18nContext';

interface BackupRestoreProps {
  onRestoreComplete: () => void;
  onActionComplete?: () => void;
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({ onRestoreComplete, onActionComplete }) => {
  const { t } = useI18n();

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

  const handleRestore = () => {
    Alert.alert(
      t('restoreConfirmTitle'),
      t('restoreConfirmMessage'),
      [
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
      ]
    );
  };

  return (
    <View className="mt-2">
      <TouchableOpacity
        onPress={handleBackup}
        className="bg-white dark:bg-slate-800 p-4 rounded-xl flex-row items-center border border-slate-100 dark:border-slate-700 mb-3"
      >
        <View className="bg-primary-100 dark:bg-primary-900/50 p-2 rounded-lg mr-3">
          <Download color="#6366f1" size={20} />
        </View>
        <Text className="text-base text-slate-800 dark:text-slate-200 font-medium flex-1">
          {t('backupData')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleRestore}
        className="bg-white dark:bg-slate-800 p-4 rounded-xl flex-row items-center border border-slate-100 dark:border-slate-700"
      >
        <View className="bg-rose-100 dark:bg-rose-900/50 p-2 rounded-lg mr-3">
          <Upload color="#e11d48" size={20} />
        </View>
        <Text className="text-base text-slate-800 dark:text-slate-200 font-medium flex-1">
          {t('restoreData')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

