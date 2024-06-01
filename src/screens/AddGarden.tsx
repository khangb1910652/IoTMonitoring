// NewGardenScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, TouchableOpacity} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import ImagePicker from 'react-native-image-picker';

const NewGardenScreen = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [dateTime, setDateTime] = useState(new Date());
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);


  const saveGarden = () => {
    // Thực hiện lưu garden mới vào cơ sở dữ liệu
    console.log('Tên:', name);
    console.log('Mô tả:', description);
    console.log('Ảnh:', image);
    console.log('Thiết bị:', selectedDevice);
    console.log('Thời gian tạo:', dateTime);
    // Sau khi lưu xong, có thể chuyển người dùng đến màn hình Garden mới tạo
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput
        placeholder="Tên"
        value={name}
        onChangeText={setName}
        style={{ marginBottom: 10, borderBottomWidth: 1 }}
      />
      <TouchableOpacity onPress={() => setShowDateTimePicker(true)} style={{ marginBottom: 10 }}>
        <Text>{dateTime.toString()}</Text>
      </TouchableOpacity>
      {showDateTimePicker && (
        <DateTimePicker
          value={dateTime}
          mode="datetime"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDateTimePicker(false);
            setDateTime(selectedDate || dateTime);
          }}
        />
      )}
      <TextInput
        placeholder="Mô tả"
        value={description}
        onChangeText={setDescription}
        multiline
        style={{ marginBottom: 10, borderBottomWidth: 1 }}
      />
      <Button title="Lưu" onPress={saveGarden} />
    </View>
  );
};

export default NewGardenScreen;
