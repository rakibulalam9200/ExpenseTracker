import React from 'react';
import { View, Text, ActivityIndicator, Platform } from 'react-native';

const fontFamily = Platform.OS === 'android' ? 'sans-serif' : undefined;

export function SkeletonLoader() {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#6366f1" />
      <Text
        className="text-base text-slate-500 dark:text-slate-400 mt-4"
        style={{ fontFamily }}
      >
        Loading...
      </Text>
    </View>
  );
}
