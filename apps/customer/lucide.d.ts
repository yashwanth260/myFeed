import 'lucide-react-native';
import { StyleProp, ViewStyle } from 'react-native';

declare module 'lucide-react-native' {
  export interface LucideProps {
    style?: StyleProp<ViewStyle>;
  }
}

