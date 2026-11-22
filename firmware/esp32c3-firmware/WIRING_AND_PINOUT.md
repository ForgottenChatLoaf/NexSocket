# NexSocket ESP32-C3 Super Mini — Hardware & Wiring Guide
**ADET211 Final Showcase Project · Direct Bluetooth LE GATT Peripheral**

---

## 1. Hardware Pin Assignment

| Function | ESP32-C3 Pin | Type | Safe at Boot? | Description |
|---|---|---|---|---|
| **Outlet 1 Relay / LED** | **GPIO 4** | Digital Output | ✅ **YES** | Relay Channel 1 control signal (or LED 1) |
| **Outlet 2 Relay / LED** | **GPIO 5** | Digital Output | ✅ **YES** | Relay Channel 2 control signal (or LED 2) |
| **Status Indicator** | **GPIO 8** | Digital Output | ✅ Built-in | On-board blue LED on ESP32-C3 Super Mini (Active-LOW) |
| **Power Input (VCC)** | **5V / VBUS** | Power In | — | 5V from USB-C or external 5V 1A power supply |
| **Common Ground** | **GND** | Ground | — | Shared ground with relay module |

> [!IMPORTANT]
> **Why GPIO 4 and 5 instead of GPIO 2?**
> * On the ESP32-C3 RISC-V chip, **GPIO 2** is a strapping pin (`MTDO`). Pulling it HIGH or LOW during boot can interfere with the chip's internal bootloader mode selection.
> * **GPIO 4** and **GPIO 5** are pure GPIO pins with no boot-strapping restrictions, guaranteeing safe startup without hanging or boot loops.

---

## 2. Wiring Diagrams

### Option A: 2-Channel Relay Module (Final Product Wiring)

```
   ESP32-C3 Super Mini                 2-Channel 5V Relay Module
   +-------------------+                +-----------------------+
   |                5V | -------------- | VCC                   |
   |               GND | -------------- | GND                   |
   |            GPIO 4 | -------------- | IN1 (Relay Channel 1) |
   |            GPIO 5 | -------------- | IN2 (Relay Channel 2) |
   +-------------------+                +-----------------------+
```

* **Relay Active Level**: Most standard modules are **Active-LOW** (Relay closes when signal is `LOW`).
* The firmware initializes GPIO 4 and 5 to `HIGH` before setting them as outputs, ensuring relays stay **OFF** during boot and reset.

---

### Option B: Breadboard LED Testing (Safe Pre-Relay Bench Test)

If you are testing on a breadboard with bare LEDs before connecting relays:

```
   ESP32-C3 Super Mini                 Breadboard Components
   +-------------------+
   |            GPIO 4 | ---> [220Ω - 330Ω Resistor] ---> [LED 1 Anode (+)] ---> GND
   |            GPIO 5 | ---> [220Ω - 330Ω Resistor] ---> [LED 2 Anode (+)] ---> GND
   |               GND | --------------------------------------------------------> Rail (-)
   +-------------------+
```

> [!TIP]
> If testing with LEDs connected to GND (Active-HIGH), change line 45 in `NexSocket_ESP32C3.ino`:
> ```cpp
> #define RELAY_ACTIVE_LEVEL   HIGH
> #define RELAY_INACTIVE_LEVEL LOW
> ```

---

## 3. Arduino IDE Flashing Instructions

1. **Install ESP32 Board Package**:
   * Open Arduino IDE ➔ **Settings / Preferences**.
   * Add to *Additional Board Manager URLs*:
     `https://espressif.github.io/arduino-esp32/package_esp32_index.json`
   * Go to **Tools ➔ Board ➔ Boards Manager**, search for `esp32` (by Espressif Systems), and install version `2.0.14` or later (or `3.x`).

2. **Board Settings**:
   * **Board**: `ESP32C3 Dev Module` (or `AirM2M_CORE_ESP32C3` / `Nologo ESP32C3 Super Mini`)
   * **USB CDC On Boot**: `Enabled` *(Crucial for Serial Monitor debugging over USB-C)*
   * **CPU Frequency**: `160MHz`
   * **Flash Frequency**: `80MHz`
   * **Flash Mode**: `QIO`
   * **Flash Size**: `4MB`
   * **Partition Scheme**: `Default 4MB with spiffs`

3. **Flashing Procedure**:
   * Connect ESP32-C3 Super Mini to PC via USB-C.
   * Select your COM port under **Tools ➔ Port**.
   * Open `NexSocket_ESP32C3.ino` and click **Upload** (➔).
   * Open Serial Monitor at **115200 baud** to see initialization:
     ```
     ==================================================
        NexSocket ESP32-C3 Smart Outlet Controller     
        ADET211 Final Showcase Project Baseline        
     ==================================================
     [INIT] Relay 1 Pin: GPIO 4 (Initial: OFF)
     [INIT] Relay 2 Pin: GPIO 5 (Initial: OFF)
     [BLE] Advertising started. Ready to pair with NexSocket Web App!
     ```

---

## 4. Testing with NexSocket Web Application

1. Open your browser at `http://localhost:3000` (or your HTTPS deployment).
2. On the Connection Panel, switch from **`🧪 Demo Mode`** to **`⚡ Live Hardware`**.
3. Click **"Scan for Physical ESP32"**.
4. Chrome will display the native Bluetooth pairing prompt with **`SMART_OUTLET_01`**.
5. Select it and click **Pair**:
   * The web application will connect, read the current status (`0x00`), and show the 4-bar RSSI.
   * Toggle **Outlet 1** and **Outlet 2**: observe the physical relays click or LEDs light up immediately!
   * Click **Turn All ON** / **Turn All OFF** to test master controls.
