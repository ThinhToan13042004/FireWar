#include <Arduino.h>
#include <ArduinoJson.h>

// =========================
// PIN CONFIGURATION
// =========================
#define MQ2_PIN     34
#define FLAME_PIN   27
#define BUZZER_PIN  25

// Tạm thời dùng để test
#define MQ2_THRESHOLD 750

// ID của node
const char* NODE_ID = "NODE_KITCHEN_01";


void setup() {

    Serial.begin(115200);

    // =========================
    // MQ-2 ADC
    // =========================
    analogReadResolution(12);

    // =========================
    // Flame Sensor
    // =========================
    pinMode(FLAME_PIN, INPUT);

    // =========================
    // Buzzer
    // =========================
    pinMode(BUZZER_PIN, OUTPUT);

    // Buzzer Active-Low
    // HIGH = OFF
    digitalWrite(BUZZER_PIN, HIGH);

    Serial.println();
    Serial.println("================================");
    Serial.println("      NODE_01 SENSOR TEST");
    Serial.println("      ESP32 + MQ-2 + FLAME");
    Serial.println("      + BUZZER + JSON");
    Serial.println("================================");
}


void loop() {

    // =========================
    // 1. READ MQ-2
    // =========================

    int mq2Value = analogRead(MQ2_PIN);


    // =========================
    // 2. READ FLAME SENSOR
    // =========================

    int flameValue = digitalRead(FLAME_PIN);

    // Với module Flame Sensor của bạn:
    // LOW  = phát hiện lửa
    // HIGH = không có lửa

    bool flameDetected = (flameValue == LOW);


    // =========================
    // 3. CHECK SMOKE
    // =========================

    bool smokeDetected = (mq2Value >= MQ2_THRESHOLD);


    // =========================
    // 4. FIRE ALARM
    // =========================

    bool alarm = smokeDetected || flameDetected;


    // =========================
    // 5. BUZZER
    // =========================

    // Buzzer của bạn là Active-Low
    //
    // LOW  = ON
    // HIGH = OFF

    if (alarm) {

        digitalWrite(BUZZER_PIN, LOW);

    } else {

        digitalWrite(BUZZER_PIN, HIGH);
    }


    // =========================
    // 6. STATUS
    // =========================

    const char* status;

    if (alarm) {

        status = "WARNING";

    } else {

        status = "NORMAL";
    }


    // =========================
    // 7. CREATE JSON DOCUMENT
    // =========================

    JsonDocument doc;


    // =========================
    // 8. BASIC INFORMATION
    // =========================

    doc["node_id"] = NODE_ID;

    // Tạm thời chưa có NTP
    // Sau này sẽ thay bằng Unix timestamp thực
    doc["timestamp"] = 0;


    // =========================
    // 9. SENSORS
    // =========================

    JsonObject sensors = doc["sensors"].to<JsonObject>();

    // DS18B20 chưa tích hợp vào code này
    sensors["temp"] = nullptr;

  
    // LƯU Ý:
    // Giá trị MQ-2 hiện tại là ADC,
    // chưa phải ppm thực tế.
    sensors["smoke_adc"] = mq2Value;
    sensors["smoke_ppm"] = nullptr;

    sensors["flame"] = flameDetected;


    // =========================
    // 10. ANALYTICS
    // =========================

    JsonObject analytics = doc["analytics"].to<JsonObject>();

    // Chưa triển khai thuật toán ROR
    analytics["ror"] = nullptr;

    // Chưa triển khai FRI
    analytics["fri"] = nullptr;


    // =========================
    // 11. ACTUATORS
    // =========================

    JsonObject actuators = doc["actuators"].to<JsonObject>();

    // Chưa có Relay
    actuators["relay"] = false;

    // Trạng thái thực tế của Buzzer
    actuators["buzzer"] = alarm;


    // =========================
    // 12. STATUS
    // =========================

    doc["status"] = status;

    // 0 = không có lỗi
    doc["error_code"] = 0;


    // =========================
    // 13. OUTPUT JSON
    // =========================

    serializeJsonPretty(doc, Serial);

    Serial.println();
    Serial.println("--------------------------------");

    delay(1000);
}