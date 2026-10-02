# Appium Android

One journey on the Noah Cares APK (`com.noahcares`): the client schedules a ride, then the driver accepts it.

## Prerequisites

- Node.js 20+
- npm
- Android SDK with `adb` on `PATH`
- An emulator or a phone with USB debugging, already booted
- The Noah Cares release APK

## Setup

```powershell
git clone https://github.com/sahsankhan/mobile-appium.git
cd mobile-appium
npm install
npx appium driver install uiautomator2
copy .env.example .env
```

Put the APK at `mobile-app/noah-cares.apk`. Fill `CLIENT_EMAIL`, `CLIENT_PASSWORD`, `DRIVER_EMAIL`, and `DRIVER_PASSWORD` in `.env`. `.env` is not committed. Pickup and drop-off come from `PICKUP_QUERY` and `DROPOFF_QUERY`. Those two places must be different, and the app must be able to find them.

Start Appium and leave that window open:

```powershell
npx appium
```

## Run

In a second terminal:

```powershell
npm test
```

`npm test` writes `reports/index.html`. A failure screenshot is `reports/screenshots/failure.png`.
