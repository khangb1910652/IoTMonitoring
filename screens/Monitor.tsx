import React from 'react';
import { View, Dimensions, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import MqttService from '../mqtt/mqttService.js';

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

        <View style={styles.inputContainer}>
          <Text>Set threshold:</Text>
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
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
  },
  button: {
    backgroundColor: '#DDDDDD',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: screenWidth * 0.9,
    alignItems: 'center',
  },
  buttonSave: {
    backgroundColor: '#DDDDDD',
    padding: 10,
    borderRadius: 5,
    width: screenWidth * 0.2,
    marginLeft: 10,
    alignItems: 'center',
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
    width: screenWidth * 0.3,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    paddingRight: 10,
  },
});

export default Monitor;
