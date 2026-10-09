#ifndef RS485_COMM_H
#define RS485_COMM_H

#include <ArduinoJson.h>

// =========================
// RS485 FUNCTIONS
// =========================

void rs485_init();

void rs485_send_json(JsonDocument& doc);

#endif