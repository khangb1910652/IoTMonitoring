// HomeScreen.tsx
import React from 'react';
import { View, Button } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Detect from './Detect';
import Gardens from './Gardens';

type HomeScreenProps = {
    navigation: StackNavigationProp<any>;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  return (
    <View>
      <Button
        title="Gardens"
        onPress={() => navigation.navigate('Gardens')}
      />
      <Button
        title="Detect"
        onPress={() => navigation.navigate('Detect')}
      />
      {/* <Button
        title="Logout"
        onPress={() => navigation.navigate('Login')}
      /> */}
    </View>
  );
};

export default HomeScreen;
