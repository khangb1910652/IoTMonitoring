import React, { useRef, useState } from 'react';
import { View, Dimensions, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput, Alert, Button } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import MqttService from '../mqtt/mqttService.js';
import DatePicker from 'react-native-date-picker';
import { BottomSheet } from '@rneui/themed';

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
  const [temperature, setTemperature] = React.useState(Number);
  const [humidity, setHumidity] = React.useState(Number);
  const [chartTemperature, setChartTemperature] = React.useState(data);
  const [chartHumidity, setChartHumidity] = React.useState(data);
  const [timeStamps, setTimeStamps] = React.useState([]);
  const [pumpState, setPumpState] = React.useState(false);
  const [fanState, setFanState] = React.useState(false);
  const [lightState, setLightState] = React.useState(false);
  const [threshold, setThreshold] = React.useState(0);
  const [thresholdInput, setThresholdInput] = React.useState('');
  const [pumpButtonDisabled, setPumpButtonDisabled] = React.useState(false);
  const [fanButtonDisabled, setFanButtonDisabled] = React.useState(false);
  const [lightButtonDisabled, setLightButtonDisabled] = React.useState(false);
  const [pumpCountdown, setCountdown] = React.useState(3);
  const [fanCountdown, setFanCountdown] = React.useState(3);
  const [lightCountdown, setLightCountdown] = React.useState(3);

  const [time, setTime] = React.useState(new Date()); // Changed state name to "time"
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleOpenDatePicker = () => {
    setShowDatePicker(true);
  };

  const handleTimeChange = (newTime: any) => {
    setTime(newTime); // Updated function name and parameters
  };

  const handleConfirmTime = () => {
    setIsVisible(false);
    const setTimePumpStart = time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    publishMessage("esp/settimestartpump", setTimePumpStart.toString());
    console.log(setTimePumpStart)
  };

  const handleCancelTime = () => {
    setShowDatePicker(false);
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

        if (temperature < threshold && !pumpState) {
          togglePumpState();
        } else if (temperature > threshold && pumpState) {
          togglePumpState();
        }
        console.log(temperature, threshold, pumpState)
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
  }, [threshold, pumpState, fanState, lightState]);

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

  const handleThresholdChange = (text: string) => {
    setThresholdInput(text); // Update the threshold input state
  };

  const saveThreshold = () => {
    const newThreshold = parseFloat(thresholdInput);
    if (!isNaN(newThreshold)) {
      setThreshold(newThreshold)
    } else {
      Alert.alert("Invalid Input", "Please enter a valid number!!!")
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView>
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

            <TouchableOpacity style={styles.buttonSetTime} onPress={() => setIsVisible(true)}>
              <Text style={styles.buttonText}>{time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</Text>
            </TouchableOpacity>

            <BottomSheet containerStyle={styles.bottomSheetContainer} isVisible={isVisible} >
              <View style={styles.dateTimePickerContainer}>
                <View style={styles.dateTimePickerWrapper}>
                  <DatePicker
                    date={time}
                    onDateChange={handleTimeChange} // Updated prop name
                    mode="time"
                    locale="vi"
                  />
                  <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmTime}>
                    <Text>Confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setIsVisible(false)}>
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
              onChangeText={handleThresholdChange}
              value={thresholdInput}
              keyboardType="numeric"
              placeholder="Temperature">
            </TextInput>
            <TouchableOpacity style={styles.buttonSave} onPress={saveThreshold}>
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

  }

});

export default Monitor;
