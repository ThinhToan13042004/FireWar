#ifndef CONFIG_H 
#define CONFIG_H

// ================= WIFI CONFIG ================= // Thay bằng tên Wi-Fi và mật khẩu thật của bạn 
#define WIFI_SSID "Nguyen Van Nam" 
#define WIFI_PASSWORD "Tailadaicabadaobohuc123"

// ================= MQTT CONFIG ================= // IPv4 của máy tính đang chạy Mosquitto 
#define MQTT_BROKER_IP "192.168.1.5" 
#define MQTT_BROKER_PORT 1883

#define MQTT_CLIENT_ID "ESP32_GATEWAY_01"

// ================= GATEWAY CONFIG ================= 
#define GATEWAY_ID "GW_01"

// MQTT topics của hai Sensor Node 
#define MQTT_TOPIC_KITCHEN "fire/gateway/GW_01/node/NODE_KITCHEN_01" 
#define MQTT_TOPIC_ROOM "fire/gateway/GW_01/node/NODE_ROOM_02"

// Chu kỳ gửi dữ liệu: 5000 ms = 5 giây 
#define MQTT_PUBLISH_INTERVAL 5000

#endif