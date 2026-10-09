#include <Arduino.h>
#include "config.h"
#include "analytics.h"

#ifndef MQ2_THRESHOLD
#error "MQ2_THRESHOLD is NOT defined"
#endif

AnalyticsData analyze_data(const SensorData& sensorData)
{
    AnalyticsData result;

    result.smokeDetected =
        (sensorData.mq2Value >= MQ2_THRESHOLD);

    result.flameDetected =
        sensorData.flameDetected;

    result.alarm =
        result.smokeDetected ||
        result.flameDetected;

    if (result.alarm)
    {
        result.status = "WARNING";
    }
    else
    {
        result.status = "NORMAL";
    }

    return result;
}