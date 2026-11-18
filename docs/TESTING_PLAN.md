# SmartOutlet - Testing Plan

## 1. Automated Unit Tests (Vitest)
- Protocol encoding and decoding: `tests/ble-protocol.test.js`.
- State mutation and event emission: `tests/outlet-state.test.js`.
- Command mappings and descriptions: `tests/commands.test.js`.

## 2. Interactive Mock Simulation (Browser)
- Connect/disconnect lifecycle.
- State toggling for Outlet 1 and Outlet 2.
- Global ALL OFF action.
- Confirmation dialog cancel/confirm flow.

## 3. Physical Hardware Integration (Android / ESP32)
- BLE scan discovery of `SMART_OUTLET_01`.
- GATT service and characteristic discovery.
- Physical relay state change verification.
- Disconnect & reconnect behavior.
