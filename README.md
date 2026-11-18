# NexSocket

**NexSocket** is a hybrid Android application built with HTML5, CSS3, Vanilla JavaScript, Vite, and Capacitor 8, communicating directly with an ESP32-C3 microcontroller over Bluetooth Low Energy (BLE).

## Features
- **Independent Dual-Outlet Control**: Toggle Outlet 1 and Outlet 2 independently.
- **Master Emergency Shutoff**: One-touch "Turn All OFF" with confirmation protection.
- **Offline & Direct**: Zero Wi-Fi, cloud, or backend dependencies; communicates peer-to-peer over BLE GATT.
- **Modern Smart-Home UI**: Mobile-first design using the Manrope font family and cohesive NexSocket branding.
- **Dual BLE Pipeline**:
  - `MockBleAdapter` for rapid browser development and testing without hardware.
  - `CapacitorBleAdapter` using `@capacitor-community/bluetooth-le` for production Android hardware.

## Architecture & Communication Protocol
- **Target Peripheral**: `SMART_OUTLET_01`
- **Service UUID**: `12345678-1234-5678-1234-56789abcdef0`
- **Command Characteristic UUID**: `12345678-1234-5678-1234-56789abcdef1` (Write)
- **Status Characteristic UUID**: `12345678-1234-5678-1234-56789abcdef2` (Notify / Read)

### Command Mapping
| Byte | Action |
|------|--------|
| `0x01` | Outlet 1 ON |
| `0x02` | Outlet 1 OFF |
| `0x03` | Outlet 2 ON |
| `0x04` | Outlet 2 OFF |
| `0x05` | ALL OFF |

### Status Mapping
| Byte | Outlet 1 | Outlet 2 |
|------|----------|----------|
| `0` | OFF | OFF |
| `1` | ON | OFF |
| `2` | OFF | ON |
| `3` | ON | ON |

## Getting Started
```bash
# 1. Install dependencies
npm install

# 2. Run web development server with mock BLE
npm run dev

# 3. Run automated tests (Vitest)
npm run test

# 4. Build production web bundle
npm run build

# 5. Synchronize assets to native Android container
npx cap sync android

# 6. Open project in Android Studio
npx cap open android
```
