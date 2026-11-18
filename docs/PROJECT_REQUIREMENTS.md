# SmartOutlet - Project Requirements

## Overview
SmartOutlet is a mobile-first web application packaged into an Android APK via Capacitor 8. It enables direct Bluetooth Low Energy (BLE) control of two simulated electrical outlets driven by an ESP32-C3 microcontroller.

## Core Capabilities
- Direct offline peer-to-peer control over BLE GATT.
- Independent toggling of Outlet 1 and Outlet 2.
- Global Emergency/All OFF switch with confirmation.
- Real-time status synchronization from ESP32 notifications.
- Zero server/backend or internet dependency during operation.

## Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+), Vite.
- **Mobile Packaging**: Capacitor 8.
- **Bluetooth Plugin**: `@capacitor-community/bluetooth-le` 8.x.
- **Testing**: Vitest.
