// DetailsScreen.tsx
import * as React from 'react';
import { Button, View, Text, NativeSyntheticEvent, NativeTouchEvent } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type DetailsScreenProps = {
  navigation: StackNavigationProp<any>;
}

const DetailsScreen: React.FC<DetailsScreenProps> = ({ navigation }) => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Details Screen</Text>
      <Button
        title="Go to Home"
        onPress={() => navigation.navigate('Home')}
      />
    </View>
  );
}

export default DetailsScreen;
