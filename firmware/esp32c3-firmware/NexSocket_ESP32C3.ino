/*
 * =========================================================================================
 * NexSocket — ESP32-C3 Super Mini Smart Outlet Firmware
 * ADET211 Final Project · Bluetooth Low Energy (BLE) GATT Peripheral
 * 
 * Hardware:
 *   - ESP32-C3 Super Mini RISC-V Microcontroller
 *   - 2-Channel Relay Module (or 2x LEDs with 220-330 ohm current limiting resistors)
 * 
 * GPIO Pin Mapping (Safe non-strapping pins):
 *   - GPIO 4: Outlet / Relay Channel 1 (or LED 1)
 *   - GPIO 5: Outlet / Relay Channel 2 (or LED 2)
 *   - GPIO 8: Built-in status LED (ESP32-C3 Super Mini on-board LED, active LOW)
 * 
 * BLE GATT Specification:
 *   - Device Name: SMART_OUTLET_01
 *   - Service UUID: 12345678-1234-5678-1234-56789abcdef0
 *   - Command Char (Write): 12345678-1234-5678-1234-56789abcdef1
 *   - Status Char (Notify/Read): 12345678-1234-5678-1234-56789abcdef2
 * 
 * Command Protocol (7 Commands):
 *   - 0x01: Outlet 1 ON
 *   - 0x02: Outlet 1 OFF
 *   - 0x03: Outlet 2 ON
 *   - 0x04: Outlet 2 OFF
 *   - 0x05: Turn All Outlets OFF (Master Shutoff)
 *   - 0x06: Turn All Outlets ON (Master Power)
 *   - 0x07: Query Device Status (GET_STATUS)
 * 
 * Status Byte Format (2-bit mask):
 *   - Bit 0: Outlet 1 state (0 = OFF, 1 = ON)
 *   - Bit 1: Outlet 2 state (0 = OFF, 1 = ON)
 *   - 0x00 = Both OFF, 0x01 = Outlet 1 ON, 0x02 = Outlet 2 ON, 0x03 = Both ON
 * =========================================================================================
 */

#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// -----------------------------------------------------------------------------
// Pin Configuration
// -----------------------------------------------------------------------------
#define PIN_RELAY_1       4     // GPIO 4 -> Relay Channel 1 / LED 1
#define PIN_RELAY_2       5     // GPIO 5 -> Relay Channel 2 / LED 2
#define PIN_STATUS_LED    8     // GPIO 8 -> On-board LED on ESP32-C3 Super Mini

// Active Level Configuration:
// Most 5V/3.3V relay boards are ACTIVE-LOW (LOW energizes relay coil, HIGH cuts power).
// If testing with bare breadboard LEDs connected to GND, change this to HIGH.
#define RELAY_ACTIVE_LEVEL   LOW
#define RELAY_INACTIVE_LEVEL HIGH

// -----------------------------------------------------------------------------
// BLE GATT UUIDs (Exact 128-bit Match with Web Application)
// -----------------------------------------------------------------------------
#define DEVICE_NAME             "SMART_OUTLET_01"
#define SERVICE_UUID            "12345678-1234-5678-1234-56789abcdef0"
#define COMMAND_CHAR_UUID       "12345678-1234-5678-1234-56789abcdef1"
#define STATUS_CHAR_UUID        "12345678-1234-5678-1234-56789abcdef2"

// -----------------------------------------------------------------------------
// Command Protocol Definitions
// -----------------------------------------------------------------------------
#define CMD_OUTLET_1_ON   0x01
#define CMD_OUTLET_1_OFF  0x02
#define CMD_OUTLET_2_ON   0x03
#define CMD_OUTLET_2_OFF  0x04
#define CMD_ALL_OFF       0x05
#define CMD_ALL_ON        0x06
#define CMD_GET_STATUS    0x07

// -----------------------------------------------------------------------------
// Global State Variables
// -----------------------------------------------------------------------------
static bool outlet1_state = false;
static bool outlet2_state = false;
static bool device_connected = false;
static bool old_device_connected = false;

static BLEServer* pServer = nullptr;
static BLECharacteristic* pCommandCharacteristic = nullptr;
static BLECharacteristic* pStatusCharacteristic = nullptr;

// -----------------------------------------------------------------------------
// Helper: Calculate 2-bit status mask byte
// -----------------------------------------------------------------------------
uint8_t getStatusByte() {
  uint8_t mask = 0x00;
  if (outlet1_state) mask |= 0x01;
  if (outlet2_state) mask |= 0x02;
  return mask;
}

// -----------------------------------------------------------------------------
// Physical Relay Hardware Update
// -----------------------------------------------------------------------------
void applyRelayStates() {
  digitalWrite(PIN_RELAY_1, outlet1_state ? RELAY_ACTIVE_LEVEL : RELAY_INACTIVE_LEVEL);
  digitalWrite(PIN_RELAY_2, outlet2_state ? RELAY_ACTIVE_LEVEL : RELAY_INACTIVE_LEVEL);
}

// -----------------------------------------------------------------------------
// Broadcast status byte to paired client over GATT
// -----------------------------------------------------------------------------
void broadcastStatus() {
  if (!pStatusCharacteristic) return;
  uint8_t statusByte = getStatusByte();
  pStatusCharacteristic->setValue(&statusByte, 1);
  if (device_connected) {
    pStatusCharacteristic->notify();
    Serial.printf("[BLE] Broadcasted Status: 0x%02X (O1=%s, O2=%s)\n",
                  statusByte, outlet1_state ? "ON" : "OFF", outlet2_state ? "ON" : "OFF");
  }
}

