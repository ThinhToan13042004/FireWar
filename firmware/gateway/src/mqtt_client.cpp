
#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

#include "config.h"
#include "mqtt_client.h"

namespace {
    WiFiClient wifiClient;
    PubSubClient mqttClient(wifiClient);

    unsigned long lastReconnectAttempt = 0;
    const unsigned long RECONNECT_INTERVAL = 5000;
}

bool mqttInit() {
    Serial.println();
    Serial.println("========== MQTT INIT ==========");

    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    Serial.print("[WiFi] Connecting");

    unsigned long startTime = millis();

    while (WiFi.status() != WL_CONNECTED &&
           millis() - startTime < 20000) {
        Serial.print(".");
        delay(500);
    }

    Serial.println();

    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[WiFi] Connection failed");
        return false;
    }

    Serial.print("[WiFi] IP: ");
    Serial.println(WiFi.localIP());

    mqttClient.setServer(
        MQTT_BROKER_IP,
        MQTT_BROKER_PORT
    );

    mqttClient.setBufferSize(2048);

    Serial.println("[MQTT] Configuration complete");
    return true;
}

void mqttLoop() {
    if (WiFi.status() != WL_CONNECTED) {
        return;
    }

    if (mqttClient.connected()) {
        mqttClient.loop();
        return;
    }

    unsigned long now = millis();

    if (now - lastReconnectAttempt < RECONNECT_INTERVAL) {
        return;
    }

    lastReconnectAttempt = now;

    Serial.print("[MQTT] Connecting to ");
    Serial.println(MQTT_BROKER_IP);

    if (mqttClient.connect(MQTT_CLIENT_ID)) {
        Serial.println("[MQTT] Connected");
    } else {
        Serial.print("[MQTT] Failed, state=");
        Serial.println(mqttClient.state());
    }
}

bool mqttPublishJson(
    const char* topic,
    JsonDocument& doc
) {
    if (!mqttClient.connected()) {
        Serial.println("[MQTT] Publish failed: disconnected");
        return false;
    }

    String payload;
    serializeJson(doc, payload);

    bool success = mqttClient.publish(
        topic,
        payload.c_str()
    );

    Serial.print("[MQTT] Topic: ");
    Serial.println(topic);

    if (success) {
        Serial.print("[MQTT] Payload: ");
        Serial.println(payload);
    } else {
        Serial.println("[MQTT] Publish failed");
    }

    return success;
}

bool mqttIsConnected() {
    return mqttClient.connected();
}