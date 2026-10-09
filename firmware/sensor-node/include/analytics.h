#ifndef ANALYTICS_H
#define ANALYTICS_H

#include "sensors.h"

// =========================
// ANALYTICS DATA
// =========================

struct AnalyticsData
{
    bool smokeDetected;
    bool flameDetected;
    bool alarm;

    const char* status;
};

// =========================
// ANALYTICS FUNCTIONS
// =========================

AnalyticsData analyze_data(const SensorData& sensorData);

#endif