// -----------------------------------------------------------------------------
// Server Connection Callbacks
// -----------------------------------------------------------------------------
class ServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) override {
    device_connected = true;
    digitalWrite(PIN_STATUS_LED, LOW); // LED ON (active LOW on Super Mini)
    Serial.println("\n[BLE] Client connected! GATT Link Established.");
  }

  void onDisconnect(BLEServer* pServer) override {
    device_connected = false;
    Serial.println("[BLE] Client disconnected. Restarting advertising...");
  }
};

// -----------------------------------------------------------------------------
// Command Characteristic Write Callback
// -----------------------------------------------------------------------------
class CommandCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* pCharacteristic) override {
    String value = pCharacteristic->getValue();
    if (value.length() == 0) return;

    uint8_t cmd = (uint8_t)value[0];
    Serial.printf("[BLE] Received Command Byte: 0x%02X -> ", cmd);

    bool stateChanged = false;

    switch (cmd) {
      case CMD_OUTLET_1_ON:
        Serial.println("OUTLET 1 -> ON");
        outlet1_state = true;
        stateChanged = true;
        break;

      case CMD_OUTLET_1_OFF:
        Serial.println("OUTLET 1 -> OFF");
        outlet1_state = false;
        stateChanged = true;
        break;

      case CMD_OUTLET_2_ON:
        Serial.println("OUTLET 2 -> ON");
        outlet2_state = true;
        stateChanged = true;
        break;

      case CMD_OUTLET_2_OFF:
        Serial.println("OUTLET 2 -> OFF");
        outlet2_state = false;
        stateChanged = true;
        break;

      case CMD_ALL_OFF:
        Serial.println("ALL OUTLETS -> OFF (Master Shutoff)");
        outlet1_state = false;
        outlet2_state = false;
        stateChanged = true;
        break;

      case CMD_ALL_ON:
        Serial.println("ALL OUTLETS -> ON (Master Power)");
        outlet1_state = true;
        outlet2_state = true;
        stateChanged = true;
        break;

      case CMD_GET_STATUS:
        Serial.println("GET_STATUS -> Query Only");
        broadcastStatus();
        return;

      default:
        Serial.println("UNKNOWN COMMAND REJECTED");
        return;
    }

    if (stateChanged) {
      applyRelayStates();
      broadcastStatus();
    }
  }
};

// -----------------------------------------------------------------------------
// Setup
// -----------------------------------------------------------------------------
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n==================================================");
  Serial.println("   NexSocket ESP32-C3 Smart Outlet Controller     ");
  Serial.println("   ADET211 Final Showcase Project Baseline        ");
  Serial.println("==================================================");

  // 1. Safe Power-On Boot Initialization
  // Drive relays to INACTIVE state BEFORE setting as OUTPUT to avoid boot click
  digitalWrite(PIN_RELAY_1, RELAY_INACTIVE_LEVEL);
  digitalWrite(PIN_RELAY_2, RELAY_INACTIVE_LEVEL);
  pinMode(PIN_RELAY_1, OUTPUT);
  pinMode(PIN_RELAY_2, OUTPUT);

  // Status indicator LED (active LOW on Super Mini)
  pinMode(PIN_STATUS_LED, OUTPUT);
  digitalWrite(PIN_STATUS_LED, HIGH); // OFF

  Serial.printf("[INIT] Relay 1 Pin: GPIO %d (Initial: OFF)\n", PIN_RELAY_1);
  Serial.printf("[INIT] Relay 2 Pin: GPIO %d (Initial: OFF)\n", PIN_RELAY_2);
  Serial.printf("[INIT] Status LED Pin: GPIO %d\n", PIN_STATUS_LED);

  // 2. Initialize BLE Peripheral
  Serial.println("[INIT] Initializing BLE Device: " DEVICE_NAME);
  BLEDevice::init(DEVICE_NAME);

  // 3. Create BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new ServerCallbacks());

  // 4. Create GATT Service
  BLEService* pService = pServer->createService(SERVICE_UUID);

  // 5. Create Command Characteristic (Write & Write Without Response)
  pCommandCharacteristic = pService->createCharacteristic(
    COMMAND_CHAR_UUID,
    BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR
  );
  pCommandCharacteristic->setCallbacks(new CommandCallbacks());

  // 6. Create Status Characteristic (Read & Notify)
  pStatusCharacteristic = pService->createCharacteristic(
    STATUS_CHAR_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
  );
  pStatusCharacteristic->addDescriptor(new BLE2902());

  // Set initial status byte
  uint8_t initialStatus = getStatusByte();
  pStatusCharacteristic->setValue(&initialStatus, 1);

  // 7. Start Service
  pService->start();

  // 8. Configure and Start BLE Advertising
  BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06); // Functions well with iPhones and Android
  pAdvertising->setMinPreferred(0x12);

  BLEDevice::startAdvertising();
  Serial.println("[BLE] Advertising started. Ready to pair with NexSocket Web App!");
  Serial.println("==================================================\n");
}

// -----------------------------------------------------------------------------
// Main Loop
// -----------------------------------------------------------------------------
void loop() {
  // Re-start advertising if connection drops
  if (!device_connected && old_device_connected) {
    delay(500); // Give bluetooth stack a moment
    pServer->startAdvertising();
    Serial.println("[BLE] Re-started advertising after disconnect.");
    old_device_connected = device_connected;
  }

  // Connection established event
  if (device_connected && !old_device_connected) {
    old_device_connected = device_connected;
  }

  // Heartbeat blink when disconnected (standby pulse)
  if (!device_connected) {
    digitalWrite(PIN_STATUS_LED, LOW);  // Blink ON
    delay(50);
    digitalWrite(PIN_STATUS_LED, HIGH); // OFF
    delay(950);
  } else {
    delay(100);
  }
}
