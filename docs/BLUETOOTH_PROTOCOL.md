# SmartOutlet - Bluetooth Protocol Specification

## Target Device
- **Advertised Name**: `SMART_OUTLET_01`

## UUID Definitions
- **Service UUID**: `12345678-1234-5678-1234-56789abcdef0`
- **Command Characteristic UUID**: `12345678-1234-5678-1234-56789abcdef1` (Write without response / Write)
- **Status Characteristic UUID**: `12345678-1234-5678-1234-56789abcdef2` (Notify / Read)

## Command Mapping (Host -> ESP32)
| Byte (Hex) | Action |
|------------|--------|
| `0x01` | Turn Outlet 1 ON |
| `0x02` | Turn Outlet 1 OFF |
| `0x03` | Turn Outlet 2 ON |
| `0x04` | Turn Outlet 2 OFF |
| `0x05` | Turn ALL Outlets OFF |

## Status Notification Mapping (ESP32 -> Host)
| Byte (Dec/Hex) | Outlet 1 | Outlet 2 |
|----------------|----------|----------|
| `0` (`0x00`) | OFF | OFF |
| `1` (`0x01`) | ON | OFF |
| `2` (`0x02`) | OFF | ON |
| `3` (`0x03`) | ON | ON |
