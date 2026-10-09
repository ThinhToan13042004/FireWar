
#ifndef MQTT_CLIENT_H
#define MQTT_CLIENT_H

#include <Arduino.h>
#include <ArduinoJson.h>

bool mqttInit();
void mqttLoop();

bool mqttPublishJson(
    const char* topic,
    JsonDocument& doc
);

bool mqttIsConnected();

#endif