import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, PermissionsAndroid, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import storage from '@react-native-firebase/storage';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import * as Notifications from 'expo-notifications';

const App = () => {
  const [location, setLocation] = useState(null);
  const [image, setImage] = useState(null);
  const [temperature, setTemperature] = useState(null);
  const [uvIndex, setUvIndex] = useState(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          alert('Location permission denied');
          return;
        }
      }
      navigator.geolocation.getCurrentPosition(
        position => setLocation(position.coords),
        error => alert(error.message)
      );
    })();
    fetchWeatherData();
    fetchUvIndex();
    setupNotifications();
  }, [location]);

  const fetchWeatherData = async () => {
    if (!location) return;
    const response = await axios.get(`https://api.mosdac.gov.in/weather?lat=${location.latitude}&lon=${location.longitude}`);
    setTemperature(response.data.temperature);
  };

  const fetchUvIndex = async () => {
    if (!location) return;
    const response = await axios.get(`https://api.mosdac.gov.in/uv?lat=${location.latitude}&lon=${location.longitude}`);
    setUvIndex(response.data.uvIndex);
  };

  const setupNotifications = () => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    Notifications.scheduleNotificationAsync({
      content: {
        title: "Severe Weather Alert!",
        body: "Storms are expected in your area.",
      },
      trigger: { seconds: 5 },
    });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.uri);
      uploadImage(result.uri);
    }
  };

  const uploadImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const ref = storage().ref().child(`images/${Date.now()}`);
    await ref.put(blob);
    alert('Image uploaded successfully');
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: location?.latitude || 0,
          longitude: location?.longitude || 0,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="You are here"
          />
        )}
      </MapView>
      <View style={{ padding: 20 }}>
        <Text>Current Temperature: {temperature}°C</Text>
        <Text>UV Index: {uvIndex}</Text>
        <Button title="Pick an image" onPress={pickImage} />
        {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
      </View>
    </View>
  );
};

export default App;
