#include <Arduino.h>

#include "config.h"
#include "rs485_comm.h"

// =========================
// RS485 INITIALIZATION
// =========================

void rs485_init()
{
    // Hiện tại chưa cấu hình MAX485
    // Chỉ sử dụng Serial để test JSON

    Serial.println("[RS485] Communication module initialized");
}

// =========================
// SEND JSON
// =========================

void rs485_send_json(JsonDocument& doc)
{
    serializeJsonPretty(doc, Serial);

    Serial.println();
    Serial.println("--------------------------------");
}