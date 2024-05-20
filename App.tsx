// App.tsx
import * as React from 'react';
import { View, Text, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Monitor from './screens/Monitor';
import Detect from './screens/Detect';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="Monitor"
          component={Monitor}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Image 
              source={require('./assets/line-chart.png')} 
              style={{width: 30, height: 30}} />
            ),
          }}
        />
        <Tab.Screen 
          name="Detect" 
          component={Detect} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Image 
              source={require('./assets/eye.png')} 
              style={{width: 30, height: 30}} />
            ),
          }}
          />
      </Tab.Navigator>
    </NavigationContainer>
  );
}