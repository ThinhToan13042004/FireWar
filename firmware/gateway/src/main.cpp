
#include <Arduino.h>
#include "mqtt_client.h"

// Khai bao cac ham trong gateway.cpp
void simulatorInit();
void simulatorUpdate();

const unsigned long SIMULATOR_INTERVAL = 5000;
unsigned long lastUpdate = 0;

void setup() {
    Serial.begin(115200);
    delay(1000);

    Serial.println("\n========== GATEWAY START ==========");

    // Khoi tao MQTT va ket noi Wi-Fi
    mqttInit();

    // Khoi tao bo mo phong
    simulatorInit();
  

    lastUpdate = millis();
}

void loop() {
    // Duy tri ket noi MQTT
    mqttLoop();

    // Cap nhat du lieu mo phong moi 5 giay
    unsigned long now = millis();

    if (now - lastUpdate >= SIMULATOR_INTERVAL) {
        lastUpdate = now;
        simulatorUpdate();
    }

    delay(5);
}
