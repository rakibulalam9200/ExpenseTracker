import ReactNativeBlobUtil from 'react-native-blob-util';
import { Platform } from 'react-native';
import { pick, types } from '@react-native-documents/picker';
import {
  getAllExpenses,
  getAllExpenseTypes,
  getAllExpenseSubTypes,
  clearAllData,
  importExpensesBatch,
  importExpenseTypesBatch,
  importExpenseSubTypesBatch,
  seedDefaultTypes
} from './database';

export const exportData = async (): Promise<string | null> => {
  try {
    const expenses = getAllExpenses();
    const expenseTypes = getAllExpenseTypes();
    const expenseSubTypes = getAllExpenseSubTypes();

    const backupData = {
      version: 2,
      timestamp: new Date().toISOString(),
      expenses,
      types: expenseTypes,
      subTypes: expenseSubTypes,
    };

    const jsonString = JSON.stringify(backupData, null, 2);

    const fileName = `ExpenseTracker_Backup_${new Date().getTime()}.json`;

    if (Platform.OS === 'android') {
      // Use MediaCollection API for Android (works with scoped storage on Android 10+)
      // This makes the file visible in the system file manager's Downloads folder
      // Step 1: Write JSON to app cache directory first
      const cachePath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${fileName}`;
      await ReactNativeBlobUtil.fs.writeFile(cachePath, jsonString, 'utf8');

      // Step 2: Copy from cache to public Downloads via MediaStore
      await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
        {
          name: fileName,
          parentFolder: '',
          mimeType: 'application/json',
        },
        'Download',
        cachePath,
      );

      // Clean up cache file
      await ReactNativeBlobUtil.fs.unlink(cachePath);
    } else {
      // iOS: save to Documents folder
      const path = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${fileName}`;
      await ReactNativeBlobUtil.fs.writeFile(path, jsonString, 'utf8');
    }

    return fileName;
  } catch (error) {
    console.error('Backup failed:', error);
    return null;
  }
};

export const importData = async (): Promise<boolean> => {
  try {
    const [res] = await pick({
      type: [types.allFiles],
    });

    if (!res || !res.uri) return false;

    // On Android, the picker returns a content:// URI.
    // Use React Native's fetch API which natively handles content:// URIs.
    let fileContent = '';
    try {
      const response = await fetch(res.uri);
      fileContent = await response.text();
    } catch (fetchErr) {
      console.log('fetch failed, trying ReactNativeBlobUtil', fetchErr);
      // Fallback: try reading via ReactNativeBlobUtil
      fileContent = await ReactNativeBlobUtil.fs.readFile(res.uri, 'utf8');
    }

    const backupData = JSON.parse(fileContent);

    if (backupData && backupData.expenses && backupData.types) {
      clearAllData();
      importExpenseTypesBatch(backupData.types);

      // Import sub-types if present (v2+ backups)
      if (backupData.subTypes && Array.isArray(backupData.subTypes)) {
        importExpenseSubTypesBatch(backupData.subTypes);
      }

      importExpensesBatch(backupData.expenses);
      return true;
    } else {
      console.error('Invalid backup data format');
      return false;
    }
  } catch (err) {
    if (isCancel(err)) {
      console.log('User cancelled picking backup file');
    } else {
      console.error('Restore failed:', err);
    }
    return false;
  }
};
