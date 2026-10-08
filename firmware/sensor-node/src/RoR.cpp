#include <Arduino.h>

// --- Cấu hình Thuật toán ---
#define WINDOW_SIZE 10          // Cửa sổ lưu 10 mẫu (10 giây)
#define SAMPLE_INTERVAL 1000    // Chu kỳ lấy mẫu: 1000ms = 1s

// Ngưỡng cảnh báo RoR (°C/s)
#define ROR_THRESHOLD_WARN 0.5
#define ROR_THRESHOLD_ALARM 1.5

// --- Biến toàn cục của Thuật toán ---
float tempBuffer[WINDOW_SIZE];  // Mảng vòng lưu lịch sử nhiệt độ
int bufferIndex = 0;
bool isBufferFull = false;
unsigned long lastSampleTime = 0;

float currentRoR = 0.0;         // Giá trị RoR tính được (°C/s)

/**
 * Khởi tạo bộ đệm nhiệt độ ban đầu
 */
void initRoRAlgorithm(float initialTemp) {
    for (int i = 0; i < WINDOW_SIZE; i++) {
        tempBuffer[i] = initialTemp;
    }
    bufferIndex = 0;
    isBufferFull = false;
    currentRoR = 0.0;
}

/**
 * Hàm tính toán RoR mỗi khi có giá trị nhiệt độ mới từ DHT22
 * @param newTemp Nhiệt độ mới đọc từ cảm biến (°C)
 * @return Giá trị RoR (°C/s)
 */
float calculateRoR(float newTemp) {
    // 1. Cập nhật giá trị mới vào Ring Buffer
    tempBuffer[bufferIndex] = newTemp;
    
    // 2. Lấy giá trị cũ nhất trong cửa sổ
    int oldestIndex = isBufferFull ? (bufferIndex + 1) % WINDOW_SIZE : 0;
    float oldestTemp = tempBuffer[oldestIndex];

    // 3. Tính khoảng thời gian Δt thực tế giữa mẫu mới nhất và cũ nhất
    int timeSpanSeconds = isBufferFull ? WINDOW_SIZE : (bufferIndex + 1);

    // 4. Tính Rate of Rise (ΔT / Δt)
    if (timeSpanSeconds > 1) {
        currentRoR = (newTemp - oldestTemp) / (float)timeSpanSeconds;
    } else {
        currentRoR = 0.0; // Chưa đủ mẫu
    }

    // 5. Tăng con trỏ mảng vòng
    bufferIndex = (bufferIndex + 1) % WINDOW_SIZE;
    if (bufferIndex == 0) {
        isBufferFull = true;
    }

    return currentRoR;
}

/**
 * Đánh giá mức độ nguy hiểm dựa trên RoR
 */
String evaluateRoRStatus(float rorValue) {
    if (rorValue >= ROR_THRESHOLD_ALARM) {
        return "ALARM";
    } else if (rorValue >= ROR_THRESHOLD_WARN) {
        return "WARNING";
    } else {
        return "NORMAL";
    }
}

// --- Ví dụ tích hợp trong loop() của ESP32 ---
void setup() {
    Serial.begin(115200);
    // Giả lập đọc nhiệt độ ban đầu = 30.0 °C
    initRoRAlgorithm(30.0);
}

void loop() {
    unsigned long now = millis();

    // Lấy mẫu đúng chu kỳ 1 giây
    if (now - lastSampleTime >= SAMPLE_INTERVAL) {
        lastSampleTime = now;

        // Giả lập đọc từ DHT22 (thực tế thay bằng dht.readTemperature())
        float currentTemp = 30.0 + (millis() / 5000.0); // Mô phỏng nhiệt độ tăng dần

        // Tính toán RoR
        float ror = calculateRoR(currentTemp);
        String status = evaluateRoRStatus(ror);

        // In kết quả kiểm tra
        Serial.printf("Temp: %.2f °C | RoR: %.2f °C/s | Status: %s\n", 
                      currentTemp, ror, status.c_str());

        // Nếu trạng thái ALARM, thực hiện ngắt Relay tại chỗ ngay lập tức!
        if (status == "ALARM") {
            // digitalWrite(RELAY_PIN, HIGH); // Ngắt điện tại chỗ
            // digitalWrite(BUZZER_PIN, HIGH); // Bật còi
        }
    }
}