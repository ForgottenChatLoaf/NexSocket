# SmartOutlet

SmartOutlet is a hybrid Android application built with HTML5, CSS3, Vanilla JavaScript, Vite, and Capacitor 8, communicating directly with an ESP32-C3 microcontroller over Bluetooth Low Energy (BLE).

## Features
- Controls two electrical outlets independently.
- Global Emergency ALL OFF switch.
- Offline-first: requires no Wi-Fi, cloud, or backend server.
- Built-in Mock BLE adapter for browser development.
- Native Android BLE via `@capacitor-community/bluetooth-le`.

## Getting Started
```bash
# Install dependencies
npm install

# Run web development server with mock BLE
npm run dev

# Run unit tests
npm run test

# Build production assets
npm run build

# Sync assets to native Android project
npx cap sync android
```
