// GardensList.tsx
import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

import Monitor from './Monitor';

// Dữ liệu mẫu
const gardensData = [
  {
    id: 1,
    name: 'Tomato Garden',
    image: require('../assets/tomato_garden.jpg'),
    createdAt: '20/05/2024'
  },
  {
    id: 2,
    name: 'Vườn rau',
    image: require('../assets/ngo_garden.jpg'),
    createdAt: '15/05/2024'
  },
];

type Garden = {
  id: number;
  name: string;
  image: any;
  createdAt: string;
};

type GardensListProps = {
  navigation: StackNavigationProp<any>;
};

const GardensList: React.FC<GardensListProps> = ({ navigation }) => {
  const renderItem = ({ item }: { item: Garden }) => (
    <TouchableOpacity onPress={() => navigation.navigate('Monitor', { gardenId: item.id })}>
      <View style={{ marginBottom: 20 }}>
        <Image source={item.image} style={{ width: 200, height: 150, borderRadius: 10 }} />
        <Text style={{ marginTop: 10, fontWeight: 'bold' }}>{item.name}</Text>
        <Text style={{ marginTop: 5 }}>Ngày tạo: {item.createdAt}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={gardensData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

export default GardensList;
