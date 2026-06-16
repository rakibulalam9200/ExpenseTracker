import React from 'react';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import { Download, Upload } from 'lucide-react-native';
import { exportData, importData } from '../db/backup';
import { useI18n } from '../i18n/I18nContext';

interface BackupRestoreProps {
  onRestoreComplete: () => void;
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({ onRestoreComplete }) => {
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
          },
        },
      ]
    );
  };

  return (
    <View className="flex-row justify-between mt-4">
      <TouchableOpacity
        onPress={handleBackup}
        className="flex-1 mr-2 bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-xl flex-row items-center justify-center border border-indigo-200 dark:border-indigo-800"
      >
        <Download color="#6366f1" size={20} className="mr-2" />
        <Text className="text-indigo-700 dark:text-indigo-300 font-medium">
          {t('backupData')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleRestore}
        className="flex-1 ml-2 bg-rose-100 dark:bg-rose-900/50 p-3 rounded-xl flex-row items-center justify-center border border-rose-200 dark:border-rose-800"
      >
        <Upload color="#e11d48" size={20} className="mr-2" />
        <Text className="text-rose-700 dark:text-rose-300 font-medium">
          {t('restoreData')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
