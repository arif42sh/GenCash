@echo off
title GenCash Mobile App (Expo)
echo ========================================================
echo   Starting GenCash Mobile App (Expo Bundler)
echo   Current PC IP: 192.168.0.133
echo   Backend URL:   http://192.168.0.133:8000
echo ========================================================
echo.
echo Forwarding ADB ports if USB phone is connected...
if exist "E:\Phone simulator\scrcpy-win64-v3.3.4\adb.exe" (
  "E:\Phone simulator\scrcpy-win64-v3.3.4\adb.exe" reverse tcp:8081 tcp:8081
  "E:\Phone simulator\scrcpy-win64-v3.3.4\adb.exe" reverse tcp:8000 tcp:8000
  echo ADB reverse configured (8081 and 8000).
)
echo.
cd /d "%~dp0mobile"
set NODE_OPTIONS=--max-old-space-size=4096
npx expo start -c
pause
