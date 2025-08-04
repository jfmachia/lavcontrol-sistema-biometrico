import mqtt from "mqtt";

class MQTTService {
  private client: mqtt.MqttClient | null = null;
  private isConnected = false;

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      const mqttUrl = process.env.MQTT_URL || "mqtt://broker.emqx.io";
      this.client = mqtt.connect(mqttUrl);

      this.client.on("connect", () => {
        console.log("MQTT connected");
        this.isConnected = true;
      });

      this.client.on("error", (error) => {
        console.error("MQTT connection error:", error);
        this.isConnected = false;
      });

      this.client.on("close", () => {
        console.log("MQTT connection closed");
        this.isConnected = false;
      });

    } catch (error) {
      console.error("Failed to initialize MQTT:", error);
    }
  }

  public sendCommand(deviceId: string, command: string, data?: any): boolean {
    if (!this.client || !this.isConnected) {
      console.error("MQTT client not connected");
      return false;
    }

    try {
      const topic = `device/${deviceId}/command`;
      const payload = JSON.stringify({
        command,
        data: data || {},
        timestamp: new Date().toISOString(),
      });

      this.client.publish(topic, payload);
      console.log(`MQTT command sent to ${deviceId}:`, command);
      return true;
    } catch (error) {
      console.error("Failed to send MQTT command:", error);
      return false;
    }
  }

  public subscribeToDeviceUpdates(callback: (deviceId: string, status: any) => void) {
    if (!this.client || !this.isConnected) {
      console.error("MQTT client not connected");
      return;
    }

    this.client.subscribe("device/+/status");
    
    this.client.on("message", (topic, message) => {
      try {
        const topicParts = topic.split("/");
        if (topicParts.length === 3 && topicParts[0] === "device" && topicParts[2] === "status") {
          const deviceId = topicParts[1];
          const status = JSON.parse(message.toString());
          callback(deviceId, status);
        }
      } catch (error) {
        console.error("Error processing MQTT message:", error);
      }
    });
  }

  public isClientConnected(): boolean {
    return this.isConnected;
  }
}

export const mqttService = new MQTTService();
