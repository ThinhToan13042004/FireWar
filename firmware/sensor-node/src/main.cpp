#include <Arduino.h>
#include <ArduinoJson.h>

#include "config.h"
#include "sensors.h"
#include "analytics.h"
#include "rs485_comm.h"

// =========================
// SETUP
// =========================

void setup()
{
    Serial.begin(SERIAL_BAUDRATE);

    // =========================
    // INITIALIZE SENSORS
    // =========================

    sensors_init();

    // =========================
    // INITIALIZE BUZZER
    // =========================

    pinMode(BUZZER_PIN, OUTPUT);

    // Buzzer Active-Low
    // HIGH = OFF

    digitalWrite(BUZZER_PIN, BUZZER_OFF);

    // =========================
    // INITIALIZE RS485
    // =========================

    rs485_init();

    // =========================
    // START MESSAGE
    // =========================

    Serial.println();
    Serial.println("================================");
    Serial.println("      NODE_01 SENSOR TEST");
    Serial.println("      ESP32 + MQ-2 + FLAME");
    Serial.println("      + BUZZER + JSON");
    Serial.println("================================");
}

// =========================
// LOOP
// =========================

void loop()
{
    // =========================
    // 1. READ SENSORS
    // =========================

    SensorData sensorData = sensors_read();

    // =========================
    // 2. ANALYZE DATA
    // =========================

    AnalyticsData analytics =
        analyze_data(sensorData);

    // =========================
    // 3. CONTROL BUZZER
    // =========================

    if (analytics.alarm)
    {
        digitalWrite(BUZZER_PIN, BUZZER_ON);
    }
    else
    {
        digitalWrite(BUZZER_PIN, BUZZER_OFF);
    }

    // =========================
    // 4. CREATE JSON DOCUMENT
    // =========================

    JsonDocument doc;

    // =========================
    // 5. BASIC INFORMATION
    // =========================

    doc["node_id"] = NODE_ID;

    // Tạm thời chưa có NTP
    doc["timestamp"] = 0;

    // =========================
    // 6. SENSOR DATA
    // =========================

    JsonObject sensors =
        doc["sensors"].to<JsonObject>();

    // DS18B20 chưa tích hợp
    sensors["temp"] = nullptr;

    // MQ-2 hiện tại là ADC
    sensors["smoke_adc"] =
        sensorData.mq2Value;

    // Chưa chuyển sang PPM
    sensors["smoke_ppm"] = nullptr;

    // Flame
    sensors["flame"] =
        sensorData.flameDetected;

    // =========================
    // 7. ANALYTICS
    // =========================

    JsonObject analyticsObject =
        doc["analytics"].to<JsonObject>();

    // Chưa triển khai ROR
    analyticsObject["ror"] = nullptr;

    // Chưa triển khai FRI
    analyticsObject["fri"] = nullptr;

    // =========================
    // 8. ACTUATORS
    // =========================

    JsonObject actuators =
        doc["actuators"].to<JsonObject>();

    // Chưa có Relay
    actuators["relay"] = false;

    // Buzzer thực tế
    actuators["buzzer"] =
        analytics.alarm;

    // =========================
    // 9. STATUS
    // =========================

    doc["status"] =
        analytics.status;

    // 0 = không có lỗi
    doc["error_code"] = 0;

    // =========================
    // 10. SEND JSON
    // =========================

    rs485_send_json(doc);

    // =========================
    // LOOP DELAY
    // =========================

    delay(1000);
}