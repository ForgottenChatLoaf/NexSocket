# SmartOutlet - Application Architecture

```
src/
├── components/          # Reusable UI components (header, cards, dialogs)
├── pages/               # Screen orchestrators (dashboard)
├── services/
│   └── bluetooth/       # BLE adapters (Mock & Capacitor), protocol parser
├── state/               # Reactive single-direction app & outlet stores
├── styles/              # Modular CSS (variables, reset, components, responsive)
└── utils/               # Error handling, logging, validators
```

## Layer Separation
1. **Presentation Layer**: Vanilla JS DOM renderers adhering to mobile-first responsive guidelines.
2. **State Management**: Observable reactive state patterns (`OutletState`, `AppState`).
3. **Hardware Abstraction**: `BleService` delegating to `MockBleAdapter` in dev/web and `CapacitorBleAdapter` on Android.
