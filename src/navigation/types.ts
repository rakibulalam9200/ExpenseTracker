import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  Settings: { filterStart: string; filterEnd: string };
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type SettingScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;
