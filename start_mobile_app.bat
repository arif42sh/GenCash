@echo off
title GenCash Mobile App (Expo)
echo ========================================================
echo   Starting GenCash Mobile App (Expo Bundler)
echo   Current PC IP: 10.249.129.201
echo   Backend URL:   http://10.249.129.201:8000
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
npx expo start -c
pause
