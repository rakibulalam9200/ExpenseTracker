import React from 'react';
import { View, Text, ActivityIndicator, Platform } from 'react-native';

const fontFamily = Platform.OS === 'android' ? 'sans-serif' : undefined;

export function SkeletonLoader({ isDark }: { isDark: boolean }) {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color={isDark ? "#6366f1" : "#191970"} />
      <Text
        className="text-base text-primary-600 dark:text-primary-500 mt-4"
        style={{ fontFamily }}
      >
        Loading...
      </Text>
    </View>
  );
}
