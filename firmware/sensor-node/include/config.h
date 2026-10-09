#ifndef CONFIG_H
#define CONFIG_H

// =========================
// NODE CONFIGURATION
// =========================

#define NODE_ID "NODE_KITCHEN_01"

// =========================
// SENSOR PIN CONFIGURATION
// =========================

#define MQ2_PIN     34
#define FLAME_PIN   27

// =========================
// ACTUATOR PIN CONFIGURATION
// =========================

#define BUZZER_PIN  25

// =========================
// SENSOR THRESHOLD
// =========================

#define MQ2_THRESHOLD 110

// =========================
// BUZZER CONFIGURATION
// =========================

#define BUZZER_ON  LOW
#define BUZZER_OFF HIGH

// =========================
// FLAME SENSOR
// =========================

#define FLAME_DETECTED_LEVEL LOW

// =========================
// SERIAL
// =========================

#define SERIAL_BAUDRATE 115200

#endif