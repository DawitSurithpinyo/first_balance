import { StyleSheet, Text, View } from 'react-native';

import { RecordItem } from '@/interface';
import { useRecordContext } from '@/lib/recordContext';
import { ImageBackground } from 'expo-image';

export default function TabTwoScreen() {
  const {records: listOfRecords, setRecords: setListOfRecords} = useRecordContext();

  var Balance = 0
  var totalSpent = 0
  var totalEarned = 0
  listOfRecords.map((record: RecordItem) => {
    if(record.Value < 0){
      totalSpent += record.Value
    }
    else if(record.Value > 0){
      totalEarned += record.Value
    }
    Balance += record.Value
  })
  
  return (
    // <ParallaxScrollView
    //   headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
    //   headerImage={
    //     <IconSymbol
    //       size={310}
    //       color="#808080"
    //       name="chevron.left.forwardslash.chevron.right"
    //       style={styles.headerImage}
    //     />
    //   }>
    //   <ThemedView style={styles.titleContainer}>
    //     <Text type="title">Explore</Text>
    //   </ThemedView>
    //   <Text>This app includes example code to help you get started.</Text>
    //   <Collapsible title="File-based routing">
    //     <Text>
    //       This app has two screens:{' '}
    //       <Text type="defaultSemiBold">app/(tabs)/index.tsx</Text> and{' '}
    //       <Text type="defaultSemiBold">app/(tabs)/explore.tsx</Text>
    //     </Text>
    //     <Text>
    //       The layout file in <Text type="defaultSemiBold">app/(tabs)/_layout.tsx</Text>{' '}
    //       sets up the tab navigator.
    //     </Text>
    //     <ExternalLink href="https://docs.expo.dev/router/introduction">
    //       <Text type="link">Learn more</Text>
    //     </ExternalLink>
    //   </Collapsible>
    //   <Collapsible title="Android, iOS, and web support">
    //     <Text>
    //       You can open this project on Android, iOS, and the web. To open the web version, press{' '}
    //       <Text type="defaultSemiBold">w</Text> in the terminal running this project.
    //     </Text>
    //   </Collapsible>
    //   <Collapsible title="Images">
    //     <Text>
    //       For static images, you can use the <Text type="defaultSemiBold">@2x</Text> and{' '}
    //       <Text type="defaultSemiBold">@3x</Text> suffixes to provide files for
    //       different screen densities
    //     </Text>
    //     <Image source={require('@/assets/images/react-logo.png')} style={{ alignSelf: 'center' }} />
    //     <ExternalLink href="https://reactnative.dev/docs/images">
    //       <Text type="link">Learn more</Text>
    //     </ExternalLink>
    //   </Collapsible>
    //   <Collapsible title="Custom fonts">
    //     <Text>
    //       Open <Text type="defaultSemiBold">app/_layout.tsx</Text> to see how to load{' '}
    //       <Text style={{ fontFamily: 'SpaceMono' }}>
    //         custom fonts such as this one.
    //       </Text>
    //     </Text>
    //     <ExternalLink href="https://docs.expo.dev/versions/latest/sdk/font">
    //       <Text type="link">Learn more</Text>
    //     </ExternalLink>
    //   </Collapsible>
    //   <Collapsible title="Light and dark mode components">
    //     <Text>
    //       This template has light and dark mode support. The{' '}
    //       <Text type="defaultSemiBold">useColorScheme()</Text> hook lets you inspect
    //       what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
    //     </Text>
    //     <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
    //       <Text type="link">Learn more</Text>
    //     </ExternalLink>
    //   </Collapsible>
    //   <Collapsible title="Animations">
    //     <Text>
    //       This template includes an example of an animated component. The{' '}
    //       <Text type="defaultSemiBold">components/HelloWave.tsx</Text> component uses
    //       the powerful <Text type="defaultSemiBold">react-native-reanimated</Text>{' '}
    //       library to create a waving hand animation.
    //     </Text>
    //     {Platform.select({
    //       ios: (
    //         <Text>
    //           The <Text type="defaultSemiBold">components/ParallaxScrollView.tsx</Text>{' '}
    //           component provides a parallax effect for the header image.
    //         </Text>
    //       ),
    //     })}
    //   </Collapsible>
    // </ParallaxScrollView>

    <View>
      <ImageBackground
        source={require("@/assets/images/dashboard_banner_img.png")}
        style={styles.titleContainer}
      >
      <Text style={styles.titleText}>Welcome to First balance</Text>
      </ImageBackground>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceText}>Your balance: {Balance}</Text>
      </View>
      <View style={styles.EarnedSpentContainer}>
        <View style={styles.earnedSpentBox}>
          <Text style={styles.totalEarnedSpentText}>Total earned: {totalEarned}</Text>
        </View>
        <View style={styles.earnedSpentBox}>
          <Text style={styles.totalEarnedSpentText}>Total spent: {Math.abs(totalSpent)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center'
  },

  titleText: {
    fontSize: 50,
    fontWeight: 'bold',
    color: 'white'
  },

  balanceContainer: {
    backgroundColor: 'darkmagenta',
    padding: 10,
    marginTop: 40,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%',
    alignSelf: 'center',
    borderRadius: 8
  },

  balanceText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white'
  },

  EarnedSpentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20
  },
  
  earnedSpentBox: {
    backgroundColor: 'mediumorchid',
    padding: 10,
    width: '45%',
    alignItems: 'center',
    borderRadius: 8 // round corners
  },
  
  totalEarnedSpentText: {
    fontSize: 35,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center'
  }
});
