import React from 'react';
import { View, Dimensions, StyleSheet, Text, ScrollView, Button } from 'react-native';
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
  const [temperature, setTemperature] = React.useState(null);
  const [humidity, setHumidity] = React.useState(null);
  const [chartTemperature, setChartTemperature] = React.useState(data);
  const [chartHumidity, setChartHumidity] = React.useState(data);
  const [timeStamps, setTimeStamps] = React.useState([]);
  const [pumpState, setPumpState] = React.useState(false);
  const [fanState, setFanState] = React.useState(false);
  const [lightState, setLightState] = React.useState(false);

  React.useEffect(() => {
    const onDataReceived = (topic : any, payload : any) => {
      const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  
      if (topic === 'esp/temp') {
        setTemperature(payload);
        setChartTemperature(prevData => {
          const newLabels = [...prevData.labels];
          const newData = [...prevData.datasets[0].data];
  
          newLabels.push(time);
          newData.push(payload);
  
          if (newLabels.length > 9) {
            newLabels.shift();
            newData.shift();
          }
  
          return {
            labels: newLabels,
            datasets: [{ data: newData }],
          };
        });
      } else {
        setHumidity(payload);
        setChartHumidity(prevData => {
          const newLabels = [...prevData.labels];
          const newData = [...prevData.datasets[0].data];
  
          newLabels.push(time);
          newData.push(payload);
  
          if (newLabels.length > 9) {
            newLabels.shift();
            newData.shift();
          }
  
          return {
            labels: newLabels,
            datasets: [{ data: newData }],
          };
        });
      }
    };
    mqttService.connect(() => {
      console.log('Connected to MQTT broker');
      mqttService.subscribeTopic("esp/temp");
      mqttService.subscribeTopic("esp/hum");

      mqttService.onMessageArrived(onDataReceived);
    });

    return () => {
      mqttService.disconnect();
    };
  }, []);

  const publishMessage = (topic : any, message : any) => {
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
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button title={pumpState ? "Turn Pump Off" : "Turn Pump On"} onPress={togglePumpState} />
          <Button title={fanState ? "Turn Fan Off" : "Turn Fan On"} onPress={toggleFanState} />
          <Button title={lightState ? "Turn Light Off" : "Turn Light On"} onPress={toggleLightState} />
        </View>
      </ScrollView>
    </View>
  );
}

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
  },
});

export default Monitor;
