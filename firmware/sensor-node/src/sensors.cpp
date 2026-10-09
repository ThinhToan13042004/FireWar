#include <Arduino.h>

#include "config.h"
#include "sensors.h"

// =========================
// SENSOR INITIALIZATION
// =========================

void sensors_init()
{
    // MQ-2 ADC
    analogReadResolution(12);

    // Flame Sensor
    pinMode(FLAME_PIN, INPUT);

    Serial.println("[SENSORS] Initialized");
}

// =========================
// READ SENSORS
// =========================

SensorData sensors_read()
{
    SensorData data;

    // =========================
    // READ MQ-2
    // =========================

    data.mq2Value = analogRead(MQ2_PIN);

    // =========================
    // READ FLAME SENSOR
    // =========================

    data.flameValue = digitalRead(FLAME_PIN);

    // LOW = phát hiện lửa
    data.flameDetected =
        (data.flameValue == FLAME_DETECTED_LEVEL);

    return data;
}