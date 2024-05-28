import React, { useEffect, useRef, useState } from 'react';
import { View, Dimensions, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput, Alert, Button, Image } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import MqttService from '../mqtt/mqttService.js';
import DatePicker from 'react-native-date-picker';
import { BottomSheet } from '@rneui/themed';
import axios from 'axios';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const mqttService = new MqttService();

const data = {
  labels: ["0"],
  datasets: [
    {
      data: [0],
    },
  ],
};

function Monitor() {

  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  const [temperature, setTemperature] = React.useState(Number);
  const [humidity, setHumidity] = React.useState(Number);
  const [chartTemperature, setChartTemperature] = React.useState(data);
  const [chartHumidity, setChartHumidity] = React.useState(data);
  const [timeStamps, setTimeStamps] = React.useState([]);
  const [pumpState, setPumpState] = React.useState(false);
  const [fanState, setFanState] = React.useState(false);
  const [lightState, setLightState] = React.useState(false);
  const [thresholdPump, setThresholdPump] = React.useState(0);
  const [thresholdInputPump, setThresholdInputPump] = React.useState('');
  const [thresholdFan, setThresholdFan] = React.useState(0);
  const [thresholdInputFan, setThresholdInputFan] = React.useState('');
  const [pumpButtonDisabled, setPumpButtonDisabled] = React.useState(false);
  const [fanButtonDisabled, setFanButtonDisabled] = React.useState(false);
  const [lightButtonDisabled, setLightButtonDisabled] = React.useState(false);
  const [pumpCountdown, setCountdown] = React.useState(3);
  const [fanCountdown, setFanCountdown] = React.useState(3);
  const [lightCountdown, setLightCountdown] = React.useState(3);

  const [timePumpStart, setTimePumpStart] = React.useState(new Date());
  const [timeFanStart, setTimeFanStart] = React.useState(new Date());
  const [timeLightStart, setTimeLightStart] = React.useState(new Date());
  const [timeLightEnd, setTimeLightEnd] = React.useState(new Date());
  const [isVisiblePumpStart, setIsVisiblePumpStart] = useState(false);
  const [isVisibleFanStart, setIsVisibleFanStart] = useState(false);
  const [isVisibleLightStart, setIsVisibleLightStart] = useState(false);
  const [isVisibleLightEnd, setIsVisibleLightEnd] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
          params: {
            q: 'Hanoi', // Tên thành phố
            appid: 'c7708c477d2f608c10981f970fbba909', // Thay YOUR_API_KEY bằng API key của bạn
            units: 'metric' // Đơn vị nhiệt độ (Celsius)
          }
        });
        setForecast(response.data.list);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);


  const getWeatherIcon = (description : any) => {
    switch (description) {
      case 'clear sky':
        return require('../assets/sun.png');
      case 'few clouds':
      case 'scattered clouds':
      case 'broken clouds':
        return require('../assets/cloudy.png');
      case 'shower rain':
      case 'rain':
        return require('../assets/rainy-day.png');
      case 'thunderstorm':
        return require('../assets/storm.png');
      case 'snow':
        return require('../assets/snow.png');
      case 'mist':
        return require('../assets/mist.png');
      default:
        return require('../assets/sun.png');
    }
  };
  console.log(getWeatherIcon('mist'))

  const renderForecast = () => {
    return forecast.map((item : any, index : any) => (
      <View key={index} style={styles.forecastItem}>
        <Text style={styles.forecastTime}>{item.dt_txt}</Text>
        <Image source={getWeatherIcon(item.weather[0].description)} style={{width: 30, height: 30}} />
        <Text style={styles.forecastText}>Temp: {item.main.temp}°C</Text>
        <Text style={styles.forecastText}>Humidity: {item.main.humidity}%</Text>
      </View>
    ));
  };

  const handleTimeChangePumpStart = (newTime: any) => {
    setTimePumpStart(newTime);
  };
  const handleTimeChangeFanStart = (newTime: any) => {
    setTimeFanStart(newTime);
  };
  const handleTimeChangeLightStart = (newTime: any) => {
    setTimeLightStart(newTime);
  };
  const handleTimeChangeLightEnd = (newTime: any) => {
    setTimeLightEnd(newTime);
  };

  const handleConfirmTimePumpStart = () => {
    setIsVisiblePumpStart(false);
    const setTimePumpStart = timePumpStart.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    publishMessage("esp/settimestartpump", setTimePumpStart.toString());
  };
  const handleConfirmTimeFanStart = () => {
    setIsVisibleFanStart(false);
    const setTimeFanStart = timeFanStart.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    publishMessage("esp/settimestartfan", setTimeFanStart.toString());
  };
  const handleConfirmTimeLightStart = () => {
    setIsVisibleLightStart(false);
    const setTimeLightStart = timeLightStart.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    publishMessage("esp/settimestartlight", setTimeLightStart.toString());
  };
  const handleConfirmTimeLightEnd = () => {
    setIsVisibleLightEnd(false);
    const setTimeLightEnd = timeLightEnd.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    publishMessage("esp/settimeendlight", setTimeLightEnd.toString());
  };

  React.useEffect(() => {
    let pumpTimer: string | number | NodeJS.Timeout | undefined;
    if (pumpButtonDisabled) {
      pumpTimer = setTimeout(() => {
        setPumpButtonDisabled(false);
      }, 3000); // 3 giây
    }
    return () => clearTimeout(pumpTimer);
  }, [pumpButtonDisabled]);

  React.useEffect(() => {
    let fanTimer: string | number | NodeJS.Timeout | undefined;
    if (fanButtonDisabled) {
      fanTimer = setTimeout(() => {
        setFanButtonDisabled(false);
      }, 3000); // 3 giây
    }
    return () => clearTimeout(fanTimer);
  }, [fanButtonDisabled]);

  React.useEffect(() => {
    let lightTimer: string | number | NodeJS.Timeout | undefined;
    if (lightButtonDisabled) {
      lightTimer = setTimeout(() => {
        setLightButtonDisabled(false);
      }, 3000); // 3 giây
    }
    return () => clearTimeout(lightTimer);
  }, [lightButtonDisabled]);

  React.useEffect(() => {
    let pumpTimer: string | number | NodeJS.Timeout | undefined;
    if (pumpButtonDisabled) {
      pumpTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            clearInterval(pumpTimer);
            return 3;
          } else {
            return prev - 1;
          }
        });
      }, 1000); // 1 giây
    }
    return () => clearInterval(pumpTimer);
  }, [pumpButtonDisabled]);

  React.useEffect(() => {
    let fanTimer: string | number | NodeJS.Timeout | undefined;
    if (fanButtonDisabled) {
      fanTimer = setInterval(() => {
        setFanCountdown(prev => {
          if (prev === 1) {
            clearInterval(fanTimer);
            return 3;
          } else {
            return prev - 1;
          }
        });
      }, 1000); // 1 giây
    }
    return () => clearInterval(fanTimer);
  }, [fanButtonDisabled]);

  React.useEffect(() => {
    let lightTimer: string | number | NodeJS.Timeout | undefined;
    if (lightButtonDisabled) {
      lightTimer = setInterval(() => {
        setLightCountdown(prev => {
          if (prev === 1) {
            clearInterval(lightTimer);
            return 3;
          } else {
            return prev - 1;
          }
        });
      }, 1000); // 1 giây
    }
    return () => clearInterval(lightTimer);
  }, [lightButtonDisabled]);

  React.useEffect(() => {
    const onDataReceived = (topic: any, payload: any) => {
      const time = new Date().toLocaleTimeString('vi-VN', { hour: 'numeric', minute: '2-digit', second: '2-digit' });

      if (topic === 'esp/temp') {
        setTemperature(parseFloat(payload));
        setChartTemperature(prevData => {
          const newLabels = [...prevData.labels];
          const newData = [...prevData.datasets[0].data];
          newLabels.push(time);
          newData.push(parseFloat(payload));
          if (newLabels.length > 6) {
            newLabels.shift();
            newData.shift();
          }

          return {
            labels: newLabels,
            datasets: [{ data: newData }],
          };
        });

        if (humidity < thresholdPump && !pumpState) {
          togglePumpState();
        } else if (humidity > thresholdPump && pumpState) {
          togglePumpState();
        }
        if (temperature < thresholdFan && !fanState) {
          toggleFanState();
        } else if (temperature > thresholdFan && fanState) {
          toggleFanState();
        }

      } else if (topic === 'esp/hum') {
        setHumidity(parseFloat(payload));
        setChartHumidity(prevData => {
          const newLabels = [...prevData.labels];
          const newData = [...prevData.datasets[0].data];

          newLabels.push(time);
          newData.push(parseFloat(payload));

          if (newLabels.length > 5) {
            newLabels.shift();
            newData.shift();
          }

          return {
            labels: newLabels,
            datasets: [{ data: newData }],
          };
        });
      } else if (topic === 'esp/onoffpump') {
        if (payload === "on") {
          setPumpState(true)
        } else {
          setPumpState(false)
        }
      } else if (topic === 'esp/onofffan') {
        if (payload === "on") {
          setFanState(true)
        } else {
          setFanState(false)
        }
      } else if (topic === 'esp/onofflight') {
        if (payload === "on") {
          setLightState(true)
        } else {
          setLightState(false)
        }
      }
    };
    mqttService.connect(() => {
      console.log('Connected to MQTT broker');
      mqttService.subscribeTopic("esp/temp");
      mqttService.subscribeTopic("esp/hum");
      mqttService.subscribeTopic("esp/onoffpump");
      mqttService.subscribeTopic("esp/onofffan");
      mqttService.subscribeTopic("esp/onofflight");
      mqttService.onMessageArrived(onDataReceived);
    });

    return () => {
      mqttService.disconnect();
    };
  }, [thresholdPump, thresholdFan, pumpState, fanState, lightState]);

  const publishMessage = (topic: any, message: any) => {
    mqttService.sendMessage(topic, message);
    console.log(topic, message)
  };

  const togglePumpState = () => {
    const newState = !pumpState;
    setPumpState(newState);
    publishMessage("esp/onoffpump", newState ? "on" : "off");
  };

  const toggleFanState = () => {
    const newState = !fanState;
    setFanState(newState);
    publishMessage("esp/onofffan", newState ? "on" : "off");
  };

  const toggleLightState = () => {
    const newState = !lightState;
    setLightState(newState);
    publishMessage("esp/onofflight", newState ? "on" : "off");
  };

  const handleThresholdChangePump = (text: string) => {
    setThresholdInputPump(text); // Update the threshold input state
  };

  const handleThresholdChangeFan = (text: string) => {
    setThresholdInputFan(text); // Update the threshold input state
  };

  const saveThresholdPump = () => {
    const newThreshold = parseFloat(thresholdInputPump);
    if (!isNaN(newThreshold)) {
      setThresholdPump(newThreshold)
    } else {
      Alert.alert("Invalid Input", "Please enter a valid number!!!")
    }
  }

  const saveThresholdFan = () => {
    const newThreshold = parseFloat(thresholdInputFan);
    if (!isNaN(newThreshold)) {
      setThresholdFan(newThreshold)
    } else {
      Alert.alert("Invalid Input", "Please enter a valid number!!!")
    }
  }
  return (
    <View style={styles.container}>
      <ScrollView>

        {loading ? (
          <Text style={styles.loadingText}>Loading weather...</Text>
        ) : (
          <View style={styles.weatherSection}>
            <Text style={styles.weatherTitle}>5-Day Forecast</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weatherContainer}>
              {renderForecast()}
            </ScrollView>
          </View>
        )}

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Temperature</Text>
          <LineChart
            data={chartTemperature}
            width={screenWidth * 0.9}
            height={screenHeight * 0.3}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            fromZero={true}
            yAxisSuffix={"°C"}

          />
        </View>
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Humidity</Text>
          <LineChart
            data={chartHumidity}
            width={screenWidth * 0.9}
            height={screenHeight * 0.3}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            fromZero={true}
            yAxisSuffix={"%"}
          />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, pumpState ? styles.activeButton : null]}
            onPress={() => {
              if (!pumpButtonDisabled) {
                togglePumpState();
                setPumpButtonDisabled(true);
              }
            }}
          >
            <Text style={styles.buttonText}>
              {pumpButtonDisabled ? `Wait ${pumpCountdown} seconds` : pumpState ? "Turn Pump Off" : "Turn Pump On"}
            </Text>
          </TouchableOpacity>

          <View style={styles.setTimeContainer}>
            <Text style={styles.textSetTime}>Set time pump start:</Text>

            <TouchableOpacity style={styles.buttonSetTime} onPress={() => setIsVisiblePumpStart(true)}>
              <Text style={styles.buttonText}>{timePumpStart.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</Text>
            </TouchableOpacity>

            <BottomSheet containerStyle={styles.bottomSheetContainer} isVisible={isVisiblePumpStart} >
              <View style={styles.dateTimePickerContainer}>
                <View style={styles.dateTimePickerWrapper}>
                  <DatePicker
                    date={timePumpStart}
                    onDateChange={handleTimeChangePumpStart} // Updated prop name
                    mode="time"
                    locale="vi"
                  />
                  <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmTimePumpStart}>
                    <Text>Confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setIsVisiblePumpStart(false)}>
                    <Text>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BottomSheet>
          </View>

          <View style={styles.setTimeContainer}>
            <Text style={styles.textSetTime}>Set threshold:</Text>
            <TextInput
              style={styles.input}
              onChangeText={handleThresholdChangePump}
              value={thresholdInputPump}
              keyboardType="numeric"
              placeholder="Temperature">
            </TextInput>
            <TouchableOpacity style={styles.buttonSave} onPress={saveThresholdPump}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>

        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, fanState ? styles.activeButton : null]}
            onPress={() => {
              if (!fanButtonDisabled) {
                toggleFanState();
                setFanButtonDisabled(true);
              }
            }}
          >
            <Text style={styles.buttonText}>
              {fanButtonDisabled ? `Wait ${fanCountdown} seconds` : fanState ? "Turn Fan Off" : "Turn Fan On"}
            </Text>
          </TouchableOpacity>

          <View style={styles.setTimeContainer}>
            <Text style={styles.textSetTime}>Set time fan start:</Text>

            <TouchableOpacity style={styles.buttonSetTime} onPress={() => setIsVisibleFanStart(true)}>
              <Text style={styles.buttonText}>{timeFanStart.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</Text>
            </TouchableOpacity>

            <BottomSheet containerStyle={styles.bottomSheetContainer} isVisible={isVisibleFanStart} >
              <View style={styles.dateTimePickerContainer}>
                <View style={styles.dateTimePickerWrapper}>
                  <DatePicker
                    date={timeFanStart}
                    onDateChange={handleTimeChangeFanStart} // Updated prop name
                    mode="time"
                    locale="vi"
                  />
                  <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmTimeFanStart}>
                    <Text>Confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setIsVisibleFanStart(false)}>
                    <Text>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BottomSheet>
          </View>

          <View style={styles.setTimeContainer}>
            <Text style={styles.textSetTime}>Set threshold:</Text>
            <TextInput
              style={styles.input}
              onChangeText={handleThresholdChangeFan}
              value={thresholdInputFan}
              keyboardType="numeric"
              placeholder="Temperature">
            </TextInput>
            <TouchableOpacity style={styles.buttonSave} onPress={saveThresholdFan}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>

        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, lightState ? styles.activeButton : null]}
            onPress={() => {
              if (!lightButtonDisabled) {
                toggleLightState();
                setLightButtonDisabled(true);
              }
            }}
          >
            <Text style={styles.buttonText}>
              {lightButtonDisabled ? `Wait ${lightCountdown} seconds` : lightState ? "Turn Light Off" : "Turn Light On"}
            </Text>
          </TouchableOpacity>

          <View style={styles.setTimeContainer}>
            <Text style={styles.textSetTime}>Set time light start:</Text>

            <TouchableOpacity style={styles.buttonSetTime} onPress={() => setIsVisibleLightStart(true)}>
              <Text style={styles.buttonText}>{timeLightStart.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</Text>
            </TouchableOpacity>

            <BottomSheet containerStyle={styles.bottomSheetContainer} isVisible={isVisibleLightStart} >
              <View style={styles.dateTimePickerContainer}>
                <View style={styles.dateTimePickerWrapper}>
                  <DatePicker
                    date={timeLightStart}
                    onDateChange={handleTimeChangeLightStart} // Updated prop name
                    mode="time"
                    locale="vi"
                  />
                  <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmTimeLightStart}>
                    <Text>Confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setIsVisibleLightStart(false)}>
                    <Text>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BottomSheet>
          </View>

          <View style={styles.setTimeContainer}>
            <Text style={styles.textSetTime}>Set time light end:</Text>

            <TouchableOpacity style={styles.buttonSetTime} onPress={() => setIsVisibleLightEnd(true)}>
              <Text style={styles.buttonText}>{timeLightEnd.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</Text>
            </TouchableOpacity>

            <BottomSheet containerStyle={styles.bottomSheetContainer} isVisible={isVisibleLightEnd} >
              <View style={styles.dateTimePickerContainer}>
                <View style={styles.dateTimePickerWrapper}>
                  <DatePicker
                    date={timeLightEnd}
                    onDateChange={handleTimeChangeLightEnd} // Updated prop name
                    mode="time"
                    locale="vi"
                  />
                  <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmTimeLightEnd}>
                    <Text>Confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setIsVisibleLightEnd(false)}>
                    <Text>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BottomSheet>
          </View>

        </View>

      </ScrollView>
    </View>
  );
}

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(100, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  buttonContainer: {
    width: screenWidth * 0.9,
    // flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    marginBottom: 20,
    borderRadius: 10,
    marginLeft: 'auto',
    marginRight: 'auto'
  },

  button: {
    backgroundColor: '#DDDDDD',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: screenWidth * 0.8,
    alignItems: 'center',
  },
  buttonSave: {
    backgroundColor: '#DDDDDD',
    padding: 10,
    borderRadius: 5,
    textAlign: 'right'
  },
  buttonText: {
    fontSize: 16,
  },
  activeButton: {
    backgroundColor: '#90EE90', // Green color when active
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: screenWidth * 0.9,
    marginBottom: 10
  },
  input: {
    height: 40,
    width: '30%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    paddingRight: 10,
  },
  dateTimePickerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateTimePickerWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  confirmButton: {
    backgroundColor: '#90EE90', // Green color for Confirm button
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#DDDDDD', // Gray color for Cancel button
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  bottomSheetContainer: {
    justifyContent: 'center',
  },
  setTimeContainer: {
    padding: 10,
    // justifyContent: 'center',
    flexDirection: 'row',
    width: screenWidth * 0.8,
    justifyContent: 'space-between'
  },
  textSetTime: {
    fontSize: 16,
    textAlign: 'left',
    padding: 10,
  },
  buttonSetTime: {
    backgroundColor: '#90EE90', // Green color for Confirm button
    padding: 10,
    borderRadius: 5,
  },
  weatherSection: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  weatherContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: '#EFEFEF',
    flexDirection: 'row',
  },
  weatherTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#000', // Màu chữ đậm để dễ nhìn
    textAlign: 'center',
  },
  forecastItem: {
    alignItems: 'center',
    marginRight: 30, // Tăng khoảng cách giữa các mục dự báo
  },
  forecastTime: {
    marginBottom: 5,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000', // Màu chữ đậm để dễ nhìn
  },
  forecastText: {
    fontSize: 14,
    color: '#000', // Màu chữ đậm để dễ nhìn
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: '#000', // Màu chữ đậm để dễ nhìn
  },

});

export default Monitor;
