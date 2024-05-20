import React from 'react';
import { View, Dimensions, StyleSheet, Text} from 'react-native';
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

  React.useEffect(() => {
    const onDataReceived = (topic : any, payload : any) => {
      const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  
      if (topic === 'esp/temp') {
        setTemperature(payload);
        setChartTemperature(prevData => {
          // Copy previous data
          const newLabels = [...prevData.labels];
          const newData = [...prevData.datasets[0].data];
  
          // Push new data
          newLabels.push(time);
          newData.push(payload);
  
          // Check if number of data points exceeds 10, remove the first one
          if (newLabels.length > 10) {
            newLabels.shift(); // Remove first label
            newData.shift(); // Remove first data point
          }
  
          return {
            labels: newLabels,
            datasets: [{ data: newData }],
          };
        });
      } else {
        setHumidity(payload);
        setChartHumidity(prevData => {
          // Copy previous data
          const newLabels = [...prevData.labels];
          const newData = [...prevData.datasets[0].data];
  
          // Push new data
          newLabels.push(time);
          newData.push(payload);
  
          // Check if number of data points exceeds 10, remove the first one
          if (newLabels.length > 10) {
            newLabels.shift(); // Remove first label
            newData.shift(); // Remove first data point
          }
  
          return {
            labels: newLabels,
            datasets: [{ data: newData }],
          };
        });
      }
      console.log(topic, payload)
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
  

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Temperature</Text>
        {/* <Text>Temperature: {temperature}</Text> */}
        <LineChart
          data={chartTemperature} // Use new state for chart data
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
          data={chartHumidity} // Use new state for chart data
          width={screenWidth * 0.9}
          height={screenHeight * 0.3}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>
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
    flex: 2,
  },
  chartContainer: {
    flex: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default Monitor;

function setChartData(newData: { labels: string[]; datasets: { data: number[]; }[]; }) {
  throw new Error('Function not implemented.');
}

