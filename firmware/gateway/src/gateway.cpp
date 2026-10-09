#include <Arduino.h>
#include <ArduinoJson.h>
#include <cstring>

#include "config.h"
#include "mqtt_client.h"

// ==================================================
// CENTRAL GATEWAY
// DATA SIMULATOR + PROCESSOR + MQTT PUBLISHER
// ==================================================

struct NodeData {
  const char* node_id;
  float temp;
  int smoke_adc;
  float smoke_ppm;
  bool smoke_ppm_valid;
  bool flame;
  float ror;
  float fri;
  bool relay;
  bool buzzer;
  const char* status;
  int error_code;
};

// ==================================================
// 1. DU LIEU GIA CUA 2 NODE
// ==================================================

NodeData nodeKitchen = {
  "NODE_KITCHEN_01",
  32.5,
  67,
  0.0,
  false,
  false,
  0.2,
  12,
  false,
  false,
  "NORMAL",
  0
};

NodeData nodeRoom = {
  "NODE_ROOM_02",
  43.8,
  420,
  0.0,
  false,
  false,
  1.1,
  38,
  false,
  false,
  "WARNING",
  0
};

// ==================================================
// 2. CAC NGUONG MO PHONG
// CHI DUNG DE KIEM THU SOFTWARE
// ==================================================

namespace {
  constexpr float TEMP_WARNING = 40.0;
  constexpr float TEMP_FIRE = 60.0;

  constexpr int SMOKE_WARNING_ADC = 350;
  constexpr int SMOKE_FIRE_ADC = 700;

  constexpr float FRI_WARNING = 35.0;
  constexpr float FRI_FIRE = 70.0;

  constexpr int ERROR_OK = 0;
  constexpr int ERROR_TEMP_INVALID = 1;
  constexpr int ERROR_SMOKE_ADC_INVALID = 2;
}

// ==================================================
// 3. DATA PROCESSOR
// ==================================================

void processNodeData(NodeData& node) {
  node.error_code = ERROR_OK;

  // Kiem tra nhiet do
  if (isnan(node.temp) || node.temp < -55.0 || node.temp > 125.0) {
    node.error_code = ERROR_TEMP_INVALID;
  }

  // Kiem tra ADC cua MQ-2
  if (node.smoke_adc < 0 || node.smoke_adc > 4095) {
    node.error_code = ERROR_SMOKE_ADC_INVALID;
  }

  // Khong ket luan NORMAL neu du lieu loi
  if (node.error_code != ERROR_OK) {
    node.status = "SENSOR_ERROR";
    node.relay = false;
    node.buzzer = false;
    return;
  }

  // Danh gia muc do rui ro
  bool fireDetected =
    node.flame ||
    node.temp >= TEMP_FIRE ||
    node.smoke_adc >= SMOKE_FIRE_ADC ||
    node.fri >= FRI_FIRE;

  bool warningDetected =
    node.temp >= TEMP_WARNING ||
    node.smoke_adc >= SMOKE_WARNING_ADC ||
    node.fri >= FRI_WARNING;

  if (fireDetected) {
    node.status = "FIRE";
    node.relay = true;
    node.buzzer = true;
  } else if (warningDetected) {
    node.status = "WARNING";
    node.relay = false;
    node.buzzer = false;
  } else {
    node.status = "NORMAL";
    node.relay = false;
    node.buzzer = false;
  }
}

// ==================================================
// 4. XAC DINH MQTT TOPIC THEO NODE
// ==================================================

const char* getNodeTopic(const char* nodeId) {
  if (strcmp(nodeId, "NODE_KITCHEN_01") == 0) {
    return MQTT_TOPIC_KITCHEN;
  }

  if (strcmp(nodeId, "NODE_ROOM_02") == 0) {
    return MQTT_TOPIC_ROOM;
  }

  return nullptr;
}

// ==================================================
// 5. TAO JSON, IN SERIAL VA PUBLISH MQTT
// ==================================================

void printNodeJson(const NodeData& node) {
  JsonDocument doc;

  doc["node_id"] = node.node_id;
  doc["timestamp"] = millis();

  JsonObject sensors = doc["sensors"].to<JsonObject>();
  sensors["temp"] = node.temp;
  sensors["smoke_adc"] = node.smoke_adc;

  if (node.smoke_ppm_valid) {
    sensors["smoke_ppm"] = node.smoke_ppm;
  } else {
    sensors["smoke_ppm"] = nullptr;
  }

  sensors["flame"] = node.flame;

  JsonObject analytics = doc["analytics"].to<JsonObject>();
  analytics["ror"] = node.ror;
  analytics["fri"] = node.fri;

  JsonObject actuators = doc["actuators"].to<JsonObject>();
  actuators["relay"] = node.relay;
  actuators["buzzer"] = node.buzzer;

  doc["status"] = node.status;
  doc["error_code"] = node.error_code;

  // In JSON ra Serial Monitor
  Serial.println("[OUTPUT] Processed JSON:");
  serializeJsonPretty(doc, Serial);
  Serial.println();

  // Xac dinh topic va gui JSON len MQTT
  const char* topic = getNodeTopic(node.node_id);

  if (topic == nullptr) {
    Serial.println("[MQTT] Publish skipped: unknown node");
    return;
  }

  mqttPublishJson(topic, doc);
}

// ==================================================
// 6. KHOI TAO SIMULATOR
// ==================================================

void simulatorInit() {
  Serial.println();
  Serial.println("================================");
  Serial.println("        CENTRAL GATEWAY");
  Serial.println(" DATA SIMULATOR + PROCESSOR + MQTT");
  Serial.println("================================");
  Serial.println("Configured nodes: 2");
  Serial.println("NODE_KITCHEN_01");
  Serial.println("NODE_ROOM_02");
}

// ==================================================
// 7. MOI CHU KY:
// SIMULATE -> PROCESS -> OUTPUT -> MQTT
// ==================================================

void simulatorUpdate() {
  Serial.println();
  Serial.println("========== GATEWAY CYCLE ==========");

  NodeData* nodes[] = { &nodeKitchen, &nodeRoom };

  for (NodeData* node : nodes) {
    Serial.println();
    Serial.print("[INPUT] ");
    Serial.println(node->node_id);

    // Du lieu gia hien tai
    Serial.print("Temperature: ");
    Serial.println(node->temp);

    Serial.print("Smoke ADC: ");
    Serial.println(node->smoke_adc);

    // Xu ly du lieu
    processNodeData(*node);

    Serial.print("[PROCESSOR] Status: ");
    Serial.println(node->status);

    Serial.print("[PROCESSOR] Error code: ");
    Serial.println(node->error_code);

    // Tao JSON va thu gui len MQTT
    printNodeJson(*node);
  }

  Serial.println("======== END GATEWAY CYCLE ========");
}