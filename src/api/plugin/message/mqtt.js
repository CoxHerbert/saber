export const MQTT_SERVICE = 'ws://192.168.30.102:31273/ws';
export const MQTT_USERNAME = 'dc-dev'; // rabbitmq连接用户名
export const MQTT_PASSWORD = 'dc-dev'; // rabbitmq连接密码
export const SOCKET_SERVICE = 'ws://127.0.0.1:8083/ws'; // netty websocket地址
export const MQTT_MY = 'mqtt://127.0.0.1:5883/ws'; // mica-mqtt服务地址

export const config = () => {
  const host = import.meta.env.VITE_APP_ENV;
  if (host === 'localhost') {
    return {
      MQTT_SERVICE: 'ws://192.168.30.102:31273/ws',
      MQTT_USERNAME: 'dc-dev',
      MQTT_PASSWORD: 'dc-dev',
      HOST: '/dev',
    };
  } else if (host === 'test') {
    return {
      MQTT_SERVICE: 'wss://test.eastwinbip.com/stomp',
      MQTT_USERNAME: 'dc-test',
      MQTT_PASSWORD: 'dc-test',
      HOST: '/test',
    };
  } else if (host === 'production') {
    return {
      MQTT_SERVICE: 'wss://www.eastwinbip.com/stomp',
      MQTT_USERNAME: 'dc-prod',
      MQTT_PASSWORD: 'dc-prod',
      HOST: '/prod',
    };
  }
};
