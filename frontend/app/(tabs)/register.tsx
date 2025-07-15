import BalanceRegister from '@/components/BalanceRegister';
import BalanceRegisterStyle from '@/components/BalanceRegisterStyle';
import { ThemedView } from '@/components/ThemedView';
import { ImageBackground } from 'expo-image';
import { Text } from "react-native";
import Animated from 'react-native-reanimated';

export default function TabTwoScreen() {
return (
    <ThemedView style={BalanceRegisterStyle.mainContainer}>
      <ImageBackground
                    source={require("@/assets/images/dashboard_banner_img.png")}
                    style={BalanceRegisterStyle.titleContainer}>
                  <Text style={BalanceRegisterStyle.titleText}>Register record</Text>
                </ImageBackground>
      <Animated.ScrollView>
        <ThemedView style={BalanceRegisterStyle.content}>
          <BalanceRegister/>
        </ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}