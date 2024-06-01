// Navigation.js
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

import LoginScreen from './Login';
import Monitor from './Monitor';
import Home from './Home';
import Detect from './Detect';
import Gardens from './Gardens';
import AddGarden from './AddGarden';

type HomeScreenProps = {
    navigation: StackNavigationProp<any>;
}


const Stack = createNativeStackNavigator();

function Navigation() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }} // Ẩn header ở màn hình login
                />
                <Stack.Screen
                    name="Monitor"
                    component={Monitor}
                />
                <Stack.Screen
                    name="Home"
                    component={Home}
                    options={({ navigation }) => ({
                        headerLeft: () => (
                            // Add your custom header element here
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text>Log Out</Text>
                            </TouchableOpacity>
                        ),
                    })}
                />
                <Stack.Screen name="Detect" component={Detect} />
                <Stack.Screen name="AddGarden" component={AddGarden} />
                <Stack.Screen
                    name="Gardens"
                    component={Gardens}
                    options={({ navigation }) => ({ // Truyền navigation vào options
                        headerRight: () => (
                            <TouchableOpacity
                                style={{ marginRight: 10 }}
                                onPress={() => navigation.navigate('AddGarden')} // Sử dụng navigation ở đây
                            >
                                <Text style={{ fontWeight: 'bold', color: 'blue' }}>Thêm mới</Text>
                            </TouchableOpacity>
                        ),
                    })}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default Navigation;
