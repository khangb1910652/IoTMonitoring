import AsyncStorage from "@react-native-async-storage/async-storage";
import init from "react_native_mqtt";

init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  sync: {},
});

const options = {
  // host: "broker.emqx.io", 
  // port: 8083
  host: "broker.hivemq.com", 
  port: 8000
  // host: "18.141.55.45",
  // port: 8000
};

class MqttService {
  client = new Paho.MQTT.Client(
    options.host,
    options.port,
    'id_' + parseInt(Math.random()*100000)
  );
  constructor() {}
  connect = (onSuccessCallback) => {
    if (!this.isConnected) {
      
      this.client.connect({
        onSuccess: () => {
          this.isConnected = true;
          if (onSuccessCallback) {
            onSuccessCallback();
          }
        },
        useSSL: false,
        timeout: 3,
        onFailure: this.onFailure,
      });
    } else {
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    }
  };

  disconnect = () => {
    if (this.isConnected) {
      this.client.disconnect();
      this.isConnected = false;
    }
  };

  checkConnect = () => {
    console.log(this.client.isConnected());
  };

  onFailure = (err) => {
    console.error("MQTT Connection failed:", err);
    console.log("log hello");
  };

  onMessageArrived = (callback) => {
    this.client.onMessageArrived = (message) => {
      const topic = message.destinationName;
      const payload = message.payloadString;
      callback(topic, payload);
    };
  };

  onConnectionLost = (responseObject) => {
    while (responseObject.errorCode !== 0) {
      console.log("onConnectionLost:" + responseObject.errorMessage);
    }
  };

  subscribeTopic = (topic) => {
    this.client.subscribe(topic, { qos: 0 });
  };

  sendMessage = (topic, payload) => {
    let message = new Paho.MQTT.Message(payload.toString());
    message.destinationName = topic;
    this.client.send(message);
  };

  getCLient() {
    return this.client;
  }
}

export default MqttService;
