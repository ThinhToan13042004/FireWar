#ifndef SENSORS_H
#define SENSORS_H

// =========================
// SENSOR DATA STRUCTURE
// =========================

struct SensorData
{
    int mq2Value;
    int flameValue;

    bool flameDetected;
};

// =========================
// SENSOR FUNCTIONS
// =========================

void sensors_init();

SensorData sensors_read();

#endif