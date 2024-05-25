// TabScreen2.tsx
import React, { useCallback, useState } from 'react';
import { View, Text, Button, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
// import * as Tflite from 'react-native-tflite-classification';

function Detect() {
  const [imageSource, setImageSource] = useState<string | null>(null);

  const openImagePicker = useCallback(() => {
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
        // Get the first selected image and set it as the image source
        const selectedImage = response.assets[0];
        setImageSource(selectedImage.uri as any);
      }
    });
  }, []);

  const openCamera = useCallback(() => {
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
        // Check if assets exist and it's not empty
        if (response.assets && response.assets.length > 0) {
          const selectedImage = response.assets[0];
          setImageSource(selectedImage.uri as any);
        }
      }
    });
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {imageSource && <Image source={{ uri: imageSource }} style={{ width: 200, height: 200 }} />}
      <TouchableOpacity onPress={openImagePicker}>
        <View style={{ backgroundColor: 'blue', padding: 10, borderRadius: 5, marginBottom: 10 }}>
          <Text style={{ color: 'white' }}>Select Image</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={openCamera}>
        <View style={{ backgroundColor: 'green', padding: 10, borderRadius: 5 }}>
          <Text style={{ color: 'white' }}>Open Camera</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default Detect;
