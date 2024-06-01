import React, { useCallback, useState } from 'react';
import { View, Text, Button, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import axios from 'axios';

function Detect() {
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);

  const openImagePicker = useCallback(() => {
    setPrediction(null);
    setImageSource(null);
    const options = {
      title: 'Select Image',
      selectionLimit: 1,
      mediaType: 'photo',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
  
    ImagePicker.launchImageLibrary(options as any, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        // const selectedImage = response.assets[0];
        setImageSource(response.assets[0].uri as any);
        sendImage(response.assets[0].uri  as any);
      }
    });
  }, []);

  const sendImage = async (imageUri: string) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: imageUri.split("/").pop(),
      });
      
      const response = await axios.post('http://18.143.158.39:8000/predict/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setPrediction(response.data.prediction);
    } catch (error) {
        console.error('Error sending image:', error);
    }
  };

  const openCamera = useCallback(() => {
    setPrediction(null);
    setImageSource(null);

    const options = {
      title: 'Take Picture',
      mediaType: 'photo',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
  
    ImagePicker.launchCamera(options as any, (response) => {
      if (response.didCancel) {
        console.log('User cancelled taking picture');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        if (response.assets && response.assets.length > 0) {
          setImageSource(response.assets[0].uri as any);
          sendImage(response.assets[0].uri as any);
        }
      }
    });
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {imageSource && <Image source={{ uri: imageSource }} style={{ width: 200, height: 200, borderRadius: 10, marginBottom: 20 }} />}
      <Text style={{ color: 'black', fontSize: 18, marginBottom: 20 }}>Prediction: {prediction}</Text>
      
      <TouchableOpacity onPress={openImagePicker} style={{ marginBottom: 20 }}>
        <View style={{ backgroundColor: '#3498db', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 }}>
          <Text style={{ color: 'white', fontSize: 16 }}>Select Image</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={openCamera}>
        <View style={{ backgroundColor: '#27ae60', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 }}>
          <Text style={{ color: 'white', fontSize: 16 }}>Open Camera</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default Detect;
