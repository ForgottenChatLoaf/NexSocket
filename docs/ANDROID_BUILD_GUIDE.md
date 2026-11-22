# NexSocket Android APK — Build Guide
**Phase 9: Native Android Packaging via Capacitor**

> [!IMPORTANT]
> **Prerequisites**: Android Studio installed with Android SDK. Java 17+. Run all commands from `C:\SmartOutletApp\`.

---

## Quick Build Steps

### Step 1 — Build the web bundle

```powershell
npm run build
```

Outputs optimized bundle to `dist/`. Confirm zero warnings.

### Step 2 — Sync to Android project

```powershell
npx cap sync android
```

Copies `dist/` into `android/app/src/main/assets/public/` and updates Capacitor plugin metadata.

### Step 3 — Open Android Studio

```powershell
npx cap open android
```

This opens `C:\SmartOutletApp\android\` as an Android Studio project.

---

## Android Studio APK Build (Debug)

1. Wait for Gradle sync to complete (bottom status bar).
2. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. APK will be located at:
   ```
   android\app\build\outputs\apk\debug\app-debug.apk
   ```
4. **Run → Run 'app'** to deploy directly to a connected phone.

---

## Android Studio APK Build (Release / Signed)

> [!NOTE]
> A release APK requires a keystore. For the ADET211 defense, a debug APK is perfectly fine.

1. **Build → Generate Signed Bundle / APK**
2. Select **APK**, click **Next**
3. Create a new keystore or point to an existing one
4. Set a keystore password, key alias, and key password
5. Select **release** build variant, click **Finish**
6. Release APK at: `android\app\build\outputs\apk\release\app-release.apk`

---

## Direct ADB Install (after build)

```powershell
# Ensure USB debugging is enabled on your phone
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

---

## Capacitor BLE Plugin — Android Notes

The app uses `@capacitor-community/bluetooth-le@8.3.0`. On Android:

| Android API | Required Permissions |
|---|---|
| ≤ 30 (Android 11) | `BLUETOOTH`, `BLUETOOTH_ADMIN`, `ACCESS_FINE_LOCATION` |
| ≥ 31 (Android 12+) | `BLUETOOTH_SCAN` (neverForLocation), `BLUETOOTH_CONNECT` |

These are already declared in [`AndroidManifest.xml`](../android/app/src/main/AndroidManifest.xml).

The runtime permission dialog is triggered automatically by the BLE plugin when the user first presses **Scan for Physical ESP32** in Hardware Mode.

---

## App Identity

| Property | Value |
|---|---|
| `appId` | `com.smartoutlet.app` |
| `appName` | `NexSocket` |
| `minSdkVersion` | 24 (Android 7.0) |
| `targetSdkVersion` | 36 (Android 16) |
| `webDir` | `dist/` |
| Icon background | `#0E1117` Obsidian |
| Accent color | `#10B981` Emerald |

---

## Showcase Mode on Android

Launch the app normally. The Showcase Mode URL parameter (`?showcase=1`) is not needed on Android — instead, tap **Devices → Demo Mode → Connect** in the app UI.

Alternatively, to auto-connect on Android launch, the `Capacitor.isNativePlatform()` check in `ble-service.js` automatically routes to `CapacitorBleAdapter` in Hardware Mode.

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `ENOENT capacitor.config.json` | Run `npm run build` first, then `npx cap sync android` |
| `minifyEnabled` compilation error | Check Java 17 is set in Android Studio (File → Project Structure → SDK Location) |
| BLE scan button unresponsive on phone | Ensure Location is enabled (required by Android ≤ 11 for BLE scan) |
| White splash screen on launch | Verify `styles.xml` has `windowSplashScreenBackground` set to `#0E1117` |
| App crashes on start | Run `adb logcat -s AndroidRuntime` to view the Java stacktrace |
